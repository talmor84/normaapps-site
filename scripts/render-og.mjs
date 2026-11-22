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
@font-face { font-family: 'Fraunces'; src: url('${asset('fonts/fraunces-var-latin.woff2')}') format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: #ffffff; font-family: Inter, sans-serif; color: #1d1b17; position: relative; }
.pad { position: absolute; inset: 72px 80px; }
.eyebrow { font-size: 20px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #2f6e6e; }
h1 { font-family: Fraunces, serif; font-weight: 400; color: #0f3d3d; letter-spacing: -0.02em; line-height: 1.04; font-variation-settings: 'opsz' 144; }
.rule { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; background: #0f3d3d; }
.device { position: absolute; border-radius: 13% / 6%; padding: 1.6%; background: #121212; aspect-ratio: 1320 / 2868; }
.device img { width: 100%; height: 100%; border-radius: 11% / 5%; display: block; }
`;

function page(body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;
}

const home = page(`<div class="pad">
  ${lockup({ height: 56 })}
  <p class="eyebrow" style="margin-top: 92px">${esc(site.descriptor)}</p>
  <h1 style="font-size: 76px; margin-top: 22px; max-width: 900px">Software for living, working and exploring.</h1>
</div><div class="rule"></div>`);

function productOg(p) {
  const shot = (id) => asset(`products/${p.slug}/${id}-960.webp`);
  return page(`<div style="position:absolute; inset:0; right:440px">
  <div class="pad" style="right: 40px">
    ${lockup({ height: 44 })}
    <img src="${asset(p.icon.replace('/assets/', ''))}" width="88" height="88" style="margin-top: 76px; border-radius: 22.5%; display:block">
    <h1 style="font-size: 68px; margin-top: 26px">${esc(p.name)}</h1>
    <p style="font-size: 30px; margin-top: 14px; color: #6c6860">${esc(p.tagline)}</p>
  </div>
</div>
<div style="position:absolute; top:0; right:0; bottom:0; width:440px; background:#0f3d3d; overflow:hidden">
  <div class="device" style="width: 250px; left: 96px; top: 64px"><img src="${shot('today')}"></div>
</div>`);
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
