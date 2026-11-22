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
  if (isAvailable(p)) return 'On the App Store';
  if (p.statusText) return p.statusText;
  if (p.status === 'coming-soon') return `Coming to ${platformList(p)}`;
  return 'In development';
}

function screen(p, id, { sizes, eager = false, caption = false } = {}) {
  const s = shot(p, id);
  const base = `/assets/products/${p.slug}/${id}`;
  const { width, height } = p.screenshotSize;
  const img = `<img class="screen" src="${base}-480.webp" srcset="${base}-480.webp 480w, ${base}-960.webp 960w" sizes="${sizes}" width="${width}" height="${height}" alt="${esc(s.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  return caption ? `<figure class="shot">${img}<figcaption>${esc(s.label)}</figcaption></figure>` : `<figure class="shot">${img}</figure>`;
}

function storeLink(p) {
  if (!isAvailable(p)) return '';
  return `<a class="button" href="${esc(p.appStoreUrl)}" rel="noopener">Download on the App Store</a>`;
}

function meta(p) {
  return `<p class="meta"><span class="status${isAvailable(p) ? ' status-live' : ''}">${esc(statusLabel(p))}</span><span>${esc(platformList(p))}</span><span>${esc(p.price)}</span></p>`;
}

/* ---------- layout ---------- */

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/" aria-label="Norma home">${lockup({ height: 32, label: 'Norma' })}</a>
    <nav class="site-nav" aria-label="Main">
      <a href="/#products">Products</a>
      <a href="/#about">About</a>
    </nav>
  </div>
</header>`;
}

