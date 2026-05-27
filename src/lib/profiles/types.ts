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

  /** Dissolved CO₂ in mg/L, as reported. */
  co2?: number
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

  /** Provenance metadata. */
  provenance: ProfileProvenance
}
