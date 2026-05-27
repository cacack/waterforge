// Production solver: target profile + source water + salt palette -> recipe.
//
// We solve A x = (target - source) for salt doses x >= 0, where A is the ion x
// salt matrix (mg ion per g salt per L) and the right-hand side is the per-ion
// deficit the salts must supply. Non-negativity is enforced with NNLS. A single
// gypsum solubility-ceiling clamp caps calcium sulfate at roughly its saturation
// limit, since beyond that gypsum simply will not dissolve. We then report the
// resulting ion profile plus derived readouts and saturation warnings. See the
// solver notes under `docs/`.

import { IONS, ION_ORDER, SALT_ORDER, type IonId, type SaltId } from '../chem'
import { litresToUsGallons } from '../chem/conversions'
import { buildMatrix, contribution, forward } from './matrix'
import { nnls } from './nnls'
import { saturationWarnings } from './saturation'
import type {
  BatchOptions,
  IonProfile,
  Readouts,
  SaltDose,
  SolveResult,
} from './types'

// Gypsum dissolves to roughly 2.0-2.5 g/L before saturating; we clamp at the
// lower, conservative end so doses we emit are physically achievable.
export const GYPSUM_CEILING_G_PER_L = 2.0

/** Sum a profile's ion concentrations (mg/L) -> total dissolved solids. */
function totalDissolvedSolids(profile: IonProfile): number {
  let tds = 0
  for (const ion of ION_ORDER) tds += profile[ion] ?? 0
  return tds
}

/**
 * Charge-balance residual (meq/L): cation equivalents minus anion equivalents.
 * Each ion contributes (mg/L / molarMass) * |charge| equivalents, signed by the
 * charge. A balanced profile sits near zero.
 */
function chargeResidual(profile: IonProfile): number {
  let meq = 0
  for (const ion of ION_ORDER) {
    const mg = profile[ion] ?? 0
    if (mg === 0) continue
    const { molarMass, charge } = IONS[ion]
    meq += (mg / molarMass) * charge
  }
  return meq
}

/** Compute the UI readouts for a result profile. */
function computeReadouts(profile: IonProfile): Readouts {
  const so4 = profile.SO4 ?? 0
  const cl = profile.Cl ?? 0
  return {
    sulfateChlorideRatio: cl > 0 ? so4 / cl : Infinity,
    tds: totalDissolvedSolids(profile),
    chargeResidual: chargeResidual(profile),
  }
}

/** Add two ion profiles (mg/L), keeping only non-zero ions. */
function addProfiles(a: IonProfile, b: IonProfile): IonProfile {
  const out: IonProfile = {}
  for (const ion of ION_ORDER) {
    const v = (a[ion] ?? 0) + (b[ion] ?? 0)
    if (v !== 0) out[ion] = v
  }
  return out
}

/**
 * Solve for the salt recipe that turns `source` water into `target`.
 *
 * @param target  desired finished ion profile (mg/L).
 * @param source  ions already present in the starting water (mg/L); omit for distilled.
 * @param salts   available salt palette; defaults to the full set in priority order.
 * @param batch   batch size + unit to scale the per-litre dose to.
 */
export function solve(
  target: IonProfile,
  source: IonProfile = {},
  salts: readonly SaltId[] = SALT_ORDER,
  batch: BatchOptions = { volume: 1, unit: 'L' },
): SolveResult {
  // Right-hand side: per-ion deficit (mg/L) the salts must supply. Negative
  // deficits (source already richer than target) cannot be fixed by adding
  // salts, so NNLS just fits them as closely as non-negativity allows.
  const b = ION_ORDER.map((ion) => (target[ion] ?? 0) - (source[ion] ?? 0))
  const A = buildMatrix(salts)

  const { x } = nnls(A, b)

  // Per-litre dose, with the single gypsum solubility-ceiling clamp applied.
  const dosePerLitre: SaltDose = {}
  salts.forEach((saltId, col) => {
    let grams = x[col]
    if (grams <= 0) return
    if (saltId === 'gypsum' && grams > GYPSUM_CEILING_G_PER_L) {
      grams = GYPSUM_CEILING_G_PER_L
    }
    dosePerLitre[saltId] = grams
  })

  // Resulting profile = source water + everything the doses add.
  const added = forward(dosePerLitre)
  const resultProfile = addProfiles(source, added)

  // Scale to the requested batch volume.
  const litres =
    (batch.unit ?? 'L') === 'gal'
      ? batch.volume / litresToUsGallons(1)
      : batch.volume
  const recipe: SaltDose = {}
  for (const saltId of Object.keys(dosePerLitre) as SaltId[]) {
    recipe[saltId] = (dosePerLitre[saltId] ?? 0) * litres
  }

  return {
    recipe,
    dosePerLitre,
    resultProfile,
    readouts: computeReadouts(resultProfile),
    warnings: saturationWarnings(resultProfile),
  }
}

// Re-exported so callers can introspect a single salt's contribution if needed.
export { contribution }
export type { IonId, SaltId }
