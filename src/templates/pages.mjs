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

function screenshotImg(p, id, { sizes = '300px', eager = false } = {}) {
  const s = shot(p, id);
  const base = `/assets/products/${p.slug}/${id}`;
  const { width, height } = p.screenshotSize;
  return `<img src="${base}-480.webp" srcset="${base}-480.webp 480w, ${base}-960.webp 960w" sizes="${sizes}" width="${width}" height="${height}" alt="${esc(s.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function device(p, id, opts = {}) {
  return `<div class="device${opts.className ? ` ${opts.className}` : ''}">${screenshotImg(p, id, opts)}</div>`;
}

export function statusLabel(p) {
  if (isAvailable(p)) return `Available on ${platformList(p)}`;
  if (p.status === 'coming-soon') return `Coming to ${platformList(p)}`;
  return 'In development';
}

function statusBadge(p, { onDark = false } = {}) {
  return `<span class="badge${onDark ? ' badge-dark' : ''}">${esc(statusLabel(p))}</span>`;
}

function storeCta(p, { onDark = false } = {}) {
  if (isAvailable(p)) {
    return `<a class="btn ${onDark ? 'btn-light' : 'btn-primary'}" href="${esc(p.appStoreUrl)}" rel="noopener">Download on the App Store</a>`;
  }
  return statusBadge(p, { onDark });
}

/* ---------- layout ---------- */

function header() {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/" aria-label="Norma home">${lockup({ height: 34, label: 'Norma' })}</a>
    <nav class="site-nav" aria-label="Main">
      <a href="/#products">Products</a>
      <a href="/#about">About</a>
    </nav>
  </div>
</header>`;
}

