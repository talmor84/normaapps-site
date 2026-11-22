// Serves dist/ locally, the way GitHub Pages does. `node scripts/serve.mjs [port]`.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 4321);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

async function file(path) {
  try {
    const s = await stat(path);
    return s.isDirectory() ? file(join(path, 'index.html')) : path;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const safe = normalize(join(dist, urlPath));
  if (!safe.startsWith(normalize(dist))) {
    res.writeHead(403).end();
    return;
  }
  const found = await file(safe);
  const target = found || join(dist, '404.html');
  res.writeHead(found ? 200 : 404, { 'content-type': types[extname(target)] || 'application/octet-stream' });
  res.end(await readFile(target));
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
