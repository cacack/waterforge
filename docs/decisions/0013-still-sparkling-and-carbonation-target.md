# ADR 0013 — Model still vs sparkling and a carbonation target as first-class profile fields

**Status:** Accepted
**Date:** 2026-05-31

## Context

To clone a sparkling water faithfully we eventually need to know its
carbonation. But "CO₂" names two genuinely different quantities, and conflating
them would be exactly the silent unit error Waterforge is otherwise meticulous
about (cf. the as-CaCO₃/as-HCO₃ alkalinity trap recorded in `types.ts` and
guarded by `validateProfile`):

1. **Source dissolved CO₂** — what a spring/source analysis reports for the
   water _as it emerges_. This is the existing `co2` field
   (`src/lib/profiles/schema.ts`). It does **not** describe the fizz in the
   finished bottle.
2. **Target / bottled carbonation** — the carbonation you'd actually force to
   reproduce the product. It is frequently **not published** as a number, and
   "naturally sparkling" vs "carbonation added" muddies it further.

Separately, a water's **still vs sparkling** status is a basic descriptive fact
that the model had no place to record. The "Profile metadata" milestone
(#126–#129) introduces a controlled-vocabulary `traits` system but
**deliberately excludes** still/sparkling from it, leaving this issue (#122) to
own the distinction as a first-class field.

## Decision

1. **Still vs sparkling is a first-class field, not a trait.** Add
   `carbonation_style?: 'still' | 'sparkling'` to `Profile`. Its absence means
   **unknown / not recorded** — it does _not_ imply still. "Unknown" is an
   honest, first-class state; profiles are not guessed into a bucket. It is kept
   out of the `traits` metadata system per the #126–#129 coordination.

2. **Target carbonation is modelled separately from `co2`, with its own unit and
   provenance.** Add `carbonation_target?: { value, unit, provenance }`:
   - `unit` reuses the engine's `CarbonationUnit` vocabulary
     (`'volumes' | 'gPerL'`) from `src/lib/chem/carbonation.ts`, so profile data
     and the carbonation calculator speak the same units.
   - `provenance` is a full `ProfileProvenance` block — the carbonation figure is
     sourced and verified in its own right, held to the same authoritative bar as
     ion data (ADR 0011 / ADR 0012).
   - Modelling it as a self-contained object means a value can never be recorded
     without its unit and provenance.

3. **The two CO₂ quantities must never be derived from one another.** `co2`
   stays as-is for source dissolved CO₂; `carbonation_target` is the bottled
   target. Doc comments on both fields state this explicitly. In particular, the
   existing `co2` numbers (source/label-minimum figures) are **not** repurposed
   as targets.

4. **Validation mirrors the alkalinity-unit rule.** When `carbonation_target` is
   present its `value` (finite, ≥ 0), `unit`, and `provenance` are all required
   — rejecting a value without its unit, just as `alkalinity_unit` is required
   alongside `HCO3`. The provenance check was refactored into a shared
   `validateProvenance` helper so the profile-level and carbonation-level
   provenance are held to one standard. As a cross-field guard, a
   `carbonation_target` on a `carbonation_style: 'still'` profile is rejected as
   incoherent (a still water has no bottled carbonation); an _absent_ style
   still permits a sourced target, since "unknown" does not contradict one.

5. **Seed only what can be authoritatively sourced.** `carbonation_style` is
   populated where the existing per-profile sources/comments already establish
   it (18 sparkling, 18 still); brewing/coffee/tea targets and waters with
   equally-marketed still _and_ sparkling variants (e.g. Antipodes, Ty Nant) are
   left unset. `carbonation_target` is left **unset on every profile**: no
   bottled-carbonation figure (volumes or g/L) is authoritatively available in
   the current sources — they report source CO₂ or a label minimum, not a
   bottled target. Unset is the honest default; targets are not estimated.

## Consequences

- The profile model can express still/sparkling and a sourced carbonation target
  without overloading or corrupting the `co2` field.
- `types.ts → schema.ts → validate.ts → tests` are kept in sync; new validation
  cases cover the unit-required and provenance rules.
- The recipe-output integration (#123) and any carbonation math beyond the
  existing calculator are out of scope here and consume these fields later.
- **Open seam (deferred):** no issue currently shows still-vs-sparkling in the
  **target panel** while browsing — #123 surfaces carbonation in the recipe
  output and #128 explicitly excludes carbonation/sparkling from the target
  panel. The status badge is intentionally _not_ built in #122 (data/docs only);
  it is left as a follow-up to fold into #128 or a small dedicated issue.
