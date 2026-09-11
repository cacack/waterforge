# ADR 0016 — Waterforge is built for its maintainer, and finished to a public standard

**Status:** Accepted
**Date:** 2026-09-11
**Amends:** [CONSTITUTION.md](../../CONSTITUTION.md) (the Audience section; adds
the Posture section, Principle 6, and "How intent is recorded")

## Context

The 2026-09-11 product panel's adversarial closing pass
(`docs/reviews/panel-product/2026-09-11/foil.md`) found that the constitution
says who Waterforge is **for** and never says how the project would know it is
reaching them. The evidence, re-verified against the GitHub API on the day this
ADR was written:

- 0 stars, 0 forks, 0 watchers.
- **4 repo views / 1 unique visitor** in the trailing 14 days.
- All 60 issues ever filed authored by `cacack`. The profile-request and question
  templates have never been used by a non-maintainer.

The panel's charge was that the project is "written like a product and operated
like a personal tool," and that the gap between those two is where wasted effort
lives. [#216](https://github.com/cacack/waterforge/issues/216) asked for a ruling
between three postures: artifact preservation, product with users, or personal
tool.

**What the three-option framing got wrong.** The panel's objection was never to
_building_ like a product. It was to _justifying maintenance with "serving
users"_ when the user count is unknown and probably one. The fix is therefore not
to pick a label but to relocate the load-bearing justification — from an
unprovable claim about an audience to a verifiable one about the maintainer. Once
that move is made, none of the three options describes the project accurately.

**On the false constraint.** The foil also noted that Principle 5's ban on
telemetry is a _client_-side ban. Server-side edge request counts never touch a
user's browser and violate no principle, so the traffic question is answerable.
It is simply not decisive here: no plausible number changes the answer below,
which is why this decision was taken without waiting for one. The measurement is
tracked separately, as curiosity rather than justification.

**Already closed by the time of this ADR**, so they are not re-litigated here:
the repo `homepageUrl` now points at waterforge.app; #217 and #218 shipped the
carbonation honesty fixes; [ADR 0015](0015-carbonation-target-sourcing-bar.md)
records the sourcing reversal; #224 shipped the copyleft durability work. Those
four were paid off with a visitor count of one — which is itself evidence for the
posture recorded below.

## Decision

1. **Waterforge is built for its maintainer, who actively uses it.** That is the
   load-bearing justification for its existence and its maintenance, it is
   verifiable, and it requires no audience. The constitution's Audience section
   is rewritten to say so, and to mark the homebrewer/water-hobbyist description
   as the project's **aim** rather than a measured population.

2. **The public standard of care is a chosen standard, not a debt.** The
   constitution, the ADR log, per-profile CC-BY-SA sourcing, golden tests to six
   decimal places, `SECURITY.md`, the PWA — all of it stays. It exists because
   the maintainer wanted the app he would have wanted to stumble upon. Nothing
   about layer 1 licenses letting that slip.

3. **Artifact preservation is the backstop, not the headline.** Should the
   maintainer's own use end, the sourced profile compilation and a correct solver
   remain worth preserving on their own — copyleft, forkable, archived (#224).
   This justifies maintenance in the absence of _any_ user, including the
   maintainer. It is a floor, not the reason the work happens.

4. **Serving a user base would be a new decision.** If users arrive, that is
   good, and it would be recorded here when it happens. It is not assumed today,
   and **no work is owed to a hypothetical audience.**

5. **The operative rule is Principle 6** — _real use over assumed demand_. Effort
   is justified by the maintainer's own use of the app, by correctness under
   Principle 3, or by the durability of the artifact. Never by an assumed
   audience. The rule is in the Principles list, not only in prose, because that
   list is what gets consulted and cited during triage.

6. **Intent is recorded in a hierarchy** — constitution > decisions (ADRs) >
   architecture and code > issues and roadmap — now stated in the constitution's
   "How intent is recorded" section. It was the project's working convention
   already (`CONTRIBUTING.md` documents the ADR-supersedes-ADR mechanic but not
   the hierarchy above it), and this ADR depends on it: the constitution holds
   the ethos, this document holds the reasoning.

## Alternatives rejected

- **Product with users.** Rejected on evidence. Adopting it would make discovery
  the quarter's headline work — posting where homebrewers and specialty-coffee
  people actually read, and demoting everything else. That work is not going to
  happen, so declaring it would write a check the roadmap will not cash, which
  reinstates the exact product-language/personal-operation gap the panel named.

- **Personal tool, flatly.** Rejected as false, not merely unflattering. It
  under-claims: nobody writes a constitution, sixteen ADRs, per-profile
  authoritative sourcing, a golden-test suite, and a security policy for a
  personal tool. Honestly adopting it would mean closing most of the open backlog
  as won't-fix, and that will not happen either. Decisions 1 and 2 together say
  what this option was reaching for, without the false part.

- **Artifact preservation as the headline.** The most defensible of the three on
  its own terms — it needs no user count — and the one the foil argued for. But
  it is incomplete: it explains why the work would _still_ be worth doing if the
  maintainer walked away, not why it happens now. Kept, demoted to decision 3.

## Consequences

- **Triage gets a test.** "Users might want this" stops being a reason. #27
  (teaspoon mode, closed not-planned) stays closed — its re-evaluation trigger,
  "enough demand from users without a precise scale," fails Principle 6 as
  written and should be reread as a maintainer-need trigger. Conversely,
  [#220](https://github.com/cacack/waterforge/issues/220) (link `USAGE.md` from
  the app) passes: the maintainer wants it reachable.

- **[#222](https://github.com/cacack/waterforge/issues/222)'s premise is
  settled.** "Grow the water library" should be demoted from _active direction_
  to opportunistic: profiles get added when the maintainer wants one, and a
  standing backlog is not owed to anyone. The wording change is #222's work, not
  this ADR's.

- **[#223](https://github.com/cacack/waterforge/issues/223)'s framing is
  settled.** Success criterion 5's threshold should be expressed as "installable
  and correct whenever it is reached for," not as a service level offered to
  users. The threshold itself is #223's work.

- **Traffic metrics become curiosity.** Measuring waterforge.app is worth doing
  and violates no principle, but under Principle 6 a number can never be the
  justification for maintenance — and so it can never be an argument against it
  either. This ADR is explicitly not contingent on any figure.

- **Nothing in the app changes.** This is a statement of intent. The solver, the
  data, the licences, and the deployment are untouched.

- **The claim is falsifiable, which is the point.** If the maintainer stops using
  the app, layer 1 no longer holds and only the backstop does. That would be a
  real change in posture and should be recorded here, not absorbed silently.
