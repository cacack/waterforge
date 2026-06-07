# CloudFlare in front of GitHub Pages

Waterforge is served on the custom domain **`waterforge.app`** from GitHub
Pages (see [CI/CD](./ci-cd.md)). The domain is fronted by CloudFlare with the
orange-cloud **proxy** (CDN + WAF) enabled. This page documents how to make that
combination work and how to recover when the site starts returning 404.

## Symptom: GitHub Pages 404 through the proxy

The site loads, then days later returns a **404** even though deploys are green
and `public/CNAME` is intact.

Confirm the source of the 404:

```sh
curl -sI https://waterforge.app | grep -i -E 'http/|server|x-github'
```

If the response is `404` with `server: cloudflare` **and** an `x-github-request-id`
header (plus a `content-security-policy: default-src 'none'…`), the 404 is
GitHub Pages' **own** error page, proxied back through CloudFlare. GitHub
received the request but **no longer recognizes `waterforge.app` as a configured
custom domain**.

### Root cause

With the proxy on, GitHub periodically re-verifies the custom domain by
resolving its DNS. It expects the Pages IPs (`185.199.108–111.153`) or
`cacack.github.io`; instead it sees **CloudFlare's** IPs, decides the domain is
misconfigured, and **silently clears the custom domain** from the repo's
Settings → Pages. The next request then 404s. Because this is a periodic sweep,
the site "works for a while" before breaking — it is not an SSL handshake
failure between CloudFlare and the origin.

## Fix

### Step 1 — Verify the domain at the GitHub account level (the durable fix)

This is the one step that stops the auto-unset permanently.

1. github.com → account **Settings → Pages → Verified domains → Add a domain** →
   `waterforge.app`.
2. GitHub returns a TXT record, e.g.
   `_github-pages-challenge-cacack` → `<token>`.
3. Add it in CloudFlare DNS (TXT records are always DNS-only; the proxy does not
   apply), then click **Verify**.

A _verified_ domain is immune to the auto-unset even though DNS resolves to
CloudFlare.

### Step 2 — Bootstrap GitHub's TLS certificate with the proxy off (one-time)

GitHub provisions a Let's Encrypt cert via an ACME challenge that must reach the
origin directly.

1. In CloudFlare DNS, flip the apex `A`/`AAAA` and the `www` `CNAME` to
   **DNS only (grey cloud)**.
2. In the **repo** Settings → Pages, re-enter custom domain `waterforge.app`,
   wait for "DNS check successful," then enable **Enforce HTTPS**.

### Step 3 — Re-enable the proxy with the correct SSL mode

1. Flip the DNS records back to **Proxied (orange cloud)**.
2. CloudFlare → **SSL/TLS → Overview → Full (strict)**. Never use **Flexible**
   (causes redirect loops and an unencrypted CloudFlare↔origin hop). Full
   (strict) validates because Step 2 gave the origin a valid cert.
3. **Purge the CloudFlare cache** — it caches the 404 (watch the `age:` header),
   so without a purge the fix appears not to work.

## Symptom: "Site not found" with settings that look correct

A distinct failure from the auto-unset above. The site returns 404 and
`https://waterforge.app/` shows GitHub's **"Site not found · GitHub Pages"**
page, yet `gh api repos/cacack/waterforge/pages` reports everything correct
(`cname: waterforge.app`, `protected_domain_state: verified`, an approved
certificate, `https_enforced: true`). Hitting a Pages IP directly with the right
host header still 404s:

```sh
curl -sI --resolve waterforge.app:443:185.199.108.153 https://waterforge.app
```

### Root cause

GitHub's Pages routing layer has **no active published deployment** mapped to
the hostname, even though the repo settings still record the domain. This
happens when the live deployment gets deactivated while the domain is
re-verified or the certificate is re-provisioned (e.g. during the recovery steps
above). The most recent `deploy.yml` run may still read `success` — deployment
_statuses_ are immutable history; what matters is whether the deployment is the
currently _active_ one.

### Fix — republish

Re-run the deploy workflow to re-upload and re-activate the artifact:

```sh
gh workflow run deploy.yml --ref main
gh run watch "$(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Or repo **Actions → Deploy to GitHub Pages → Run workflow → main**. Then verify
with the `curl` in [Verify the fix](#verify-the-fix). This redeploys the
current `main` build and is safe to run at any time.

## Correct CloudFlare DNS layout

| Type  | Name                             | Value                                                 | Proxy  |
| ----- | -------------------------------- | ----------------------------------------------------- | ------ |
| A     | `@`                              | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` | orange |
| AAAA  | `@`                              | `2606:50c0:8000::153` … `8003::153` (optional)        | orange |
| CNAME | `www`                            | `cacack.github.io`                                    | orange |
| TXT   | `_github-pages-challenge-cacack` | `<token from Step 1>`                                 | n/a    |

## `www` → apex redirect

`www.waterforge.app` 301-redirects to the apex `https://waterforge.app/`. This
redirect is issued by **GitHub Pages itself**, not CloudFlare: because the repo's
custom domain is the apex, GitHub treats the apex as canonical and automatically
redirects the `www` host to it. The `www` `CNAME → cacack.github.io` exists so
the request reaches GitHub Pages and the redirect can fire (proxied through
CloudFlare).

No CloudFlare redirect rule or page rule is needed, and the `CNAME` target should
stay `cacack.github.io` — a CNAME controls name resolution, not redirects, so
repointing it would not change the redirect behaviour. Verify:

```sh
curl -sI https://www.waterforge.app | grep -i -E 'http/|location'
```

Expect `HTTP/2 301` and `location: https://waterforge.app/`.

## Verify the fix

```sh
curl -sI https://waterforge.app | grep -i -E 'http/|server|x-github'
```

A `200` means GitHub recognizes the host again. A persistent GitHub 404 means
the repo's custom-domain field was cleared again — Step 1 (account verification)
is what prevents that recurring.

## Notes

- The `public/CNAME` file (`waterforge.app`) re-asserts the domain on each
  deploy and should stay in the repo; it does **not** prevent the auto-unset on
  its own.
- This is entirely a GitHub-settings + CloudFlare-dashboard fix; no code change
  is required.
