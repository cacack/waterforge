# ADR 0017 — Principle 5 bans tracking people, not counting page loads

**Status:** Accepted
**Date:** 2026-09-11
**Amends:** [CONSTITUTION.md](../../CONSTITUTION.md) (Principle 5 — the
"no telemetry" clause)

## Context

[#232](https://github.com/cacack/waterforge/issues/232) asked for a traffic
baseline and framed a decision: pull server-side edge counts only, or enable
CloudFlare Web Analytics — noting that the latter injects a client-side beacon
and would therefore "need an ADR, since that _is_ a client-side script and sits
close enough to Principle 5 to deserve a record."

Investigating it turned up three things the issue did not anticipate.

**1. The beacon was already live, and had been for months.** CloudFlare Web
Analytics was enabled for `waterforge.app` on **2026-05-29** with automatic
installation. It injects at the edge on requests that look like browser
navigations, so it appears in no repository file and costs the bundle nothing —
which is precisely why it went unnoticed. It is working: it has recorded page
loads on four days since June. The decision this ADR records was, in practice,
taken silently three and a half months ago and never written down.

**2. It is not the only client-side script CloudFlare injects.** Bot Fight Mode
is enabled on the zone with JS Detections on (`enable_js: true`), which serves a
challenge-platform script that collects browser signals and POSTs them back.
That is client-side code of a more invasive character than the analytics beacon,
it predates it, and it was equally unrecorded.

So Principle 5's flat claim — _"No servers, accounts, or telemetry"_ — has been
factually untrue for some time, on two counts. Whatever is decided about the
beacon, the constitution could not be left saying that.

**3. The edge counts cannot answer the question by themselves.** The
[traffic baseline](../operations/traffic-baseline.md) found that roughly 2,000
requests/day — 68% of a sampled day — are the project's own uptime checks, with
AI crawlers and exploit scanners on top. Against that floor, an arrival of fifty
real humans a day is a ~2% wobble, inside normal variance. Server-side counts
are structurally incapable of detecting modest human traffic on this zone. The
beacon's `bot` flag and `refererHost` dimension are the only measurements
available that separate a person from a crawler.

## Decision

### 1. Principle 5's telemetry ban is about **tracking people**

The prohibition exists to keep Waterforge from building profiles of, or
following, the people who use it. It does not prohibit counting anonymous,
aggregate page loads. The test is not _"does any script run in the visitor's
browser?"_ — the whole app is a script that runs in the visitor's browser. The
test is:

> **Can the project, or the vendor on its behalf, distinguish or re-identify an
> individual visitor?**

If no, it is aggregate measurement and Principle 5 permits it. If yes, it is
tracking and Principle 5 forbids it, regardless of how useful it would be.

### 2. CloudFlare Web Analytics stays enabled

It passes the test above on the evidence available:

- **The data the project can see contains no individual.** The RUM dataset
  exposes only `bot`, `countryName`, `deviceType`, `navigationType`,
  `deliveryType`, `refererHost`/`Path`/`Scheme`, `requestHost`/`Path`/`Scheme`,
  `userAgentBrowser`, `userAgentOS`, `siteTag` and time buckets. There is **no
  IP address, no visitor identifier, and no session identifier** in it. Nothing
  in the schema can single out a person.
- **It is vendor-documented as cookieless**, and the injected tag carries no
  storage configuration.
- **Counts are sampled** and returned in multiples of ten, which further
  precludes reasoning about individuals.

**Verification limit, recorded honestly:** the beacon's own source could not be
audited from the environment this ADR was written in — the CDN host was
unreachable, so the client-side behaviour claim rests on vendor documentation
and on the shape of the data, not on reading the script. Confirming it in
browser devtools (no cookie set, no `localStorage` key written) is a loose end,
not a settled fact.

### 3. The boundaries that make this reversible

The decision is scoped, and any of these being breached re-opens it:

- **No bundle change.** Injection stays at the edge. The beacon must remain
  absent from the repository and from `dist/`, so a fork or an archived copy of
  Waterforge carries no telemetry at all. This preserves
  [continuity](../operations/continuity.md) and the artifact-preservation
  backstop of [ADR 0016](0016-built-for-its-maintainer.md).
- **No cookies, no client-side storage, no cross-site identifiers.** If the
  vendor ever changes this, the beacon goes.
- **No custom events, no user-defined tags, no funnel or session instrumentation.**
  Page loads and their coarse context, nothing more. Instrumenting _behaviour_
  inside the app would be tracking by the test above.
- **No third-party analytics.** This decision is about one vendor already in the
  serving path, not a general opening.

### 4. Bot Fight Mode's JS Detections is accepted on the same test, separately

It collects browser signals to classify automated traffic, not to identify
people, and it serves an availability purpose rather than a measurement one. It
is recorded here because it was undocumented, not because #232 asked about it.
Whether the protection it buys is worth the injected script on a static site
with no backend is a fair question, and an open one — see
[Consequences](#consequences).

### 5. None of this justifies any work

Restating [ADR 0016](0016-built-for-its-maintainer.md) decision #5, because a
measurement page is exactly where the rule gets forgotten: effort is justified by
the maintainer's own use, by correctness under Principle 3, or by the durability
of the artifact. **Never by an audience**, measured or assumed. The beacon makes
the audience _visible_; it does not make it _load-bearing_.

## Consequences

- Principle 5's wording changes from a claim that is false to one that is true
  and testable. The constitution now says what is actually running.
- The project can tell, for the first time, whether a real person has used the
  app — and the answer today is "essentially no one," which is
  [recorded](../operations/traffic-baseline.md) and changes nothing.
- If promotion ever happens, `refererHost` will show whether it worked. The
  beacon is not retroactive, so having it on now is what makes that possible
  later.
- **Open:** whether Bot Fight Mode earns its script. A static site fronted by a
  CDN has little to protect; turning it off would remove the more invasive of
  the two injected scripts. Not decided here — it is an availability and cost
  question, not a privacy-principle one, and it deserves its own issue.
- **Open:** the devtools confirmation noted in decision #2.