function footer(site, products) {
  const pages = products.filter((p) => p.listed && p.page);
  const productLinks = pages.map((p) => `<li><a href="${productRoute(p)}">${esc(p.name)}</a></li>`).join('');
  const legal = pages
    .flatMap((p) => [
      p.privacyUrl && `<li><a href="${esc(p.privacyUrl)}" rel="noopener">${esc(p.name)} privacy</a></li>`,
      p.supportUrl && `<li><a href="${esc(p.supportUrl)}" rel="noopener">${esc(p.name)} support</a></li>`,
    ])
    .filter(Boolean)
    .join('');
  return `<footer class="site-footer">
  <div class="wrap grid footer-grid">
    <div class="footer-brand"><a href="/" aria-label="Norma home">${lockup({ height: 26, label: 'Norma' })}</a></div>
    <nav class="footer-col" aria-label="Products"><h2>Products</h2><ul>${productLinks}</ul></nav>
    <nav class="footer-col" aria-label="Company"><h2>Company</h2><ul><li><a href="/#about">About</a></li><li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li></ul></nav>
    <nav class="footer-col" aria-label="Legal"><h2>Legal</h2><ul><li><a href="/privacy/">Website privacy</a></li>${legal}</ul></nav>
    <p class="footer-copy">&copy; ${YEAR} Norma</p>
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

function featuredProduct(p) {
  const screens = (p.homeScreens || p.screenshots.slice(0, 4).map((s) => s.id))
    .map((id, i) => screen(p, id, { sizes: '(max-width: 720px) 62vw, (max-width: 1100px) 23vw, 280px', eager: i < 2 }))
    .join('');
  return `<article class="product-feature" aria-labelledby="p-${p.slug}">
  <div class="wrap grid">
    <div class="product-feature-text">
      <img class="app-icon" src="${p.iconSmall}" width="56" height="56" alt="">
      <h3 id="p-${p.slug}" class="h2"><a href="${productRoute(p)}">${esc(p.name)}</a></h3>
      <p class="lede">${esc(p.summary)}</p>
      ${meta(p)}
      <p class="actions"><a class="text-link" href="${productRoute(p)}">View ${esc(p.name)}</a>${storeLink(p)}</p>
    </div>
  </div>
  <div class="wrap">
    <a class="screens screens-4" href="${productRoute(p)}" tabindex="-1" aria-hidden="true">${screens}</a>
  </div>
</article>`;
}

function productRow(p, site) {
  const category = site.categories.find((c) => c.id === p.category);
  return `<li class="product-row">
  <a href="${productRoute(p)}">
    <img class="app-icon" src="${p.iconSmall}" width="48" height="48" alt="">
    <span class="product-row-name">${esc(p.name)}</span>
    <span class="product-row-summary">${esc(p.summary)}</span>
    <span class="product-row-meta">${esc(category ? category.name : '')} &middot; ${esc(statusLabel(p))}</span>
  </a>
</li>`;
}

export function homePage(site, products) {
  const listed = products.filter((p) => p.listed);
  const featured = listed.find((p) => p.featured);
  const others = listed.filter((p) => p !== featured);

  const body = `<section class="hero">
  <div class="wrap grid">
    <h1 class="display">We make software.</h1>
    <p class="hero-text">${esc(site.description)}</p>
  </div>
</section>
<section id="products" class="section" aria-labelledby="products-title">
  <div class="wrap grid section-head">
    <h2 id="products-title" class="label">Products</h2>
  </div>
  ${featured ? featuredProduct(featured) : ''}
  ${others.length ? `<div class="wrap grid"><ul class="product-rows">${others.map((p) => productRow(p, site)).join('')}</ul></div>` : ''}
</section>
<section id="about" class="section" aria-labelledby="about-title">
  <div class="wrap grid">
    <h2 id="about-title" class="label">About</h2>
    <div class="about-text">
      ${featured ? `<p>${esc(featured.name)} is our first public release.</p>` : ''}
      <p>Other applications are in development in different fields. They will be listed here when they are released.</p>
      <p>Contact: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
    </div>
  </div>
</section>`;

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
        .map((sid) => screen(p, sid, { sizes: '(max-width: 720px) 62vw, (max-width: 1100px) 19vw, 220px' }))
        .join('');
      return `<section class="group" style="--n: ${g.screenshots.length}" aria-labelledby="${id}">
  <h2 id="${id}" class="group-title">${esc(g.title)}</h2>
  <p class="group-body">${esc(g.body)}</p>
  <div class="screens group-screens">${shots}</div>
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

  const body = `<section class="p-head">
  <div class="wrap grid">
    <div class="p-text">
      <img class="app-icon" src="${p.icon}" width="88" height="88" alt="${esc(p.name)} app icon">
      <h1 class="display display-product">${esc(p.name)}</h1>
      <p class="lede">${esc(p.summary)} ${esc(p.description)}</p>
      ${meta(p)}
      ${storeLink(p) ? `<p class="actions">${storeLink(p)}</p>` : ''}
    </div>
    ${p.heroScreen ? `<div class="p-hero-shot">${screen(p, p.heroScreen, { sizes: '(max-width: 900px) 62vw, 300px', eager: true })}</div>` : ''}
  </div>
</section>
<div class="p-band">
  <div class="wrap band" style="--cols: ${bandCols}">${groups}</div>
</div>
<section class="section p-info" aria-labelledby="info-title">
  <div class="wrap grid">
    <h2 id="info-title" class="label">Information</h2>
    <div class="info-body">
      <dl class="facts">${facts}</dl>
      <div class="info-privacy">
        <h3>Privacy</h3>
        <p>${esc(p.privacy)}</p>
        <p class="note">${esc(p.disclaimer)}</p>
      </div>
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
  const body = `<section class="section prose-page">
  <div class="wrap grid">
    <h1 class="label label-h1">Website privacy</h1>
    <div class="prose">
      <p>This website does not use cookies, analytics or tracking scripts, and it does not ask for personal information.</p>
      <p>It is hosted on GitHub Pages. GitHub may keep standard server logs, such as IP addresses, to operate and secure the service, as described in the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub General Privacy Statement</a>.</p>
      <p>Each Norma application has its own privacy policy, linked from its page. If you email us, we use your message only to reply.</p>
      <p>Questions: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
    </div>
  </div>
</section>`;
  return layout({ site, products, title: 'Website privacy | Norma', description: 'How the normaapps.com website handles your information.', path: '/privacy/', body });
}

export function notFoundPage(site, products) {
  const body = `<section class="hero not-found">
  <div class="wrap grid">
    <h1 class="display">Page not found.</h1>
    <p class="hero-text">The link may be old or mistyped. Go to the <a href="/">homepage</a> or see <a href="/#products">products</a>.</p>
  </div>
</section>`;
  return layout({ site, products, title: 'Page not found | Norma', description: 'This page does not exist.', path: '/404.html', body });
}
