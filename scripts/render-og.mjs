// Renders the 1200 x 630 social preview images into public/og/ with headless Chrome.
// Run `npm run og` after changing a product's name, tagline or screenshots, then commit the PNGs.
// Set CHROME to the browser path if it is not in the default Windows location.
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lockup } from '../src/templates/brand.mjs';
import { esc } from '../src/templates/pages.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const site = JSON.parse(await readFile(join(root, 'src/data/site.json'), 'utf8'));
const products = JSON.parse(await readFile(join(root, 'src/data/products.json'), 'utf8'));
const asset = (p) => pathToFileURL(join(root, 'src/assets', p)).href;

const css = `
@font-face { font-family: 'Inter'; src: url('${asset('fonts/inter-var-latin.woff2')}') format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: #ffffff; font-family: Inter, sans-serif; color: #1d1b17; position: relative; }
.pad { position: absolute; inset: 72px 80px; }
h1 { font-weight: 600; color: #1a1a18; letter-spacing: -0.045em; line-height: 0.94; }
.rule { position: absolute; left: 80px; right: 80px; height: 1px; background: #1a1a18; }
.screen { position: absolute; display: block; border: 8px solid #161616; border-radius: 30px; box-shadow: 0 0 0 1.5px #b9b9b6; background: #161616; }
`;

function page(body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;
}

const lead = products.find((p) => p.featured && p.page);
const shotUrl = (p, id) => asset(`products/${p.slug}/${id}-960.webp`);
const screens = (p) => {
  const [a, b, c] = p.trioScreens || ['meals', 'today', 'progress'];
  return `<img class="screen" src="${shotUrl(p, a)}" style="width: 190px; left: 640px; top: 120px">
  <img class="screen" src="${shotUrl(p, c)}" style="width: 190px; left: 930px; top: 120px">
  <img class="screen" src="${shotUrl(p, b)}" style="width: 228px; left: 766px; top: 64px; z-index: 2">`;
};

const home = page(`<div class="pad">
  ${lockup({ height: 56 })}
  <p style="position:absolute; left: 0; bottom: 0; font-size: 30px; color: #5e5e5b; letter-spacing: -0.01em">Independent software publisher</p>
</div>
${lead ? screens(lead) : ''}`);

function productOg(p) {
  return page(`<div class="pad">
    ${lockup({ height: 40 })}
    <p style="margin-top: 150px; font-size: 18px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #0f3d3d">${esc(p.statusText || '')}</p>
    <h1 style="font-size: 68px; margin-top: 18px; letter-spacing: -0.03em; line-height: 1.05">${esc(p.name)}</h1>
    <p style="font-size: 26px; margin-top: 16px; color: #5e5e5b; letter-spacing: -0.01em; max-width: 470px">${esc(p.summary)}</p>
  </div>
  ${screens(p)}`);
}

const jobs = [['home', home], ...products.filter((p) => p.page).map((p) => [p.slug, productOg(p)])];
const tmp = await mkdtemp(join(tmpdir(), 'norma-og-'));
try {
  for (const [name, html] of jobs) {
    const htmlPath = join(tmp, `${name}.html`);
    await writeFile(htmlPath, html);
    const out = join(root, 'public/og', `${name}.png`);
    execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=3000',
      `--user-data-dir=${join(tmp, 'profile')}`,
      `--screenshot=${out}`,
      pathToFileURL(htmlPath).href,
    ], { stdio: 'ignore' });
    console.log(`Wrote public/og/${name}.png`);
  }
} finally {
  await rm(tmp, { recursive: true, force: true });
}
