# CloudFlare in front of GitHub Pages

Waterforge is served on the custom domain **`waterforge.app`** from GitHub
Pages (see [CI/CD](./ci-cd.md)). The domain is fronted by CloudFlare with the
orange-cloud **proxy** (CDN + WAF) enabled. This page documents how to make that
combination work and how to recover when the site starts returning 404 or a
CloudFlare **526**.

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

**Both names must be grey.** GitHub orders a _single_ certificate covering
`waterforge.app` **and** `www.waterforge.app`, and an ACME order succeeds or
fails as a unit. Leaving `www` proxied while the apex is DNS-only is enough to
wedge issuance for both names. Check before starting — a proxied `www` answers
as an `A` record pointing at CloudFlare, a DNS-only one reveals the underlying
`CNAME`:

```sh
ns=$(dig +short NS waterforge.app | head -1)
dig +short @"$ns" waterforge.app A
dig +short @"$ns" www.waterforge.app
```

Expect the four `185.199.108-111.153` Pages IPs for the apex and
`cacack.github.io.` for `www`.

### Step 3 — Re-enable the proxy with the correct SSL mode

1. Flip the DNS records back to **Proxied (orange cloud)**.
2. CloudFlare → **SSL/TLS → Overview → Full (strict)**. Never use **Flexible**
   (causes redirect loops and an unencrypted CloudFlare↔origin hop). Full
   (strict) validates because Step 2 gave the origin a valid cert.
3. **Purge the CloudFlare cache** — it caches the 404 (watch the `age:` header),
   so without a purge the fix appears not to work.

## Symptom: CloudFlare 526 (Invalid SSL certificate)

CloudFlare's own error page — **"Invalid SSL certificate", error code 526** —
with the _Host_ leg marked red. Deploys are green and the custom domain is still
configured; what has failed is the TLS handshake between CloudFlare and the
GitHub Pages origin.

Confirm by reading the origin certificate directly, bypassing the proxy:

```sh
echo | openssl s_client -connect 185.199.108.153:443 -servername waterforge.app 2>/dev/null \
  | openssl x509 -noout -subject -dates
```

An expired `notAfter` confirms it. Then ask GitHub why renewal stalled:

```sh
gh api repos/cacack/waterforge/pages --jq '.https_certificate'
```

### Root cause

