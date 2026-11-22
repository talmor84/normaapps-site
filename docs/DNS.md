# normaapps.com DNS

Registrar: Namecheap. Nameservers: Namecheap BasicDNS (`dns1.registrar-servers.com`, `dns2.registrar-servers.com`).

## Original configuration (observed 2026-11-22, before any change)

These are the public lookups against 8.8.8.8, made before anything was edited.

| Host | Type | Value | Notes |
| --- | --- | --- | --- |
| `@` | A | `162.255.119.61` | Namecheap URL-redirect / parking |
| `www` | CNAME | `parkingpage.namecheap.com` | Namecheap parking page |
| `@` | MX | `eforward1–3.registrar-servers.com` (10), `eforward4` (15), `eforward5` (20) | Namecheap email forwarding |
| `@` | TXT | `v=spf1 include:spf.efwd.registrar-servers.com ~all` | SPF for email forwarding |
| `@` | NS | `dns1/dns2.registrar-servers.com` | |

No AAAA record. No other verification records were visible.

## Target configuration (GitHub Pages)

| Host | Type | Value | TTL |
| --- | --- | --- | --- |
| `@` | A | `185.199.108.153` | Automatic |
| `@` | A | `185.199.109.153` | Automatic |
| `@` | A | `185.199.110.153` | Automatic |
| `@` | A | `185.199.111.153` | Automatic |
| `www` | CNAME | `talmor84.github.io.` | Automatic |

Removed: the parking `URL Redirect` record on `@` and the `www` CNAME to `parkingpage.namecheap.com`.

Kept unchanged: the email-forwarding MX records and the SPF TXT record.

## Change log

- **2026-11-22:** Created the GitHub Pages site with custom domain `normaapps.com`.
- DNS edits are logged below as they are made.
