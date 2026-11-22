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

All edits on 2026-11-22, made in Namecheap → Domain List → normaapps.com → Advanced DNS:

1. Created the GitHub Pages site (`talmor84/normaapps-site`, branch `main`, root) with custom domain `normaapps.com`.
2. Deleted the `URL Redirect` record: `@` → `http://www.normaapps.com/` (Unmasked).
3. Edited the `www` CNAME from `parkingpage.namecheap.com.` to `talmor84.github.io.` (TTL 30 min). A first save briefly stored the bad value `talmor84.github.io.parkingpage.namecheap.com.`; it was corrected within a few minutes.
4. Added four A records on `@` (185.199.108.153, .109.153, .110.153, .111.153), TTL Automatic.
5. Left untouched: Mail Settings (Email Forwarding, its MX records, and the locked SPF TXT record), nameservers, DNSSEC (off), Dynamic DNS (off).

Checked after the change: the authoritative server (`dns1.registrar-servers.com`), Google 8.8.8.8 and Cloudflare 1.1.1.1 all return the four GitHub A records, and the MX records are unchanged.

## HTTPS

- GitHub had not started the certificate after 45 minutes. I removed the custom domain and added it back (Pages API), and it was approved within a minute.
- The certificate is from Let's Encrypt (CN `normaapps.com`, SAN `normaapps.com` and `www.normaapps.com`), valid until 2027-02-20. GitHub renews it automatically.
- "Enforce HTTPS" is on. All four of `http://` and `https://` on the apex and on `www` end at `https://normaapps.com/`.

## To roll back

Delete the four A records. Set the `www` CNAME back to `parkingpage.namecheap.com.`. Add a URL Redirect record `@` → `http://www.normaapps.com/` (Unmasked).
