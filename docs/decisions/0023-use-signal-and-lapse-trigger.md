# ADR 0023 — Maintainer use is read quarterly, and its lapse has a written trigger

**Status:** Accepted
**Date:** 2026-10-25
**Issue:** #273
**Amends:** [ADR 0016](0016-built-for-its-maintainer.md) (makes decision 1's
"verifiable" true and adds the trigger its last consequence asks for);
[CONSTITUTION.md](../../CONSTITUTION.md) (Posture layer 3, and the
library-growth success criterion)

## Context

The 2026-09-26 product panel's adversarial pass
(`docs/reviews/panel-product/2026-09-26/foil.md`) found three criteria that
cannot be failed:

- **Maintainer use.** [ADR 0016](0016-built-for-its-maintainer.md) makes the
  maintainer's own use the load-bearing reason the project is maintained, and
  calls that claim "verifiable". Nothing verifies it. The only instrument is the
  Web Analytics beacon in
  [traffic-baseline.md](../operations/traffic-baseline.md): about 40 page loads
  on 4 days in 92.
- **Use lapse.** ADR 0016 says that if the maintainer stops using the app, the
  change "should be recorded here, not absorbed silently". It sets no trigger,
  so nothing would notice. The foil's top pre-mortem cause is exactly that: "the
  maintainer stopped using it, and nothing noticed."
- **Library growth.** The criterion says the library "grows opportunistically"
  and gives no way to fail. The panel read it as frozen: it held at **54
  profiles from 2026-06-01 to 2026-10-24**, and then grew to **81 in one day**
  (2026-10-24: #310 added 18 profiles from 17 notable waters, then 9 Crystal
  Geyser spring reports). Five quiet months and one burst are what "opportunistic"
  looks like. A failure condition on growth would have scored the quiet months
  as a failure that nobody intended.

Principle 5 rules out adding telemetry to answer the first question, and the
project needs none. The beacon is already live under
[ADR 0018](0018-client-side-analytics-scope.md), and its retention of about 13
weeks is one quarter.

## Decision

1. **The use signal is a quarterly use reading, recorded in
   [traffic-baseline.md](../operations/traffic-baseline.md#use-readings).** Each
   calendar quarter, before beacon retention drops the previous quarter, the
   maintainer adds one row with two parts:
   - **Beacon:** the number of distinct days in the quarter with any page load,
     from the existing beacon query. No new instrument.
   - **Attested:** the date the maintainer last used the app (mixed a batch or
     planned one), or "none". This is a date, not a log.

   Each part covers the other's blind spot. The beacon misses the maintainer in
   known ways: script blockers, an installed app opened offline, the local dev
   server, and sampling that reports in steps of 10, so one real load can come
   back as zero. Attestation is self-report, and the beacon is the outside
   check on it.

2. **The lapse trigger: two consecutive quarterly readings with no use.** A
   reading shows no use when the beacon reports zero page-load days **and** the
   attestation is "none" or falls before the quarter began. **A quarter with no
   reading recorded counts as a quarter with no use.** Without that rule, a
   lapse that stops the readings would also hide itself.

3. **When the trigger fires, the project enters artifact mode (Posture layer 3),
   recorded by a new ADR.** In artifact mode:
   - Maintenance is the first two thresholds of Criterion 5 and nothing else:
     high or critical advisories closed within 7 days, and Dependabot PRs closed
     within 14 days.
   - The site-health bar, new features, new profiles, and panel reviews stop.
     The site stays up for as long as hosting costs nothing.
   - The constitution's Posture section and `ROADMAP.md` are updated to say the
     project is in artifact mode.

   Leaving artifact mode is just as explicit. A recorded use reading and an ADR
   restore layer 1.

4. **The library-growth criterion has no growth failure condition, by design.**
   Under Principle 6, profiles are added when the maintainer wants one, so a
   quiet library is not a failing one. The criterion fails on quality instead:
   it fails if any shipped profile falls short of the
   [ADR 0011](0011-library-beyond-khymos-seed.md) sourcing standard. A profile
   with no source fails `validateProfile`, which the library test runs on
   every bundled profile in CI.

## Alternatives rejected

- **A private use log only**, as the foil first suggested. A reviewer can't
  check a log nobody else can see, so "verifiable" would still be false. The
  attested date is the same information, reduced to one public line per quarter.
- **Explaining the beacon's blind spots only.** That explains why the beacon
  can't decide the question, and leaves the question open.
- **Git activity as the use signal.** Commits show the maintainer working on the
  app, not using it. The 2026-09-26 panel found the recent commit log was driven
  by reviews and Dependabot, so git activity would read as "in use" even if
  nobody mixed a batch.
- **A growth floor**, such as one profile per quarter. That turns "opportunistic"
  into a quota, which Principle 6 rules out. It would also have scored June to
  October 2026 as a failure.

## Consequences

- **The first reading is the 2026-09-26 re-measurement:** page loads on 4 days,
  two of them mobile (2026-09-14 and 2026-09-22). That is consistent with the
  maintainer, but nobody attested to it, so its Attested cell is left blank. The
  next reading is due in Q4 2026. It should come from the same December pull
  that scores Criterion 5's first full site-health window.
- **Re-measuring traffic becomes a quarterly duty, not just curiosity.** The
  traffic figures themselves still justify nothing (ADR 0016). Only the
  page-load day count feeds the reading, as evidence for a fact about one
  person.
- **The trigger can fire by neglect.** If two quarters pass without a reading,
  the project is in artifact mode. That is intended: the failure it guards
  against is the one where nothing gets looked at.
- **Nothing in the app changes.** There is no new instrument, no bundle change,
  and no workflow change.
