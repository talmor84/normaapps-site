# normaapps.com

Source for **https://normaapps.com**, the corporate site of Norma, an independent software publisher.

Right now this is a temporary placeholder page. It is kept apart from Norma's application repositories on purpose.

## Hosting

- **Host:** GitHub Pages (free), deployed from the `main` branch root of this repository.
- **Custom domain:** `normaapps.com` (set in `CNAME`), with HTTPS enforced. `www.normaapps.com` redirects to the apex.
- **DNS:** Namecheap BasicDNS (`dns1/dns2.registrar-servers.com`). See [`docs/DNS.md`](docs/DNS.md) for the records and the change log.
- **Cost:** $0/month for hosting. The domain renews yearly at Namecheap.

## Update and redeploy

```bash
git clone https://github.com/talmor84/normaapps-site.git
cd normaapps-site
# edit index.html (or replace the whole site)
git commit -am "Update site"
git push
```

GitHub Pages rebuilds automatically on every push to `main`, usually within a minute. Check progress with:

```bash
gh api repos/talmor84/normaapps-site/pages/builds/latest --jq .status
```

## Replacing the placeholder with the full site

- **Plain HTML:** replace the files in the repository root.
- **Built framework (Astro, Next static export, and so on):** switch Pages to "GitHub Actions" as the source and add a build workflow.

Either way, keep the `CNAME` file (or the custom domain setting), or the domain will detach.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Placeholder page. Self-contained, no external requests, no analytics. |
| `404.html` | Not-found page |
| `favicon.svg` | Tab icon |
| `CNAME` | Custom domain for GitHub Pages |
| `docs/DNS.md` | Original DNS records and every change made |
