// Builds the static site into dist/. No dependencies: run with `node src/build.mjs`.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homePage, notFoundPage, privacyPage, productPage, productRoute } from './templates/pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const readJson = async (p) => JSON.parse(await readFile(join(root, p), 'utf8'));
const site = await readJson('src/data/site.json');
const products = await readJson('src/data/products.json');

validate(site, products);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(join(root, 'public'), dist, { recursive: true });
await cp(join(root, 'src/assets'), join(dist, 'assets'), { recursive: true });
await cp(join(root, 'src/styles/site.css'), join(dist, 'assets/site.css'));

const write = async (rel, content) => {
  const target = join(dist, rel);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content);
};

await write('index.html', homePage(site, products));
await write('privacy/index.html', privacyPage(site, products));
await write('404.html', notFoundPage(site, products));

const pages = products.filter((p) => p.page);
for (const p of pages) {
  await write(`${productRoute(p).slice(1)}index.html`, productPage(site, products, p));
}

const urls = ['/', ...pages.filter((p) => p.listed).map(productRoute), '/privacy/'];
await write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')}
</urlset>
`,
);
await write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
await write(
  'site.webmanifest',
  JSON.stringify(
    {
      name: 'Norma',
      short_name: 'Norma',
      start_url: '/',
      display: 'browser',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);

console.log(`Built ${3 + pages.length} pages into dist/`);

function validate(site, products) {
  const categories = new Set(site.categories.map((c) => c.id));
  const statuses = new Set(['available', 'coming-soon', 'in-development']);
  const slugs = new Set();
  const required = ['slug', 'name', 'category', 'platforms', 'status', 'tagline', 'summary'];
  for (const p of products) {
    for (const key of required) {
      if (p[key] == null || p[key] === '') throw new Error(`Product ${p.slug || '?'} is missing "${key}"`);
    }
    if (slugs.has(p.slug)) throw new Error(`Duplicate product slug ${p.slug}`);
    slugs.add(p.slug);
    if (!categories.has(p.category)) throw new Error(`Product ${p.slug} has unknown category ${p.category}`);
    if (!statuses.has(p.status)) throw new Error(`Product ${p.slug} has unknown status ${p.status}`);
    if (p.status === 'available' && !p.appStoreUrl && !p.externalUrl) {
      throw new Error(`Product ${p.slug} is available but has no store or external URL`);
    }
    if (p.page) {
      const ids = [p.heroScreen, ...(p.homeScreens || []), ...(p.groups || []).flatMap((g) => g.screenshots)];
      for (const id of ids.filter(Boolean)) {
        if (!p.screenshots.some((s) => s.id === id)) throw new Error(`${p.slug} points at missing screenshot ${id}`);
      }
    }
  }
}
