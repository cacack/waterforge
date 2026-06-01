// Profile data model for Waterforge.
//
// A Profile captures a named mineral-water target together with the provenance
// and unit metadata needed to use it safely. The critical design decision here
// is that the alkalinity unit convention is **carried explicitly** in every
// profile — the `alkalinity_unit` field records whether the bicarbonate value
// is expressed as-HCO₃ or as-CaCO₃. This prevents the silent ×1.22 error that
// arises when importers assume one convention while the data uses another.
//
// See docs/guides/chemistry.md §3 for a full explanation of the trap.

import type { IonId } from '../chem/constants'
import type { CarbonationUnit } from '../chem/carbonation'

/**
 * How the bicarbonate / alkalinity figure is expressed in this profile.
 *
 * - `'as_HCO3'` — mg/L of HCO₃⁻ (the engine's canonical representation).
 * - `'as_CaCO3'` — mg/L expressed as CaCO₃ (common in water-quality reports
 *   and some brewing references). Multiply by ≈ 1.219 to convert to as-HCO₃.
 *
 * When absent the profile MUST NOT contain HCO₃ (bicarbonate is simply not
 * reported). Importers MUST check this field before using the HCO₃ value.
 */
export type AlkalinityUnit = 'as_HCO3' | 'as_CaCO3'

/**
 * Whether a water is bottled still (flat) or sparkling (carbonated).
 *
 * This is a **first-class profile field**, deliberately kept out of the
 * controlled-vocabulary `traits` metadata system — the still/sparkling
 * distinction drives recipe behaviour, not just browsing metadata.
 *
 * When absent the style is simply **unknown / not recorded** — it does not
 * imply still. "Unknown" is an honest, first-class state; do not guess.
 */
export type CarbonationStyle = 'still' | 'sparkling'

/**
 * The **target / bottled carbonation** of a sparkling water — the fizz you'd
 * actually force to reproduce the finished product.
 *
 * This is distinct from the {@link Profile.co2} field, which records **source
 * dissolved CO₂** (the water as it emerges from the spring, as reported by an
 * analysis). The two numbers must never be derived from one another:
 *
 * - `co2` describes the spring water; it does not describe the fizz in the bottle.
 * - `carbonation_target` describes the bottled product; it is often **not
 *   published** and is held to the same authoritative-sourcing bar as ion data
 *   (it carries its own {@link ProfileProvenance}).
 *
 * Modelled as a self-contained object so a value can never be recorded without
 * its unit and provenance — the carbonation analogue of the `alkalinity_unit`
 * required-when-present rule.
 */
export interface CarbonationTarget {
  /**
   * Target carbonation magnitude, expressed in {@link CarbonationTarget.unit}.
   *
   * `0` is technically valid (atmospheric-equilibrium CO₂), but "still / not
   * carbonated" should be recorded as `carbonation_style: 'still'` with no
   * `carbonation_target` — do not use `value: 0` as a stand-in for flat.
   */
  value: number
  /**
   * Unit the `value` is expressed in. Reuses the engine's `CarbonationUnit`
   * vocabulary (`'volumes'` of CO₂ or `'gPerL'`) so profile data and the
   * carbonation calculator speak the same units.
   */
  unit: CarbonationUnit
  /** Provenance for this carbonation figure — sourced and verified in its own right. */
  provenance: ProfileProvenance
}

/**
 * Controlled vocabulary for a profile's high-level {@link Profile.category}.
 *
 * This is the **single source of truth** for the category enum — `schema.ts`
 * and `validate.ts` both derive from this constant rather than repeating the
 * literal list. The {@link ProfileCategory} union type is derived from it.
 *
 * - `'bottled'` — a commercial bottled mineral/spring water.
 * - `'brewing'` — a brewing-water target (e.g. Palmer / SCA references).
 * - `'coffee'` — a coffee-brewing water target.
 * - `'synthetic'` — a constructed/reference profile, not a real product.
 */
export const PROFILE_CATEGORIES = [
  'bottled',
  'brewing',
  'coffee',
  'synthetic',
] as const

/** A profile's high-level category. One of {@link PROFILE_CATEGORIES}. */
export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number]

/**
 * Controlled vocabulary for a profile's descriptive {@link Profile.traits}.
 *
 * The **single source of truth** for the trait enum — `schema.ts` and
 * `validate.ts` both derive from this constant. Traits are **editorially
 * assigned** browsing/filtering metadata, NOT auto-computed from the ion
 * figures; a curator chooses them to characterise a water.
 *
 * Note: still/sparkling is deliberately **not** a trait — carbonation is a
 * first-class field (`carbonation_style` / `carbonation_target`, see ADR 0013).
 */
