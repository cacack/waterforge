# ADR 0019 — Bot Fight Mode is off; it protected nothing and could only cost visitors

**Status:** Accepted
**Date:** 2026-09-11
**Amends:** [ADR 0018](0018-client-side-analytics-scope.md) (decision #4, and the
"Open" consequence that deferred this)

## Context

[ADR 0018](0018-client-side-analytics-scope.md) found CloudFlare **Bot Fight
Mode** enabled with JS Detections on (`enable_js: true`), injecting a
challenge-platform script that collects browser signals and POSTs them back. It
accepted the setting on the same test it applied to the analytics beacon —
classifying automated traffic is not identifying people — but accepted it
explicitly _as undocumented-and-now-recorded, not as examined on its merits_,
and left the merits open as
[#237](https://github.com/cacack/waterforge/issues/237).

This ADR is that examination.

## What the evidence showed

**The page-load cost is real but small.** The script is 21,018 B raw (against a
419,280 B app bundle), adds three requests, and is same-origin — so it reuses the
existing connection with no extra DNS or TLS handshake — and runs in an injected
iframe, off the critical render path. **Performance was not a reason to remove
it**, and is recorded here so this is never re-opened as a speed optimisation.

**It contributed far less to the security commons than it appears.** The zone is
already proxied: every request already crosses CloudFlare's network, is already
logged, and is already visible to their classifiers. Bot Fight Mode changes
_enforcement_, not _observation_ — the threat intelligence is contributed by the
proxy, not by this setting. What it added on top was the JS Detections layer,
which is net-new data, but is collected from visitors' browsers and principally
improves a vendor's commercial product. There is no open abuse feed on the
receiving end.

**It was not stopping the bots that actually arrive.** In the 24 hours to
2026-09-11: 35 × `403` against ~4,900 responses. The WordPress scanners reached
origin and got 404s; the AI crawlers got 200s. See the
[traffic baseline](../operations/traffic-baseline.md).

## Decision

**Bot Fight Mode and its JS Detections are off** (`fight_mode: false`,
`enable_js: false`), set 2026-09-11.

The deciding argument is **risk asymmetry**, not cost and not principle. The site
receives roughly 0.4 human page loads per day while the setting was issuing about
35 blocks per day. Nearly all of those were certainly bots — but free-tier Bot
Fight Mode is known for false positives on VPNs, Tor, unusual browsers and
privacy-hardened setups, and a turned-away visitor never files a bug. So:

- **A false positive** turns away a real person — possibly one of the handful
  arriving all quarter — from an app that promises _private by default_, and
  does so invisibly.
- **A false negative** gives a scanner a 404 from a static site with no
  database, no login, no origin compute, and nothing to take.

The second costs nothing. The first costs a meaningful fraction of the entire
human audience. Removing a browser-fingerprinting probe from a privacy-first,
offline-capable app is also simply more coherent with what the project claims to
be.

**This would flip if the shape of the site changed.** A login form, an API, or
metered origin compute would make the trade run the other way.

**It is not the lever for AI crawlers.** If keeping AI crawlers off the content
ever becomes the goal, `ai_bots_protection` and `crawler_protection` are the
targeted switches — both currently `disabled`. This decision does not foreclose
that and should not be read as ruling on it.

## Consequences

- One of the two client-side scripts CloudFlare injected is gone. The analytics
  beacon of [ADR 0018](0018-client-side-analytics-scope.md) is unaffected and
  still reporting — the two settings are independent, and this was verified after
  the change.
- Verified after the change: no `challenge-platform` request on page load, the
  site returns 200, and the app renders.
- The composition sample in the
  [traffic baseline](../operations/traffic-baseline.md) was taken **while Bot
  Fight Mode was still on**. Later comparisons must account for that; the 403
  line in particular should fall close to zero.
- Nothing in the app bundle changed, in keeping with ADR 0018's boundaries.
- Reversing this is a dashboard toggle, so the cost of being wrong is near zero
  in either direction.
