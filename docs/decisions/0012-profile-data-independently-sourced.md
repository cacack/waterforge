# ADR 0012 — Profile data is independently sourced; CC-BY-SA-4.0 is the project's copyleft choice

**Status:** Accepted
**Date:** 2026-05-31
**Amends:** [ADR 0001](0001-license-split.md) (data-provenance rationale only)

## Context

[ADR 0001](0001-license-split.md) (License split: GPLv3 code + CC-BY-SA-4.0
data) was accepted 2026-05-27, **before** the #67 re-sourcing effort and the
[ADR 0011](0011-library-beyond-khymos-seed.md) decision to grow the library
beyond the seed. ADR 0001 asserts that the profile data "derive from work
freely published by Martin Lersch (Khymos)" and pins the CC-BY-SA-4.0
attribution requirement to that origin.

That premise no longer holds for the dataset as a whole. After the #67 batches
landed and #98 added new verified profiles:

- **42 of 44 profiles** cite their own primary/authoritative sources (producer
  analyses, Palmer's _How to Brew_, the SCA brewing-water standard, patents,
  official sheets); 35 are `verified: true`.
- **Only 2 profiles** still derive from Khymos — `PurPur (coffee brewing)` and
  `Waiwera` — kept because their numbers are genuinely unrecoverable from any
  other source.

So Khymos is no longer the source of the _dataset_. What Khymos is still owed
credit for is the _recipe method_ — the salt priority order (`SALT_ORDER`),
driver-ion assignments, and the sequential-oracle algorithm, documented in
`docs/guides/reference-data.md` §4 as "the original Lersch/Khymos method."

The site footer (added in #83) was already corrected to "Profile data
CC-BY-SA-4.0 (per-profile sources) · Recipe method after Martin Lersch /
Khymos." This ADR brings the recorded decisions into line with that framing.

## Decision

1. **Profile data is independently sourced.** Each profile's `provenance`
   (`source`, `source_date`, primary-source `url`) is the authoritative
   attribution for that profile. New profiles are held to the #67
   authoritative-sourcing standard (see ADR 0011).

2. **CC-BY-SA-4.0 on the dataset is the project's own copyleft choice**, not an
   obligation inherited from Khymos. Raw ion concentrations are facts and are
   not themselves copyrightable; what the licence protects is the _curated
   compilation_. Applying CC-BY-SA-4.0 keeps the compilation free and copyleft
   (ShareAlike) — consistent with the founding principle — while remaining
   usable in non-software contexts.

3. **Khymos is credited for the method, not the data.** Martin Lersch /
   Khymos (https://khymos.org/) is attributed for the recipe method and
   algorithm, documented in `reference-data.md` §4 and `LICENSE-DATA`.

4. **The 2 residual Khymos-sourced profiles are the acknowledged exceptions.**
   `PurPur (coffee brewing)` and `Waiwera` remain Khymos-derived until better
   sources surface; their `provenance` records this.

ADR 0001's **license-split mechanism stands unchanged** — code is
GPL-3.0-or-later, data is CC-BY-SA-4.0, applied to disjoint artefacts. Only its
_data-provenance rationale_ is superseded by this ADR.

## Consequences

- The licence rationale now matches reality: the data is an independently-
  sourced compilation under the project's chosen copyleft, not a Khymos
  derivative.
- Per-profile source citations are the canonical attribution for the data;
  downstream reusers credit those sources and the project's compilation, and
  must release derived data under CC-BY-SA-4.0 (ShareAlike unchanged).
- Khymos attribution persists where it is actually owed — the method — via
  `reference-data.md` §4, the `LICENSE-DATA` attribution note, and the site
  footer.
- README, CONSTITUTION.md, CLAUDE.md, and LICENSE-DATA are updated to this
  framing (sibling changes in the same PR). ADR 0001 carries an amendment
  pointer to this ADR rather than being edited in place (append-only).
