import { lockup } from './brand.mjs';

const YEAR = new Date().getFullYear();

export const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* ---------- product helpers ---------- */

export const productRoute = (p) => `/products/${p.slug}/`;
const shot = (p, id) => p.screenshots.find((s) => s.id === id);
const isAvailable = (p) => p.status === 'available' && Boolean(p.appStoreUrl);
const platformList = (p) => p.platforms.join(' and ');

export function statusLabel(p) {
  if (isAvailable(p)) return 'Available on the App Store';
  if (p.statusText) return p.statusText;
  if (p.status === 'coming-soon') return `Coming to ${platformList(p)}`;
  return 'In development';
}

const ARROW = '<svg class="arrow" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

function screenImg(p, id, { sizes, eager = false }) {
  const s = shot(p, id);
  const base = `/assets/products/${p.slug}/${id}`;
  const { width, height } = p.screenshotSize;
  return `<img src="${base}-480.webp" srcset="${base}-480.webp 480w, ${base}-960.webp 960w" sizes="${sizes}" width="${width}" height="${height}" alt="${esc(s.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function phone(p, id, opts) {
  return `<div class="phone${opts.className ? ` ${opts.className}` : ''}">${screenImg(p, id, opts)}</div>`;
}

/* Three phones: the middle one in front, two supporting screens behind it. */
function phoneTrio(p, ids, eager) {
  const [left, center, right] = ids;
  return `<div class="trio">
  ${phone(p, left, { className: 'phone-side phone-left', sizes: '(max-width: 760px) 62vw, 240px' })}
  ${phone(p, center, { className: 'phone-center', sizes: '(max-width: 760px) 62vw, 290px', eager })}
  ${phone(p, right, { className: 'phone-side phone-right', sizes: '(max-width: 760px) 62vw, 240px' })}
</div>`;
}

function primaryAction(p, { onProductPage = false } = {}) {
  if (isAvailable(p)) {
    return `<a class="button" href="${esc(p.appStoreUrl)}" rel="noopener"><span>Download on the App Store</span>${ARROW}</a>`;
  }
  if (onProductPage) return '';
  return `<a class="button" href="${productRoute(p)}"><span>View ${esc(p.name)}</span>${ARROW}</a>`;
}

/* ---------- layout ---------- */

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/" aria-label="Norma home">${lockup({ height: 48, label: 'Norma' })}</a>
    <nav class="site-nav" aria-label="Main">
      <a href="/#products">Products</a>
      <a href="/#about">About</a>
    </nav>
  </div>
</header>`;
}

function footer(site, products) {
  const pages = products.filter((p) => p.listed && p.page);
  const links = [
    ...pages.map((p) => `<a href="${productRoute(p)}">${esc(p.name)}</a>`),
    `<a href="/privacy/">Website privacy</a>`,
    ...pages.flatMap((p) => [
      p.privacyUrl && `<a href="${esc(p.privacyUrl)}" rel="noopener">${esc(p.name)} privacy</a>`,
      p.supportUrl && `<a href="${esc(p.supportUrl)}" rel="noopener">${esc(p.name)} support</a>`,
    ]),
  ].filter(Boolean);
  return `<footer id="about" class="site-footer">
  <div class="wrap">
    <div class="footer-main">
      <p>Norma is an independent software publisher.</p>
      <a class="footer-email" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
    </div>
    <div class="footer-small">
      <nav aria-label="Footer">${links.join('')}</nav>
      <p>&copy; ${YEAR} Norma</p>
    </div>
  </div>
</footer>`;
}

export function layout({ site, products, title, description, path, ogImage = '/og/home.png', body, jsonLd }) {
  const url = `${site.url}${path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#ffffff">
<meta name="color-scheme" content="light">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Norma">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
${header()}
<main id="main">
${body}
</main>
${footer(site, products)}
</body>
</html>
`;
}

/* ---------- home ---------- */

function featured(p) {
  const ids = p.trioScreens || ['meals', 'today', 'progress'];
  return `<section class="feature" aria-labelledby="feature-title">
  <div class="wrap feature-grid">
    <div class="feature-text">
      <p class="eyebrow">${esc(statusLabel(p))}</p>
      <h2 id="feature-title" class="title">${esc(p.name)}</h2>
      <p class="summary">${esc(p.summary)}</p>
      <p class="feature-action">${primaryAction(p)}</p>
    </div>
    ${phoneTrio(p, ids, true)}
  </div>
</section>`;
}

function devCard(p) {
  const img = p.cardImage
    ? `<img class="card-image" src="${p.cardImage.src}" width="${p.cardImage.width}" height="${p.cardImage.height}" alt="${esc(p.cardImage.alt)}" loading="lazy" decoding="async">`
    : '';
  return `<li class="card card-${esc(p.cardTone || 'teal')}${p.cardImage ? '' : ' card-text-only'}">
  <div class="card-text">
    <h3>${esc(p.name)}</h3>
    <p class="card-summary">${esc(p.summary)}</p>
    <p class="card-meta"><span class="tag">${esc(statusLabel(p))}</span><span class="card-note">${esc([platformList(p), p.nameNote].filter(Boolean).join(' · '))}</span></p>
  </div>
  ${img}
</li>`;
}

