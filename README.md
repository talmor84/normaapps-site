# normaapps.com

Source for **https://normaapps.com**, the website of Norma, an independent software publisher.

A small static site with no dependencies. A Node script reads the product data, renders the pages and writes them to `dist/`. GitHub Actions builds, checks and deploys it to GitHub Pages.

## Run it locally

Needs Node 20 or newer. Nothing to install.

```bash
npm test        # build into dist/ and run the site checks
npm run serve   # serve dist/ at http://localhost:4321
```

`npm run check:external` also requests every external link.

## Adding a product

1. Add an entry to [`src/data/products.json`](src/data/products.json). The fields:

   | Field | Meaning |
   | --- | --- |
   | `slug` | URL name. The page lives at `/products/<slug>/`. |
   | `name`, `tagline`, `summary`, `description` | Copy. Short, concrete sentences, no em dashes. |
   | `category` | `software`, `intelligence` or `experiences` (defined in `src/data/site.json`). |
   | `platforms`, `price`, `appStoreCategory` | Facts shown on the product page. |
   | `status`, `statusText` | `available`, `coming-soon` or `in-development`, plus optional precise wording such as "In App Store review". |
   | `appStoreUrl`, `externalUrl` | The store button appears only when `status` is `available` and `appStoreUrl` is set. |
   | `privacyUrl`, `supportUrl` | Linked from the product page and the footer. |
   | `featured` | Shows the product in the large homepage panel (one product at a time). |
   | `listed` | Shows the product in the homepage library. |
   | `page` | Builds a product page. |
   | `screenshots`, `screenshotSize` | Real screenshots captured from the app. |
   | `heroScreen`, `homeScreens`, `groups` | Which screenshots appear beside the title, on the homepage, and in each functional group on the product page. |
   | `icon`, `iconSmall` | App icon at 192 and 96 pixels. |

2. Put real screenshots captured from the app in a folder and run
   `python scripts/optimize_screens.py <folder> <slug>`. This only scales and re-encodes them to WebP.
3. Run `npm run og` to render the social preview image, then `npm test`.
4. Open a pull request.

Empty categories are never shown. A product appears on the homepage once `listed` is true. Checks run on every pull request; merging to `main` deploys.

When Apple approves an app, change its `status` to `available`. The App Store button then replaces "Coming to iPhone" everywhere.

## Hosting

- **Host:** GitHub Pages, source "GitHub Actions" ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)). Pushes to `main` deploy. The workflow also runs every January 1 so the footer year updates.
- **Custom domain:** `normaapps.com` (in `public/CNAME` and the Pages settings), HTTPS enforced. `www.normaapps.com` redirects to the apex.
- **DNS:** Namecheap BasicDNS. See [`docs/DNS.md`](docs/DNS.md) for the records and the change log. Email records must not be changed.
- **Cost:** $0 a month for hosting. The domain renews yearly at Namecheap.

## Layout

| Path | Purpose |
| --- | --- |
| `src/data/` | Site and product data |
| `src/templates/brand.mjs` | The canonical Norma lockup, copied exactly. Do not redraw it. |
| `src/templates/pages.mjs` | Page templates |
| `src/styles/site.css` | Styles. The design system is summarized at the top of the file. |
| `src/assets/` | Font (Inter, SIL OFL) and product images |
| `public/` | Copied as is: favicons, CNAME, social images |
| `scripts/check.mjs` | Fails on broken links, missing images or metadata, em dashes and banned names |
| `scripts/render-og.mjs` | Renders `public/og/*.png` with headless Chrome |