GitHub renews the Pages Let's Encrypt certificate automatically, roughly 30 days
before expiry. When that ACME authorization fails repeatedly the certificate
state sticks at **`bad_authz`** — _"The ACME authorization is in a bad state. We
need to start over."_ GitHub neither recovers on its own nor warns anyone, so
the existing certificate simply runs out. The usual trigger is one of the two
certificate names becoming unreachable for the ACME challenge — most easily
`www`, which is quietly re-proxied more often than the apex. Because
[SSL/TLS mode is Full (strict)](#step-3--re-enable-the-proxy-with-the-correct-ssl-mode),
CloudFlare then refuses the expired origin certificate and returns 526.

Note the roughly one-month gap between the renewal wedging and the site actually
going down — everything looks healthy to visitors for that whole window, which is
what [Monitoring](#monitoring) exists to close.

### Fix — restart the ACME authorization

`bad_authz` does not clear by waiting or by re-running the DNS check; the custom
domain has to be removed and re-added so GitHub begins a fresh authorization.
That is [Step 2](#step-2--bootstrap-githubs-tls-certificate-with-the-proxy-off-one-time)
performed again:

1. CloudFlare DNS → flip the apex `A`/`AAAA` and the `www` `CNAME` to **DNS only
   (grey cloud)** so the ACME challenge reaches Pages directly.
2. Repo **Settings → Pages** → uncheck **Enforce HTTPS**, clear the custom
   domain, **Save**.
3. Wait ~30s, re-enter `waterforge.app`, **Save**, then poll until the
   certificate issues (usually minutes):

   ```sh
   gh api repos/cacack/waterforge/pages --jq '.https_certificate.state'
   ```

   Re-check **Enforce HTTPS** once it reads `approved`.

4. Flip DNS back to **Proxied (orange cloud)** and confirm SSL/TLS is **Full
   (strict)**.
5. Purge the CloudFlare cache, then [verify](#verify-the-fix).

Do not run `terraform apply` against `git-repositories` while the custom domain
is cleared — that module asserts `cname = "waterforge.app"` and would fight the
recovery. Once the domain is re-added the value matches again and no drift
remains.

#### When the remove/re-add does not clear it

Verified on 2026-09-07: it does not always work. With DNS confirmed correct on
both names (`A`, `AAAA` and the `www` `CNAME` all resolving to Pages, no `CAA`
record restricting Let's Encrypt), the domain was cleared, left cleared for
**11 minutes** until the certificate record read `none`, and re-added. The state
returned to `bad_authz` within one second and had not moved 45 minutes later.

A `bad_authz` that reappears _instantly_ on re-add means GitHub is restoring a
persisted certificate record rather than starting a new ACME order.

Deleting the whole Pages site does not clear it either. Also verified on
2026-09-07, and this is the decisive test:

```sh
gh api -X DELETE repos/cacack/waterforge/pages          # site gone; GET now 404s
gh api -X POST repos/cacack/waterforge/pages --input - <<'JSON'
{"source": {"branch": "main", "path": "/"}, "build_type": "workflow"}
JSON
gh api repos/cacack/waterforge/pages --jq '.https_certificate.state'  # -> null
gh api -X PUT repos/cacack/waterforge/pages --input - <<'JSON'
{"cname": "waterforge.app"}
JSON
gh api repos/cacack/waterforge/pages --jq '.https_certificate.state'  # -> bad_authz
```

The freshly created site genuinely reports `null` — then attaching the domain
restores `bad_authz` in one second. **The certificate record is keyed to the
domain, not to the repository's Pages site**, so it survives deleting the site
and lives above anything the repo owner can reach through the API or the
Settings UI.

**There is no self-serve fix. Open a GitHub Support ticket** and ask them to
reset the ACME authorization for the domain. Do not keep cycling: each attempt
consumes Let's Encrypt's failed-validation allowance (5 per hostname per hour),
making the eventual genuine attempt more likely to fail.

Deleting the Pages site also destroys the published deployment. If you do run
this test, republish afterwards per [Fix — republish](#fix--republish) and set
the custom domain again explicitly — for `build_type: workflow` the artifact's
`public/CNAME` does **not** restore it by itself, which is branch-build
behaviour only.

#### Stopgap: serve through CloudFlare while the origin cert is broken

**`waterforge.app` cannot fall back to HTTP.** The `.app` TLD is HSTS-preloaded
at the registry level, which `waterforge.app` inherits:

```sh
curl -s "https://hstspreload.org/api/v2/status?domain=waterforge.app"
# {"name":"waterforge.app","status":"preloaded","preloadedDomain":"app"}
```

Browsers therefore force HTTPS and offer **no click-through** past an expired
certificate. Grey-clouded with a dead origin cert, the site is hard-down for
real users even while `curl http://waterforge.app/` happily returns 200 — do not
read that 200 as "partly working."

The only fast way back up without a valid origin certificate is to let
CloudFlare terminate TLS with its own (valid) edge certificate:

1. Flip apex and `www` back to **Proxied (orange cloud)**.
2. CloudFlare → **SSL/TLS → Overview → Full** — deliberately _not_ Full
   (strict), which is what rejects the expired origin cert with a 526. Still
   never **Flexible**.
3. Purge the CloudFlare cache.

This is a temporary deviation from [Step 3](#step-3--re-enable-the-proxy-with-the-correct-ssl-mode).
It restores the site for visitors but stops validating the origin, so
CloudFlare↔origin is encrypted but unauthenticated. **Return to Full (strict)
as soon as the certificate is issued.** Because the SSL/TLS mode is per-zone and
`waterforge.app` is its own zone, this does not weaken `theclonchs.com`.

Note that Full masks the expired origin certificate from anything probing the
public URL — the end-to-end `200` check goes green while the origin is still
broken. The [monitoring](#monitoring) certificate checks read the Pages API and
the origin certificate directly rather than through the proxy, so they keep
telling the truth in this state; a naive uptime check would not.

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

## Monitoring

[`site-health.yml`](../../.github/workflows/site-health.yml) runs daily and opens
an issue (deduplicated by title, auto-closed on recovery) when any check fails:

| Check                                   | Catches                                                               |
| --------------------------------------- | --------------------------------------------------------------------- |
| Pages certificate state is `approved`   | A wedged renewal (`bad_authz`) ~30 days before it becomes an outage   |
| Origin certificate has >21 days left    | Renewal that silently stopped running                                 |
| `https://waterforge.app/` returns `200` | Everything else — the 404 auto-unset, a 526, a deactivated deployment |

The first check gives the earliest warning, but reading the Pages API depends on
`GITHUB_TOKEN` having access; if that read fails the workflow logs a warning
rather than filing an issue. The origin-certificate check is the backstop — it
needs no API access and still fires roughly 21 days before an outage, because
GitHub renews at ~30 days and a wedged renewal shows up as a shrinking window.

## Notes

- The `public/CNAME` file (`waterforge.app`) re-asserts the domain on each
  deploy and should stay in the repo; it does **not** prevent the auto-unset on
  its own.
- This is entirely a GitHub-settings + CloudFlare-dashboard fix; no code change
  is required.
