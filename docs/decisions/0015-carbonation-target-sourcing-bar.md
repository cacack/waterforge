# ADR 0015 — Carbonation targets may be sourced estimates, because the UI now says so

**Status:** Accepted
**Date:** 2026-09-11
**Amends:** [ADR 0013](0013-still-sparkling-and-carbonation-target.md)
(the sourcing bar: decision #5, and the "same authoritative bar as ion data"
clause of decision #2)

## Context

[ADR 0013](0013-still-sparkling-and-carbonation-target.md) (2026-05-31)
introduced `carbonation_target` and closed with decision #5:

> **Seed only what can be authoritatively sourced.** … `carbonation_target` is
> left **unset on every profile**: no bottled-carbonation figure (volumes or
> g/L) is authoritatively available in the current sources — they report source
> CO₂ or a label minimum, not a bottled target. Unset is the honest default;
> targets are not estimated.

Issue #132 ("Research and populate carbonation targets for all sparkling
profiles") then populated five profiles. Only one — **Gerolsteiner** — met the
bar, on a producer-published figure ("7 g Kohlensäure pro Liter"). The other
four — **Perrier**, **Badoit**, **San Pellegrino**, **Topo Chico** — shipped
`verified: false`, each self-labelled "Estimate" in its own provenance and
sourced to secondary industry, clone-recipe, or hobbyist comparisons.

That is a direct reversal of decision #5, and it went unrecorded for three
months. The 2026-09-11 product panel found it
(`docs/reviews/panel-product/2026-09-11/trust.md`) and correctly called it a
breach of Principle 4 — _deviations are documented decisions, not silent
reinventions._ This ADR is that record.

**Why the original rule could not hold.** ADR 0013 assumed the ion-data bar from
[ADR 0011](0011-library-beyond-khymos-seed.md) transfers to carbonation. It does
not, and the difference is structural rather than a matter of effort:

- **Ion analyses are published.** Bottlers publish water-analysis sheets because
  regulators require them. An authoritative primary source almost always exists,
  so "drop what you cannot source" costs the library very little.
- **Bottled carbonation is not.** It is a process parameter, not a regulated
  disclosure. Producers publish source CO₂ (a spring-analysis figure) or a label
  minimum — neither of which is the bottled target, and ADR 0013 decision #3
  rightly forbids deriving one from the other.

So the ion rule, applied unchanged to carbonation, does not mean "a high bar."
It means the field stays permanently empty for every force-carbonated water, and
the feature built on it never works for the waters people most want to clone.
The alternative to a sourced estimate here is not a better number; it is no
number at all.

**What changed to make estimates safe.** When ADR 0013 was written, an estimate
would have been indistinguishable from a producer-published figure in the UI:
the recipe readout rendered `→ N.N psi` with no provenance at all. Under those
conditions "do not estimate" was the only honest policy available.

That is no longer true. Issues #217 and #218 (2026-09-11) changed the readout:

- A target readout now carries the **carbonation figure's own** provenance and
  shows a verified/unverified badge with the source text — the same pattern
  `TargetSection.svelte` uses for ion data. An estimate now presents _as_ an
  estimate, with its reasoning visible.
- A sparkling profile with **no** target now renders an explicit "no sourced
  carbonation target for this water yet" instead of rendering nothing, so an
  absent figure reads as absent rather than as "still".

The relaxation below is licensed by that surfacing, and only by it. The honesty
moved from the data layer to the screen, where the user actually is.

## Decision

1. **`carbonation_target` may be populated from a sourced estimate**, shipped
   `verified: false`. ADR 0013 decisions #1, #3 and #4 stand unchanged — in
   particular #3, that `co2` and `carbonation_target` are never derived from one
   another. Decision #2's _structure_ also stands (a self-contained object that
   cannot hold a value without its unit and provenance); only its clause holding
   that provenance "to the same authoritative bar as ion data (ADR 0011 /
   ADR 0012)" is superseded, together with the seeding rule in #5. Those two
   clauses are the same rule stated twice, and they are what this ADR replaces.

2. **An estimate must meet the estimate bar**, which is not the ion bar. It must:
   - state in `provenance.source` that it **is** an estimate, in those words;
   - name the actual sources it converges from (independent carbonation
     measurements, clone/industry figures) — not an unattributed number;
   - state explicitly that it is **not** derived from the profile's source CO₂;
   - record a `source_date`; and
   - say it should be replaced if the producer ever publishes a figure.

   The four #132 estimates already do all five; this codifies the standard they
   set rather than inventing a new one.

3. **`verified: true` remains reserved for a producer-published bottled figure**
   (the Gerolsteiner case). An estimate never earns it, however well corroborated.

4. **Unset remains the default.** An estimate is permitted, never required. A
   carbonation figure that cannot meet the estimate bar is still left unset, and
   13 of the 18 sparkling profiles are correctly in that state today. "We don't
   know" stays a first-class answer.

5. **This relaxation is contingent on the UI surfacing it.** If a future change
   renders a carbonation target without its provenance, this ADR's premise is
   void and decision #5 of ADR 0013 should be reinstated. The surfacing is the
   compensating control, not a nicety — it is pinned by tests in
   `src/carbonation-readout.test.ts`.

## Consequences

- The five #132 targets are retroactively in-policy, and the decision log now
  matches the shipped data.
- The carbonation feature works for the force-carbonated waters people actually
  clone (Perrier, Topo Chico, San Pellegrino) rather than only for the rare
  producer that publishes a figure.
- **The ion bar is untouched.** ADR 0011's "candidates that cannot be sourced to
  this standard are dropped, not seeded" still governs ion data, and this ADR is
  not a precedent for loosening it. The carve-out rests on carbonation figures
  being structurally unpublished, which is not true of ion analyses.
- Two provenance qualities now coexist in one profile, and they routinely
  disagree — Perrier's ion data is verified while its carbonation figure is an
  estimate. Consumers must read the carbonation target's own `provenance` and
  never the profile-level one; `computeCarbonation()` carries the correct one
  through, and a test pins that specific confusion.
- `CONTRIBUTING.md`'s "leave unset when unsourceable" rule for metadata is
  unchanged and consistent with decision #4 above: an estimate that cannot meet
  the bar is still omitted.
