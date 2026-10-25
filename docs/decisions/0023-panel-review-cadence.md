# ADR 0023 — Panel reviews are a bounded, chosen input to the backlog

**Status:** Accepted
**Date:** 2026-10-25
**Issue:** #272

## Context

Waterforge runs whole-project panel reviews: a product panel (strategic
alignment against the constitution) and an engineering panel (repository
health). Their output lives in `docs/reviews/`. Three ran in 15 days: product
panels on 2026-09-11 and 2026-09-26 and an engineering panel on 2026-09-26.

The 2026-09-26 product panel found that about half of that cycle's closed issues
traced back to one of those panels, and that both constitution rewrites were
triggered by a review. Its adversarial closing pass
(`docs/reviews/panel-product/2026-09-26/foil.md`) put the problem plainly.
Review-driven work passes **Principle 6** (_real use over assumed demand_) only
because commissioning a review is the maintainer's choice. That is "the same
'assumed demand' move, pointed inward at the governance process instead of
outward at users." The foil named governance fatigue as a likely cause of the
project's death: each panel produces about ten small, worthy issues, and the
maintainer tires of the meta-work, not the dependencies. Its prescription was a
bounded review cadence and a findings bar.

Nothing recorded the reviews as an input, so nothing limited how often they ran
or what they could add to the backlog.

## Decision

1. **Periodic self-review is a deliberate input to the backlog.** The maintainer
   chooses to run it because the public standard of care
   ([ADR 0016](0016-built-for-its-maintainer.md) decision 2) needs an outside
   view he cannot get from a user base that may number one. Choosing it is a
   reason to run a review. It is not a reason to act on every finding.

2. **The cadence is bounded: at most one product panel and one engineering panel
   per calendar quarter.** This covers the whole-project panels only. Per-change
   PR review is not counted. A second panel of the same kind in a quarter needs a
   recorded reason, such as a decision that changed the constitution.

3. **The next product panel runs after the Criterion 5 site-health window
   closes.** Scheduled site-health runs began 2026-09-07, so the rolling 90-day
   window first covers a full quarter on 2026-12-06
   ([ADR 0017](0017-maintenance-thresholds.md)). The next product panel runs on or
   after that date, so it can score all three Criterion 5 thresholds rather than
   report one as unscoreable. The engineering panel has no such dependency, and
   its next run is simply bounded by decision 2.

4. **A finding becomes an issue only if it passes the Principle 6 test.** It must
   be justified by the maintainer's own use of the app, by correctness under
   Principle 3, or by the durability of the artifact. A finding that passes none
   of those stays in the review's `proposed-issues.md`, marked not filed, and is
   not opened as an issue. "The panel flagged it" is not a fourth justification.

## Alternatives rejected

- **No cadence: review whenever it feels useful.** This is what produced three
  panels in 15 days. It leaves the volume of review-driven work set by impulse.
  That volume is what the foil said would wear the maintainer out.

- **Stop running panels.** This would close the loophole by giving up the outside
  view. The panels found real gaps, including the unfalsifiable Criterion 5 that
  [ADR 0017](0017-maintenance-thresholds.md) fixed. The trouble was how often they
  ran and that no bar governed their output, not that they ran at all.

- **A fixed schedule, for example a panel on the first of every quarter.** This
  makes review an obligation, which is the governance-for-its-own-sake pattern
  this ADR is meant to stop. A ceiling keeps the review a choice. A schedule would
  make it a chore.

## Consequences

- **Q4 2026 still has room for one product panel.** It runs on or after
  2026-12-06. The 2026-09-26 product and engineering panels both used their Q3
  2026 slots.
- **Panel output gets triaged, not just transcribed.** Proposed issues that fail
  the findings bar stay in `docs/reviews/`. A panel that files fewer issues than
  it proposes is working as intended.
- **The findings bar applies from the next panel on.** Issues already filed from
  earlier panels are not re-triaged by this ADR.
- **Nothing in the app changes.** This is a statement of process.
