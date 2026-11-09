# ADR 0025 — Cloudflare serves DNS only; the proxy stays off

**Status:** Accepted
**Date:** 2026-11-08
**Issue:** [#338](https://github.com/cacack/waterforge/issues/338) (incident
[#336](https://github.com/cacack/waterforge/issues/336))
**Amends:** [ADR 0018](0018-client-side-analytics-scope.md) (decision #3's "No
bundle change" boundary and the beacon's injection mechanism; re-examines its
"No third-party analytics" boundary);
[ADR 0017](0017-maintenance-thresholds.md) (the site-health flaky-path
rationale); [CONSTITUTION.md](../../CONSTITUTION.md) (Principle 5)

## Context

`waterforge.app` was served from GitHub Pages with the apex and `www` proxied
through Cloudflare. GitHub Pages cannot renew its Let's Encrypt certificate
while those names are proxied: the ACME authorization wedges in `bad_authz`.
That caused the 2026-09-05 outage, and the renewal attempt around 2026-11-06
wedged the same way ([#336](https://github.com/cacack/waterforge/issues/336)).
The 2026-09-07 certificate only issued because that recovery took the proxy off
for a while. With the proxy as the steady state, every ~60-day renewal wedges.
The rest of the zone configuration was clean, so nothing short of removing the
proxy fixes it.

The proxy was also how the Web Analytics beacon of
[ADR 0018](0018-client-side-analytics-scope.md) reached visitors: Cloudflare
injected it at the edge. Without the proxy, nothing injects it.

## Decision

**Every apex and `www` record is DNS-only, permanently** (set 2026-11-08).
Cloudflare is the DNS host and nothing else. GitHub Pages serves the site and
owns TLS end to end. The runbook is
[cloudflare-pages.md](../operations/cloudflare-pages.md).

**Only the official deploy build adds the beacon.** A Vite plugin adds the
Web Analytics tag when `CF_BEACON_TOKEN` is set in the environment. `deploy.yml`
sets it from the repository **variable** of that name, which forks do not
inherit. Local builds, CI `check` builds, forks and the Software Heritage
archive carry no beacon. The repository holds the hook but no token. The Web
Analytics site moves from automatic to manual install.

This replaces ADR 0018's "No bundle change" boundary. Its intent stands: a fork
or an archived copy of Waterforge carries no telemetry.

**ADR 0018's "No third-party analytics" boundary is re-examined, and holds.** It
admitted Cloudflare as "one vendor already in the serving path". With the proxy
off, Cloudflare is still the site's authoritative DNS, but visitors' page
requests no longer pass through it; the beacon is now the only reason a
visitor's browser talks to Cloudflare. That changes the route, not the vendor
or the data: the beacon still reports page loads and their coarse context to
the same vendor, and Cloudflare previously received that same IP and user agent
on every proxied request. The boundary's purpose — no second vendor, no general
opening — is untouched, so Cloudflare stays the one permitted vendor. What
changes is that the browser makes a request to a host other than the site's
own, which is the cost in the Consequences below.

The remaining ADR 0018 boundaries are unchanged: no cookies or client-side
storage, and no custom events.

## Alternatives rejected

- **Host on Cloudflare Workers static assets.** It is free at this size: static
  asset requests are unlimited, and the free plan allows 20,000 files per
  version and 25 MiB per file. Cloudflare would own TLS, and `_headers` would
  allow real CSP and HSTS response headers. It is rejected _for now_ because it
  costs a new deploy pipeline, a CI API-token secret, reworked Terraform Pages
  config, runbook and site-health checks, and puts hosting and DNS with one
  vendor. **Revisit it if response headers become a priority.**
- **Keep the proxy, and grey-cloud for a window around each renewal.** That adds
  a scheduled job with moving parts and a CI token, and it depends on guessing
  when GitHub attempts renewal. It is unreliable.
- **Drop the beacon.** The ADR 0018 measurement would stop. A build-time hook
  that only the official deploy enables keeps that measurement at no cost to
  forks.

## Consequences

- Renewal no longer depends on anyone remembering to grey-cloud. A re-proxied
  record is now the failure to watch for, and the daily site-health check fails
  if apex or `www` stops pointing at GitHub Pages.
- **No more edge counts.** Cloudflare zone HTTP analytics end 2026-11-08. The
  beacon becomes the only traffic source, and per the
  [traffic baseline](../operations/traffic-baseline.md) edge counts were mostly
  bots anyway.
- **The beacon loses a little.** A manually installed beacon reports to
  `cloudflareinsights.com` instead of the site's own domain, so ad blockers drop
  more of it. Cloudflare does not version-pin the script, so it has no SRI. The
  data it collects and its cookieless behaviour are unchanged.
- **RUM gap:** from 2026-11-08 until the first deploy that ships the hook. A
  deploy without the token still succeeds, but its Build step logs a warning.
- **site-health is stricter.** With no proxy in front, a 403 is no longer an
  expected runner artifact, so it fails like any other non-200 (this supersedes
  the Cloudflare-403 example in [ADR 0017](0017-maintenance-thresholds.md)).
- No CDN cache and no WAF. A static site with no backend loses nothing it needs
  ([ADR 0019](0019-bot-fight-mode-off.md) reached the same conclusion for bot
  management).