export function homePage(site, products) {
  const listed = products.filter((p) => p.listed);
  const lead = listed.find((p) => p.featured);
  const dev = listed.filter((p) => p !== lead && p.status === 'in-development');

  const body = `<h1 class="visually-hidden">Norma, independent software publisher</h1>
<div id="products">
${lead ? featured(lead) : ''}
${
  dev.length
    ? `<section class="dev" aria-labelledby="dev-title">
  <div class="wrap dev-grid">
    <div class="dev-intro">
      <h2 id="dev-title" class="section-title">In development</h2>
      <p>Applications we are building now. They are not available yet.</p>
    </div>
    <ul class="cards">${dev.map(devCard).join('')}</ul>
  </div>
</section>`
    : ''
}
</div>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Norma',
    url: site.url,
    logo: `${site.url}/icon-512.png`,
    email: site.email,
    description: site.description,
  };

  return layout({ site, products, title: `Norma | ${site.descriptor}`, description: site.description, path: '/', body, jsonLd });
}

/* ---------- product page ---------- */

export function productPage(site, products, p) {
  const groups = (p.groups || [])
    .map((g) => {
      const id = `g-${g.title.toLowerCase()}`;
      const shots = g.screenshots
        .map((sid) => phone(p, sid, { sizes: '(max-width: 760px) 62vw, (max-width: 1100px) 19vw, 220px' }))
        .join('');
      return `<section class="group" style="--n: ${g.screenshots.length}" aria-labelledby="${id}">
  <h3 id="${id}" class="group-title">${esc(g.title)}</h3>
  <p class="group-body">${esc(g.body)}</p>
  <div class="group-phones">${shots}</div>
</section>`;
    })
    .join('');
  const bandCols = (p.groups || []).reduce((n, g) => n + g.screenshots.length, 0);

  const facts = [
    ['Availability', statusLabel(p)],
    ['Platform', platformList(p)],
    ['Price', p.price],
    ['Category', p.appStoreCategory],
    ['Publisher', 'Norma'],
  ]
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');

  const links = [
    p.privacyUrl && `<li><a href="${esc(p.privacyUrl)}" rel="noopener">Privacy policy</a></li>`,
    p.supportUrl && `<li><a href="${esc(p.supportUrl)}" rel="noopener">Support</a></li>`,
    isAvailable(p) && `<li><a href="${esc(p.appStoreUrl)}" rel="noopener">App Store</a></li>`,
  ]
    .filter(Boolean)
    .join('');

  const action = primaryAction(p, { onProductPage: true });
  const body = `<section class="feature" aria-labelledby="p-title">
  <div class="wrap feature-grid">
    <div class="feature-text">
      <img class="app-icon" src="${p.icon}" width="72" height="72" alt="${esc(p.name)} app icon">
      <p class="eyebrow">${esc(statusLabel(p))}</p>
      <h1 id="p-title" class="title">${esc(p.name)}</h1>
      <p class="summary">${esc(p.summary)}</p>
      <p class="detail">${esc(p.description)}</p>
      ${action ? `<p class="feature-action">${action}</p>` : ''}
    </div>
    ${phoneTrio(p, p.trioScreens || ['meals', 'today', 'progress'], true)}
  </div>
</section>
<section class="band-section" aria-labelledby="band-title">
  <div class="wrap">
    <h2 id="band-title" class="section-title">Inside the app</h2>
    <div class="band" style="--cols: ${bandCols}">${groups}</div>
  </div>
</section>
<section class="info" aria-labelledby="info-title">
  <div class="wrap info-grid">
    <h2 id="info-title" class="section-title">Information</h2>
    <div class="info-body">
      <dl class="facts">${facts}</dl>
      <h3 class="info-heading">Privacy</h3>
      <p>${esc(p.privacy)}</p>
      <p class="disclaimer">${esc(p.disclaimer)}</p>
      <ul class="link-list">${links}</ul>
    </div>
  </div>
</section>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: p.name,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'iOS',
    description: `${p.summary} ${p.description}`,
    url: `${site.url}${productRoute(p)}`,
    publisher: { '@type': 'Organization', name: 'Norma', url: site.url },
    ...(isAvailable(p) ? { offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, installUrl: p.appStoreUrl } : {}),
  };

  return layout({
    site,
    products,
    title: `${p.name} | ${p.tagline} | Norma`,
    description: `${p.summary} ${p.description}`,
    path: productRoute(p),
    ogImage: `/og/${p.slug}.png`,
    body,
    jsonLd,
  });
}

/* ---------- simple pages ---------- */

export function privacyPage(site, products) {
  const body = `<section class="prose-page">
  <div class="wrap prose">
    <h1 class="title title-sm">Website privacy</h1>
    <p>This website does not use cookies, analytics or tracking scripts, and it does not ask for personal information.</p>
    <p>It is hosted on GitHub Pages. GitHub may keep standard server logs, such as IP addresses, to operate and secure the service, as described in the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub General Privacy Statement</a>.</p>
    <p>Each Norma application has its own privacy policy, linked from its page. If you email us, we use your message only to reply.</p>
    <p>Questions: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
  </div>
</section>`;
  return layout({ site, products, title: 'Website privacy | Norma', description: 'How the normaapps.com website handles your information.', path: '/privacy/', body });
}

export function notFoundPage(site, products) {
  const body = `<section class="prose-page not-found">
  <div class="wrap prose">
    <h1 class="title title-sm">Page not found</h1>
    <p>The link may be old or mistyped. Go to the <a href="/">homepage</a>.</p>
  </div>
</section>`;
  return layout({ site, products, title: 'Page not found | Norma', description: 'This page does not exist.', path: '/404.html', body });
}
