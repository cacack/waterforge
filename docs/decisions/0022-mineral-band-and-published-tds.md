# ADR 0022 — Mineral band and published TDS

**Status:** Accepted
**Date:** 2026-10-24
**Issue:** #303

## Context

People ask "how mineral is this water?" and expect a plain answer, not a raw
mg/L figure. Waterforge already computes a TDS readout, but there are two
different numbers called "TDS", and they disagree:

- **Sum of ions** — what the engine computes: the mass sum of every modelled ion
  in the result profile. It exists for any recipe, whether or not the target
  has a published figure.
- **Dried residue at 180 °C** — what bottlers usually print on the label. On
  drying, bicarbonate is partly lost as CO₂ and H₂O (roughly half its mass
  leaves; the rest stays as carbonate), while some salts keep hydrate water
  (e.g. MgSO₄·H₂O). The residue is therefore usually _lower_ than the sum of
  ions for bicarbonate-rich waters, and can sit above it where hydrates
  dominate. Some producers instead publish a total mineralisation (the mass of
  everything dissolved), or a TDS with no stated method.

San Pellegrino shows the gap: its ions sum to **941 mg/L**, while the producer
publishes a dried residue of **854 mg/L**. Neither is wrong; they measure
different things.

Until now the profile field `tds` was a bare number with no provenance of its
own, so a published figure could not be told apart from an unsourced one.

## Decision

1. **The mineral band classifies sum-of-ions TDS.** It is the figure that exists
   for every recipe, not only catalog profiles, and it is what the engine
   produces — so the band is always available and always consistent with the
   recipe shown. The published residue is never fed into the band.

2. **Five bands, lower bound inclusive.** Thresholds in mg/L:

   | Band       | Sum-of-ions TDS | Example waters              |
   | ---------- | --------------- | --------------------------- |
   | Very light | < 100           | Voss, Waiākea               |
   | Light      | 100–300         | Volvic, Acqua Panna, Fiji   |
   | Medium     | 300–700         | Evian, Perrier, Topo Chico  |
   | Rich       | 700–1500        | San Pellegrino, Vittel      |
   | Bold       | ≥ 1500          | Gerolsteiner, Badoit, Hépar |

   The cut points were chosen from the spread of the 54 catalog profiles so
   each band holds a recognisable cluster (9 / 10 / 11 / 10 / 14 on 2026-10-24,
   counted from the engine's converted ion sums). A value
   exactly on a boundary belongs to the higher band; negative or non-numeric
   input falls into Very light. The code in `src/lib/chem/mineral-band.ts` is
   the single source of truth for the numbers.

3. **Published TDS is a self-contained `{ value, provenance }`**, following the
   `carbonation_target` pattern ([ADR 0013](0013-still-sparkling-and-carbonation-target.md)):
   it cannot hold a value without its own provenance. It is held to the
   **ion-data sourcing bar** ([ADR 0011](0011-library-beyond-khymos-seed.md) /
   [ADR 0012](0012-profile-data-independently-sourced.md)), not the
   carbonation estimate bar of [ADR 0015](0015-carbonation-target-sourcing-bar.md)
   — TDS is a regulated label disclosure, so a primary source normally exists.
   It is **never estimated**, and never derived from the ions. Where the
   producer genuinely publishes no figure, `tds_unpublished` records that
   absence (why, and where it was checked). The two fields are mutually
   exclusive. The provenance names what kind of figure it is (dried residue,
   total mineralisation, or method not stated). A figure that could not be
   re-confirmed against a current producer source ships `verified: false`
   rather than being dropped or guessed at.

4. **Both figures are shown, each labelled.** The readout shows the sum-of-ions
   TDS with its band, and — when a profile carries one — the producer's
   published figure alongside, labelled as published so the gap reads as
   expected rather than as an error. The UI does not claim a measurement
   method; the source (shown on hover) carries it. An unverified figure is
   labelled "Published (unverified)".

## Consequences

- `validateProfile` rejects a bare-number `tds`; profile JSON must use
  `{ value, provenance }` or drop it. The source-water import uses only the
  ions, so it strips the TDS fields before validating and older files still
  import.
- Band labels are UI vocabulary, not profile data. They are intended for reuse
  on printed labels and share cards (#302), so renaming one is a user-visible
  change.
- Changing a threshold re-bands existing waters; revisit only if the catalog's
  spread shifts enough to empty or crowd a band.
