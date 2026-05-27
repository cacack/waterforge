// Shared types for the solver layer.

import type { IonId, SaltId } from '../chem/constants'

/**
 * Ion concentrations in mg/L, keyed by ion. Missing ions are treated as zero.
 * Used for target profiles, source water, and computed results alike.
 */
export type IonProfile = Partial<Record<IonId, number>>

/** Salt amounts in grams per litre, keyed by salt. Missing salts are zero. */
export type SaltDose = Partial<Record<SaltId, number>>

/** Volume unit a batch recipe is expressed in. */
export type VolumeUnit = 'L' | 'gal'

export interface BatchOptions {
  /** Batch size in the given unit. */
  volume: number
  /** Unit the volume is expressed in. Defaults to litres. */
  unit?: VolumeUnit
}

/** A saturation-index warning for a sparingly soluble mineral. */
export interface SaturationWarning {
  mineral: 'gypsum' | 'calcite'
  /** Saturation index, log10(IAP/Ksp). SI >= 0 means at or above saturation. */
  saturationIndex: number
  message: string
}

/** Derived single-number readouts a UI surfaces alongside a recipe. */
export interface Readouts {
  /** Sulfate-to-chloride mass ratio (mg/L over mg/L). Infinity if no chloride. */
  sulfateChlorideRatio: number
  /** Total dissolved solids: sum of all modelled ion concentrations (mg/L). */
  tds: number
  /**
   * Charge-balance residual in meq/L (cation equivalents minus anion
   * equivalents). Near zero for a well-balanced profile.
   */
  chargeResidual: number
}

export interface SolveResult {
  /** Per-salt grams scaled to the requested batch volume. */
  recipe: SaltDose
  /** Per-salt grams per litre (unscaled), as solved. */
  dosePerLitre: SaltDose
  /** Ion profile (mg/L) the recipe is expected to produce in the source water. */
  resultProfile: IonProfile
  readouts: Readouts
  warnings: SaturationWarning[]
}