export const PROFILE_TRAITS = [
  'calcium-rich',
  'magnesium-rich',
  'sodium-rich',
  'sulfate-rich',
  'bicarbonate-rich',
  'chloride-rich',
  'silica-rich',
  'low-mineralization',
  'high-mineralization',
  'artesian',
  'volcanic',
] as const

/** A single descriptive trait. One of {@link PROFILE_TRAITS}. */
export type ProfileTrait = (typeof PROFILE_TRAITS)[number]

/**
 * Ion concentrations in mg/L for a named mineral-water profile.
 *
 * All seven ions tracked by the Waterforge engine are optional; missing ions
 * are treated as zero by the solver. The HCO₃ field carries the alkalinity in
 * the unit declared by `alkalinity_unit` on the enclosing `Profile`.
 */
export type ProfileIons = Partial<Record<IonId, number>>

/**
 * Provenance metadata: where the ion values came from and how reliable they
 * are.
 */
export interface ProfileProvenance {
  /**
   * Whether the data has been cross-checked against a primary source (e.g.
   * the manufacturer's published analysis). Treated as `false` when absent.
   */
  verified: boolean
  /** Human-readable description of the data source (publication, URL, etc.). */
  source: string
  /**
   * Date the source data was published or accessed, as an ISO 8601 date string
   * (`YYYY-MM-DD`). Allows consumers to detect stale data.
   */
  source_date: string
}

/**
 * A named mineral-water profile with ion concentrations, optional supplemental
 * measurements, and full provenance.
 *
 * All ion concentrations are in mg/L. The `alkalinity_unit` field is **required
 * whenever HCO₃ is present** — its absence signals that alkalinity was not
 * reported by the source, not that it was zero.
 */
export interface Profile {
  /** Canonical name of the water (e.g. `'Evian'`, `'Volvic'`). */
  name: string

  /** Ion concentrations, all in mg/L. */
  ions: ProfileIons

  /**
   * Unit in which the HCO₃ ion concentration is expressed.
   *
   * **Required when `ions.HCO3` is present.** Omit only when HCO₃ is absent.
   * This explicit declaration prevents silent unit-conversion errors.
   */
  alkalinity_unit?: AlkalinityUnit

  // Supplemental measurements (optional, informational):

  /**
   * **Source** dissolved CO₂ in mg/L, as reported by a spring/source analysis
   * (the water as it emerges). This is *not* the fizz of the finished bottle —
   * for that, see {@link Profile.carbonation_target}. The two are separately
   * sourced and one must never be derived from the other.
   */
  co2?: number

  /**
   * Whether this water is bottled still or sparkling. Absent = unknown.
   *
   * A first-class field, intentionally separate from the `traits` metadata
   * system and from {@link Profile.carbonation_target} (the style can be known
   * even when no numeric target is published).
   */
  carbonation_style?: CarbonationStyle

  /**
   * Target / bottled carbonation to reproduce the product, with its own unit
   * and provenance. Absent = not authoritatively sourced (the honest default);
   * do not estimate it from `co2`.
   */
  carbonation_target?: CarbonationTarget

  /** pH, as reported. */
  ph?: number
  /**
   * Total dissolved solids in mg/L, as reported by the source. May differ from
   * the sum of the seven tracked ions (other ions, rounding, evaporation
   * residue vs. calculated TDS).
   */
  tds?: number
  /** Free-text annotation (e.g. notes on measurement method or seasonal variation). */
  comment?: string
  /** URL to the primary source or product page. */
  url?: string

  // Descriptive metadata (optional, additive — for browsing/filtering only;
  // does not affect the recipe math). See ADR 0014.

  /** Country of origin (e.g. `'France'`). Free text; a geographic fact. */
  country?: string
  /** Locality / region or spring source (e.g. `'Évian-les-Bains'`). Free text. */
  locality?: string
  /**
   * Short, neutral prose description (~1–2 sentences). Our own editorial
   * summary — never copied bottler marketing. Soft cap ~240 characters.
   */
  description?: string
  /** High-level category. One of {@link PROFILE_CATEGORIES}. */
  category?: ProfileCategory
  /**
   * Editorially-assigned descriptive traits for browsing/filtering. Each entry
   * is one of {@link PROFILE_TRAITS}. Not auto-computed from ions.
   */
  traits?: ProfileTrait[]

  /** Provenance metadata. */
  provenance: ProfileProvenance
}
