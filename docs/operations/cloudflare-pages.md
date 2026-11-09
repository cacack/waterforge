# Cloudflare DNS for GitHub Pages

Waterforge is served on the custom domain **`waterforge.app`** from GitHub
Pages (see [CI/CD](./ci-cd.md)). Cloudflare hosts the DNS zone and nothing else.
Every record is **DNS only** (grey cloud), so requests go straight to Pages, and
Pages owns TLS, including its Let's Encrypt certificate.

**Do not turn the proxy back on.** Pages cannot renew its certificate through
it. [ADR 0025](../decisions/0025-cloudflare-dns-only.md) records the decision,
and [History](#history) has the background.

**An HTTPS failure is a hard outage.** The `.app` TLD is HSTS-preloaded at the
registry level, which `waterforge.app` inherits:

```sh
curl -s "https://hstspreload.org/api/v2/status?domain=waterforge.app"
# {"name":"waterforge.app","status":"preloaded","preloadedDomain":"app"}
```

Browsers therefore force HTTPS and offer **no click-through** past an expired
certificate. With a dead certificate the site is down for real users even while
`curl http://waterforge.app/` returns 200. Do not read that 200 as "partly
working."

## DNS layout

| Type  | Name                             | Value                                                 | Proxy    |
| ----- | -------------------------------- | ----------------------------------------------------- | -------- |
| A     | `@`                              | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` | DNS only |
| AAAA  | `@`                              | `2606:50c0:8000::153` … `8003::153`                   | DNS only |
| CNAME | `www`                            | `cacack.github.io`                                    | DNS only |
| TXT   | `_github-pages-challenge-cacack` | `<token from account verification>`                   | n/a      |

GitHub orders a **single** certificate covering `waterforge.app` and
`www.waterforge.app`, and an ACME order succeeds or fails as a unit, so both
names matter. Check them against the authoritative nameserver. A proxied `www`
answers as an `A` record pointing at Cloudflare, while a DNS-only one shows the
`CNAME`:

```sh
ns=$(dig +short NS waterforge.app | head -1)
dig +short @"$ns" waterforge.app A
dig +short @"$ns" waterforge.app AAAA
dig +short @"$ns" www.waterforge.app
```

Expect the four `185.199.108-111.153` Pages IPs for the apex, the
`2606:50c0:800[0-3]::153` addresses for `AAAA`, and `cacack.github.io.` for
`www`. The daily [site-health check](#monitoring) runs the same comparison.

## Domain verification at the account level

`waterforge.app` is verified on the GitHub account, which stops another
account's Pages site from claiming it, including while the repo's custom domain
is cleared during the [recovery below](#fix--restart-the-acme-authorization).
To set it up again:

1. github.com → account **Settings → Pages → Verified domains → Add a domain** →
   `waterforge.app`.
2. GitHub returns a TXT record, e.g.
   `_github-pages-challenge-cacack` → `<token>`.
3. Add it in Cloudflare DNS, then click **Verify**.

## Symptom: certificate stuck in `bad_authz`

GitHub renews the Pages certificate automatically, roughly 30 days before
expiry. When the ACME authorization fails repeatedly, the certificate state
sticks at **`bad_authz`**: _"The ACME authorization is in a bad state. We need
to start over."_ GitHub does not recover from it on its own and warns no one,
so the existing certificate runs out about a month later. Visitors see nothing
wrong in between, which is the gap [Monitoring](#monitoring) closes.

Check the state, and the certificate actually being served:

```sh
gh api repos/cacack/waterforge/pages --jq '.https_certificate'
echo | openssl s_client -connect 185.199.108.153:443 -servername waterforge.app 2>/dev/null \
  | openssl x509 -noout -subject -dates
```

The known cause is a proxied record. Check the [DNS layout](#dns-layout)
first; if any apex or `www` record is proxied, set it to DNS only before
anything else.

### Fix — restart the ACME authorization

`bad_authz` does not clear by waiting or by re-running the DNS check. The custom
domain has to be removed and re-added so GitHub starts a fresh authorization.
**Do it through the Settings UI.** On both 2026-09-07 and 2026-11-08, re-adding
the domain through the API returned `bad_authz` instantly, and a remove/re-add
in the UI issued the certificate.

1. Confirm both names match the [DNS layout](#dns-layout).
2. Repo **Settings → Pages** → clear the custom domain, **Save**. Leave
   **Enforce HTTPS** alone: GitHub refuses to change it while the certificate is
   unissued (the API answers `404` "certificate has not finished being issued").
3. Wait a few minutes, re-enter `waterforge.app`, **Save**, then poll until the
   certificate issues (usually minutes):

   ```sh
   gh api repos/cacack/waterforge/pages --jq '.https_certificate.state'
   ```

4. Once it reads `approved`, confirm **Enforce HTTPS** is checked and re-check
   it if not.
5. Clearing the domain can deactivate the live deployment. If HTTPS serves
   "Site not found", [republish](#symptom-site-not-found-with-settings-that-look-correct).
   This happened on 2026-11-08.
6. [Verify](#verify-the-fix).

Do not run `terraform apply` against `git-repositories` while the custom domain
is cleared. That module asserts `cname = "waterforge.app"` and would fight the
recovery. Once the domain is re-added the value matches again and no drift
remains.

#### When the remove/re-add does not clear it

**Space the attempts out.** Let's Encrypt allows 5 failed validations per
hostname per hour. Once that allowance is spent, every further attempt fails
instantly however correct the configuration is, which looks exactly like a
permanently wedged authorization. Rapid cycling keeps the allowance exhausted.
If a remove/re-add has not issued a certificate within ~15 minutes, leave the
domain configured with DNS correct, wait at least an hour, and try once more
through the Settings UI. Escalate to GitHub Support only after several
well-spaced attempts have failed.

Do not delete the Pages site to reset it. On 2026-09-07 a freshly created site
reported `https_certificate.state: null`, but attaching the domain restored
`bad_authz` one second later. **The certificate record is keyed to the domain,
not to the repository's Pages site.** Deleting the site destroys the published
deployment and gains nothing. If you ever do recreate it: for `build_type:
workflow` the artifact's `public/CNAME` does **not** restore the custom domain
on republish (that is branch-build behaviour only), so set the domain
explicitly.

## Symptom: "Site not found" with settings that look correct

The site returns 404 and `https://waterforge.app/` shows GitHub's **"Site not
found · GitHub Pages"** page, yet `gh api repos/cacack/waterforge/pages` reports
everything correct (`cname: waterforge.app`, `protected_domain_state: verified`,
an approved certificate, `https_enforced: true`).

### Root cause

GitHub's Pages routing layer has **no active published deployment** mapped to
the hostname, even though the repo settings still record the domain. This
happens when the live deployment gets deactivated while the domain is
re-verified or the certificate is re-provisioned, as in the recovery above. The
most recent `deploy.yml` run may still read `success`. Deployment _statuses_ are
immutable history; what matters is whether the deployment is the currently
_active_ one.

### Fix — republish

Re-run the deploy workflow to re-upload and re-activate the artifact:

```sh
gh workflow run deploy.yml --ref main
gh run watch "$(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Or repo **Actions → Deploy to GitHub Pages → Run workflow → main**. Then
[verify](#verify-the-fix). This redeploys the current `main` build and is safe
to run at any time.

## `www` → apex redirect

`www.waterforge.app` 301-redirects to the apex `https://waterforge.app/`. GitHub
Pages issues this redirect itself: because the repo's custom domain is the apex,
GitHub treats the apex as canonical and redirects the `www` host to it. The
`www` `CNAME → cacack.github.io` exists so the request reaches GitHub Pages and
the redirect can fire.

No Cloudflare redirect rule or page rule is needed, and the `CNAME` target
should stay `cacack.github.io`. A CNAME controls name resolution, not
redirects, so repointing it would not change the redirect behaviour. Verify:

```sh
curl -sI https://www.waterforge.app | grep -i -E 'http/|location'
```

Expect `HTTP/2 301` and `location: https://waterforge.app/`.

## Verify the fix

```sh
curl -sI https://waterforge.app | grep -i -E 'http/|server|x-github'
```

Expect `200` with `server: GitHub.com`. A GitHub 404 means the custom domain
was cleared or the deployment deactivated; see
["Site not found"](#symptom-site-not-found-with-settings-that-look-correct).

## Monitoring

[`site-health.yml`](../../.github/workflows/site-health.yml) runs daily and opens
an issue (deduplicated by title, auto-closed on recovery) when any check fails:

| Check                                   | Catches                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Pages certificate state is `approved`   | A wedged renewal (`bad_authz`) ~30 days before it becomes an outage          |
| Origin certificate has >21 days left    | Renewal that silently stopped running                                        |
| DNS points at GitHub Pages              | A re-proxied or repointed apex or `www` record, before renewal wedges        |
| `https://waterforge.app/` returns `200` | Everything else, such as a cleared custom domain or a deactivated deployment |

Of the certificate checks, the state check gives the earliest warning, but
reading the Pages API depends on `GITHUB_TOKEN` having access; if that read fails the workflow
logs a warning rather than filing an issue. The origin-certificate check is the
backstop. It needs no API access and still fires roughly 21 days before an
outage, because GitHub renews at ~30 days and a wedged renewal shows up as a
shrinking window.

## History

Until 2026-11-08 the apex and `www` were proxied through Cloudflare (CDN and
WAF), with SSL/TLS set to Full (strict). Pages could not renew its certificate
through the proxy, so every ~60-day renewal wedged in `bad_authz`. That caused
the 2026-09-05 outage, and the 2026-11 renewal hit the same wedge
([#336](https://github.com/cacack/waterforge/issues/336)). Recovery each time
meant taking the proxy off. On 2026-11-08 it came off for good;
[ADR 0025](../decisions/0025-cloudflare-dns-only.md) records why, and which
alternatives were rejected.

The proxy was also what injected the Web Analytics beacon
([ADR 0018](../decisions/0018-client-side-analytics-scope.md)) and supplied the
edge counts in [traffic-baseline.md](./traffic-baseline.md). The beacon is now
added by the official deploy build. The edge counts end on 2026-11-08.

## Notes

- The `public/CNAME` file (`waterforge.app`) stays in the repo.
- This is entirely a GitHub-settings and Cloudflare-dashboard runbook; no code
  change is required for any recovery here.
