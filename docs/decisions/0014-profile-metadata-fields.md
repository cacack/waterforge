# ADR 0014 — Structured profile metadata fields (geography, description, category, traits)

**Status:** Accepted
**Date:** 2026-06-01

## Context

The profile model captured ion chemistry, units, provenance, and (per
[ADR 0013](0013-still-sparkling-and-carbonation-target.md)) carbonation, but had
no structured way to record what a water _is_ for browsing and filtering:
where it comes from, a one-line summary, a high-level kind, and descriptive
characteristics. The "Profile metadata" milestone (#126–#129) introduces these.

Two constraints shaped the design:

- **Carbonation is already owned elsewhere.** Still/sparkling and bottled
  carbonation are first-class fields (`carbonation_style` / `carbonation_target`,
  ADR 0013 / #122). They are deliberately **not** modelled as a trait, so the
  trait vocabulary below has no sparkling/still entry.
- **Backward compatibility.** The 54 bundled profiles and the
  `types.ts → schema.ts → validate.ts → tests` contract must keep working
  unchanged; the new fields are purely additive.

## Decision

1. **Add five optional, additive metadata fields to `Profile`** — none change
   the recipe math; they are browsing/filtering metadata only:
   - `country?: string` — country of origin (geographic fact).
   - `locality?: string` — region / spring source (geographic fact).
   - `description?: string` — short neutral prose (~1–2 sentences, soft cap
     ~240 chars).
   - `category?: ProfileCategory` — high-level kind.
   - `traits?: ProfileTrait[]` — descriptive characteristics.

   Being optional, every existing profile remains valid; absence is the honest
   default and carries no implied value.

2. **Controlled vocabularies are defined once and shared.** `PROFILE_CATEGORIES`
   and `PROFILE_TRAITS` are exported `as const` from `types.ts`, with the union
   types `ProfileCategory` / `ProfileTrait` derived from them. Both `schema.ts`
   (JSON-Schema `enum`s) and `validate.ts` (runtime checks) import these
   constants — there is no duplicated literal list. Unknown values are
   **rejected** by both the schema (`additionalProperties: false` preserved) and
   the runtime validator.
   - **category enum:** `bottled` | `brewing` | `coffee` | `synthetic`.
   - **traits vocab:** `calcium-rich`, `magnesium-rich`, `sodium-rich`,
     `sulfate-rich`, `bicarbonate-rich`, `chloride-rich`, `silica-rich`,
     `low-mineralization`, `high-mineralization`, `artesian`, `volcanic`.

3. **Traits are editorially assigned, not auto-computed.** A curator chooses the
   traits that characterise a water; they are **not** derived from the ion
   figures by a threshold rule. This keeps `traits` an honest editorial summary
   (a water can be "calcium-rich" in character without tripping an arbitrary
   numeric cutoff) and avoids coupling browsing metadata to the chemistry engine.

4. **Copyright stance.** Geographic facts (`country`, `locality`) and ion data
   are facts and are not themselves copyrightable (cf.
   [ADR 0012](0012-profile-data-independently-sourced.md)). `description` is our
   own neutral prose — **never** copied bottler marketing copy. `category` and
   `traits` are our editorial classification. The curated **compilation** stays
   licensed CC-BY-SA-4.0, unchanged.

## Consequences

- The model can express geography, a summary, a category, and traits without
  touching the chemistry engine (`chem/`, `solver/` are not modified).
- `types.ts → schema.ts → validate.ts → tests` stay in sync; new tests cover the
  fields plus valid and rejected enum cases, and assert the 54 bundled profiles
  still validate unchanged.
- **Out of scope (deferred):** no data is backfilled (`profiles.json` untouched)
  and no UI consumes the fields yet — population and browsing/filtering UI are
  separate issues in the #126–#129 milestone.