function footer(site, products) {
  const productLinks = products
    .filter((p) => p.listed && p.page)
    .map((p) => `<li><a href="${productRoute(p)}">${esc(p.name)}</a></li>`)
    .join('');
  const legal = products
    .filter((p) => p.listed && p.page)
    .flatMap((p) => [
      p.privacyUrl && `<li><a href="${esc(p.privacyUrl)}" rel="noopener">${esc(p.name)} privacy policy</a></li>`,
      p.supportUrl && `<li><a href="${esc(p.supportUrl)}" rel="noopener">${esc(p.name)} support</a></li>`,
    ])
    .filter(Boolean)
    .join('');
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a href="/" aria-label="Norma home">${lockup({ height: 30, label: 'Norma' })}</a>
      <p>${esc(site.descriptor)}</p>
    </div>
    <nav class="footer-col" aria-label="Products">
      <h2>Products</h2>
      <ul>${productLinks}</ul>
    </nav>
    <nav class="footer-col" aria-label="Company">
      <h2>Company</h2>
      <ul>
        <li><a href="/#about">About</a></li>
        <li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="Legal">
      <h2>Legal and support</h2>
      <ul>
        <li><a href="/privacy/">Website privacy</a></li>
        ${legal}
      </ul>
    </nav>
  </div>
  <div class="wrap footer-base">
    <p>&copy; ${YEAR} Norma. All rights reserved.</p>
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
<link rel="preload" href="/assets/fonts/fraunces-var-latin.woff2" as="font" type="font/woff2" crossorigin>
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

function productCard(p) {
  return `<li class="product-card">
  <a href="${productRoute(p)}">
    <img class="app-icon" src="${p.iconSmall}" width="56" height="56" alt="">
    <span class="product-card-text">
      <span class="product-card-name">${esc(p.name)}</span>
      <span class="product-card-tagline">${esc(p.tagline)}</span>
      <span class="product-card-meta">${esc(statusLabel(p))}</span>
    </span>
  </a>
</li>`;
}

export function homePage(site, products) {
  const listed = products.filter((p) => p.listed);
  const featured = listed.find((p) => p.featured);

  const featuredBlock = featured
    ? `<section class="featured" aria-labelledby="featured-title">
  <div class="wrap">
    <div class="featured-panel">
      <div class="featured-copy">
        <p class="eyebrow eyebrow-light">Featured</p>
        <h2 id="featured-title" class="featured-name">${esc(featured.name)}</h2>
        <p class="featured-headline">${esc(featured.headline)}</p>
        <p class="featured-summary">${esc(featured.summary)}</p>
        <div class="featured-actions">
          <a class="btn btn-light" href="${productRoute(featured)}">Explore ${esc(featured.name)}</a>
          ${storeCta(featured, { onDark: true })}
        </div>
      </div>
      <div class="featured-stage" aria-hidden="false">
        ${device(featured, 'meals', { className: 'device-side device-left', sizes: '(max-width: 760px) 34vw, 220px' })}
        ${device(featured, 'today', { className: 'device-main', sizes: '(max-width: 760px) 46vw, 290px', eager: true })}
        ${device(featured, 'progress', { className: 'device-side device-right', sizes: '(max-width: 760px) 34vw, 220px' })}
      </div>
    </div>
  </div>
</section>`
    : '';

  const categories = site.categories
    .map((c) => {
      const items = listed.filter((p) => p.category === c.id);
      const list = items.length
        ? `<ul class="product-list">${items.map(productCard).join('')}</ul>`
        : `<p class="category-empty">New titles will appear here as they are released.</p>`;
      return `<section class="category" aria-labelledby="cat-${c.id}">
  <div class="category-head">
    <h3 id="cat-${c.id}">${esc(c.name)}</h3>
    <p>${esc(c.description)}</p>
  </div>
  ${list}
</section>`;
    })
    .join('');

  const body = `<section class="hero">
  <div class="wrap">
    <p class="eyebrow">${esc(site.descriptor)}</p>
    <h1 class="hero-title">Software for living, working and exploring.</h1>
    <p class="hero-lede">Norma designs, builds and publishes its own products: everyday apps, intelligent tools and interactive experiences, each made to do its job well.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#products">See the products</a>
      <a class="btn btn-quiet" href="#about">About Norma</a>
    </div>
  </div>
</section>
${featuredBlock}
<section id="products" class="library" aria-labelledby="library-title">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Products</p>
      <h2 id="library-title" class="section-title">The Norma library</h2>
      <p class="section-lede">Every Norma product belongs to one of three collections.</p>
    </div>
    <div class="categories">${categories}</div>
  </div>
</section>
<section id="about" class="about" aria-labelledby="about-title">
  <div class="wrap about-grid">
    <div>
      <p class="eyebrow">About</p>
      <h2 id="about-title" class="section-title">An independent software company.</h2>
    </div>
    <div class="about-copy">
      <p>Norma develops and publishes its own software. We take each product from the first idea to release, then keep improving it once people are using it.</p>
      <p>We are independent, so we choose what to build and we answer to the people who use it. We care about clear design, plain language and respect for your data.</p>
      <p class="about-contact">Get in touch at <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p>
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

  return layout({
    site,
    products,
    title: `Norma | ${site.descriptor}`,
    description: site.description,
    path: '/',
    body,
    jsonLd,
  });
}

/* ---------- product page ---------- */

export function productPage(site, products, p) {
  const gallery = p.screenshots
    .map(
      (s) => `<li class="gallery-item">
  ${device(p, s.id, { sizes: '(max-width: 560px) 62vw, (max-width: 960px) 30vw, 180px' })}
  <p class="gallery-label">${esc(s.label)}</p>
</li>`,
    )
    .join('');

  const features = p.features
    .map(
      (f, i) => `<li class="feature">
  <p class="feature-index">${String(i + 1).padStart(2, '0')}</p>
  <h3>${esc(f.title)}</h3>
  <p>${esc(f.body)}</p>
</li>`,
    )
    .join('');

  const facts = [
    ['Platform', platformList(p)],
    ['Price', p.price],
    ['Category', p.appStoreCategory],
    ['Availability', statusLabel(p)],
  ]
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');

  const links = [
    p.supportUrl && `<a href="${esc(p.supportUrl)}" rel="noopener">Support</a>`,
    p.privacyUrl && `<a href="${esc(p.privacyUrl)}" rel="noopener">Privacy policy</a>`,
  ]
    .filter(Boolean)
    .join('');

  const note = !isAvailable(p) && p.statusNote ? `<p class="status-note">${esc(p.statusNote)}</p>` : '';

  const body = `<nav class="wrap crumbs" aria-label="Breadcrumb">
  <ol><li><a href="/#products">Products</a></li><li aria-current="page">${esc(p.name)}</li></ol>
</nav>
<section class="p-hero">
  <div class="wrap p-hero-grid">
    <div class="p-hero-copy">
      <img class="app-icon app-icon-lg" src="${p.icon}" width="88" height="88" alt="${esc(p.name)} app icon">
      <h1 class="p-title">${esc(p.name)}</h1>
      <p class="p-headline">${esc(p.headline)}</p>
      <p class="p-description">${esc(p.description)}</p>
      <div class="p-actions">
        ${storeCta(p)}
        <span class="p-meta">${esc(p.price)} &middot; ${esc(platformList(p))}</span>
      </div>
      ${note}
    </div>
    <div class="p-hero-stage">
      ${device(p, 'today', { className: 'device-main', sizes: '(max-width: 760px) 58vw, 300px', eager: true })}
      ${device(p, 'progress', { className: 'device-back', sizes: '(max-width: 760px) 46vw, 240px' })}
    </div>
  </div>
</section>
<section class="gallery" aria-labelledby="gallery-title">
  <div class="wrap">
    <h2 id="gallery-title" class="section-title section-title-sm">Inside the app</h2>
  </div>
  <ul class="gallery-track wrap" tabindex="0" aria-label="Screenshots of ${esc(p.name)}">${gallery}</ul>
</section>
<section class="features" aria-labelledby="features-title">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Features</p>
      <h2 id="features-title" class="section-title">Everything for the day, nothing in the way.</h2>
    </div>
    <ul class="feature-grid">${features}</ul>
  </div>
</section>
<section class="p-details" aria-labelledby="details-title">
  <div class="wrap details-grid">
    <div class="details-privacy">
      <p class="eyebrow">Your data</p>
      <h2 id="details-title" class="section-title section-title-sm">Your records stay yours.</h2>
      <p>${esc(p.privacy)}</p>
      <p class="disclaimer">${esc(p.disclaimer)}</p>
    </div>
    <div class="details-facts">
      <dl class="facts">${facts}</dl>
      <div class="p-links">${links}</div>
    </div>
  </div>
</section>
<section class="p-close">
  <div class="wrap p-close-inner">
    <img class="app-icon" src="${p.iconSmall}" width="56" height="56" alt="">
    <p class="p-close-title">${esc(p.name)}</p>
    <p class="p-close-tagline">${esc(p.tagline)}</p>
    ${storeCta(p)}
  </div>
</section>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: p.name,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'iOS',
    description: p.description,
    url: `${site.url}${productRoute(p)}`,
    publisher: { '@type': 'Organization', name: 'Norma', url: site.url },
    ...(isAvailable(p) ? { offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, installUrl: p.appStoreUrl } : {}),
  };

  return layout({
    site,
    products,
    title: `${p.name} | ${p.tagline} | Norma`,
    description: `${p.name} for ${platformList(p)}. ${p.summary}`,
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
    <p class="eyebrow">Legal</p>
    <h1 class="section-title">Website privacy</h1>
    <p>This website does not use cookies, analytics or tracking scripts, and it does not ask you for any personal information.</p>
    <p>The site is hosted on GitHub Pages. GitHub may keep standard server logs, such as IP addresses, to operate and secure the service. Its handling of that data is described in the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub General Privacy Statement</a>.</p>
    <p>Each Norma product has its own privacy policy, linked from its page. If you email us, we use your message only to reply.</p>
    <p>Questions: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p>
  </div>
</section>`;
  return layout({
    site,
    products,
    title: 'Website privacy | Norma',
    description: 'How the normaapps.com website handles your information.',
    path: '/privacy/',
    body,
  });
}

export function notFoundPage(site, products) {
  const body = `<section class="prose-page not-found">
  <div class="wrap prose">
    <p class="eyebrow">404</p>
    <h1 class="section-title">This page does not exist.</h1>
    <p>The link may be old or mistyped. <a href="/">Go to the homepage</a> or <a href="/#products">see the products</a>.</p>
  </div>
</section>`;
  return layout({
    site,
    products,
    title: 'Page not found | Norma',
    description: 'This page does not exist.',
    path: '/404.html',
    body,
  });
}
