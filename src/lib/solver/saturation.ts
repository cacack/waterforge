// Saturation-index warnings for sparingly soluble minerals.
//
// A salt precipitates once its ion activity product (IAP) exceeds its
// solubility product (Ksp). The saturation index SI = log10(IAP / Ksp) makes
// this readable: SI < 0 undersaturated (dissolves), SI = 0 at equilibrium, SI >
// 0 supersaturated (tends to precipitate). We warn at SI >= 0.
//
// SIMPLIFICATION: we treat activity as equal to molar concentration (activity
// coefficients = 1). Real waters have ionic strength that lowers activities, so
// these indices are conservative approximations meant to flag obvious risks,
// not exact equilibrium predictions. See the chemistry guides under `docs/`.
//
// Ksp values at 25 C: gypsum (CaSO4) ~ 10^-4.58, calcite (CaCO3) ~ 10^-8.48.

import { IONS } from '../chem'
import type { IonProfile, SaturationWarning } from './types'

/** log10(Ksp) at 25 C for the minerals we screen. */
export const LOG_KSP = {
  gypsum: -4.58,
  calcite: -8.48,
} as const

/** Convert an ion's mg/L concentration to mol/L (activity, under our simplification). */
function molarity(profile: IonProfile, ion: keyof typeof IONS): number {
  const mg = profile[ion] ?? 0
  // mg/L / (g/mol) gives mmol/L; divide by 1000 for mol/L.
  return mg / IONS[ion].molarMass / 1000
}

/**
 * Saturation index for gypsum, SI = log10([Ca][SO4] / Ksp). Returns -Infinity
 * when either ion is absent (the mineral cannot form).
 */
export function gypsumSaturationIndex(profile: IonProfile): number {
  const ca = molarity(profile, 'Ca')
  const so4 = molarity(profile, 'SO4')
  if (ca <= 0 || so4 <= 0) return -Infinity
  return Math.log10(ca * so4) - LOG_KSP.gypsum
}

/**
 * Saturation index for calcite, SI = log10([Ca][CO3] / Ksp). Carbonate is
 * approximated from bicarbonate alkalinity (the modelled species); this is a
 * coarse screen, deliberately conservative.
 */
export function calciteSaturationIndex(profile: IonProfile): number {
  const ca = molarity(profile, 'Ca')
  const hco3 = molarity(profile, 'HCO3')
  if (ca <= 0 || hco3 <= 0) return -Infinity
  // Use bicarbonate molarity as a proxy for the carbonate available to calcite.
  return Math.log10(ca * hco3) - LOG_KSP.calcite
}

/**
 * Produce saturation warnings for a result profile. A mineral warns when its
 * saturation index is at or above zero (supersaturated).
 */
export function saturationWarnings(profile: IonProfile): SaturationWarning[] {
  const warnings: SaturationWarning[] = []

  const gypsumSi = gypsumSaturationIndex(profile)
  if (gypsumSi >= 0) {
    warnings.push({
      mineral: 'gypsum',
      saturationIndex: gypsumSi,
      message:
        'Gypsum (CaSO4) is at or above saturation; some calcium sulfate may not dissolve.',
    })
  }

  const calciteSi = calciteSaturationIndex(profile)
  if (calciteSi >= 0) {
    warnings.push({
      mineral: 'calcite',
      saturationIndex: calciteSi,
      message:
        'Calcite (CaCO3) is at or above saturation; calcium carbonate may precipitate.',
    })
  }

  return warnings
}
