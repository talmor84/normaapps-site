// Checks the built site in dist/. Run after the build: `node scripts/check.mjs`.
// Add --external to also request every external link.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const checkExternal = process.argv.includes('--external');
const problems = [];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

async function resolveInternal(url) {
  const path = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (path === '') return true;
  const target = join(dist, path);
  if (path.endsWith('/')) return exists(join(target, 'index.html'));
  return (await exists(target)) || exists(join(target, 'index.html'));
}

const files = await walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const textFiles = files.filter((f) => /\.(html|css|xml|txt|webmanifest|json|svg)$/.test(f));
const external = new Set();

// Copy rules: no em or en dashes, no legal entity name, no link to the old domain.
const banned = [
  [/—|&mdash;|&#8212;/, 'em dash'],
  [/–|&ndash;|&#8211;/, 'en dash'],
  [/Tal\s*ADI/i, 'legal entity name'],
  [/norma-adi/i, 'old domain'],
  [/Norma Apps/, '"Norma Apps" brand name'],
  [/testflight/i, 'TestFlight link'],
];

for (const file of textFiles) {
  const rel = relative(dist, file).split(sep).join('/');
  if (rel.startsWith('assets/fonts/')) continue;
  const text = await readFile(file, 'utf8');
  for (const [re, label] of banned) {
    if (re.test(text)) problems.push(`${rel}: contains ${label}`);
  }
}

for (const file of htmlFiles) {
  const rel = relative(dist, file).split(sep).join('/');
  const html = await readFile(file, 'utf8');

  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${rel}: missing <title>`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) problems.push(`${rel}: missing description`);
  if (!/<html lang="en">/.test(html)) problems.push(`${rel}: missing lang`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${rel}: should have exactly one <h1>`);

  const og = html.match(/<meta property="og:image" content="https:\/\/normaapps\.com([^"]+)">/);
  if (!og) problems.push(`${rel}: missing og:image`);
  else if (!(await exists(join(dist, og[1])))) problems.push(`${rel}: og:image ${og[1]} not found`);

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) problems.push(`${rel}: image without width and height: ${tag.slice(0, 80)}`);
    if (!/\salt="/.test(tag)) problems.push(`${rel}: image without alt: ${tag.slice(0, 80)}`);
  }

  const refs = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])),
  ];
  for (const ref of refs) {
    if (/^(mailto:|tel:)/.test(ref)) continue;
    if (/^https?:\/\//.test(ref)) {
      if (ref.startsWith('https://normaapps.com/')) {
        const local = ref.slice('https://normaapps.com'.length);
        if (!(await resolveInternal(local))) problems.push(`${rel}: absolute link to missing page ${ref}`);
      } else {
        external.add(ref);
      }
      continue;
    }
    if (ref.startsWith('#')) {
      const id = ref.slice(1);
      if (id && !html.includes(`id="${id}"`)) problems.push(`${rel}: anchor ${ref} has no target`);
      continue;
    }
    if (!ref.startsWith('/')) {
      problems.push(`${rel}: relative link ${ref} (use root-relative paths)`);
      continue;
    }
    if (!(await resolveInternal(ref))) problems.push(`${rel}: broken link ${ref}`);
    const hash = ref.split('#')[1];
    if (hash && ref.startsWith('/#')) {
      const home = await readFile(join(dist, 'index.html'), 'utf8');
      if (!home.includes(`id="${hash}"`)) problems.push(`${rel}: anchor ${ref} has no target on the homepage`);
    }
  }
}

if (checkExternal) {
  for (const url of external) {
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'follow' });
      if (res.status >= 400) problems.push(`external ${url}: HTTP ${res.status}`);
    } catch (err) {
      problems.push(`external ${url}: ${err.message}`);
    }
  }
}

if (problems.length) {
  console.error(`Site check failed with ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`Site check passed: ${htmlFiles.length} pages, ${external.size} external links${checkExternal ? ' (all reachable)' : ' (not requested)'}.`);
