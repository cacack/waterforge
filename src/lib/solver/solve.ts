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

/**
 * Recipe-selection policy (ADR 0009).
 *
 * When several salts can source the same ion (gypsum and Epsom both supply SO₄;
 * NaCl and CaCl₂ both supply Cl), many non-negative recipes hit the same target,
 * and plain NNLS returns the minimum-L2-norm one — which splits a dose across
 * redundant salts and, worse, depends on the column order of the palette. The
 * surfaced recipe must instead be deterministic and intuitive.
 *
 * We resolve the freedom with a deterministic, priority-ordered greedy support
 * selection layered on top of NNLS (a lexicographic objective):
 *
 *   1. Best fit FIRST. NNLS over the whole palette gives the optimal residual
 *      r*. We never accept a recipe worse than r*, so when the target is
 *      achievable (r* ≈ 0) the result is still exact — the golden invariant
 *      (ADR 0007) is untouched.
 *   2. Priority/sparsity SECOND. Among the salts that reach r*, we pick the
 *      highest-priority minimal set by walking SALT_ORDER and adding salts only
 *      until r* is met, then pruning any salt whose removal does not raise the
 *      residual above r*. Salt order is canonicalised to SALT_ORDER, so the
 *      output is independent of the caller's palette ordering.
 *
 * The slack below is exactness-safe: it scales with the target magnitude but
 * stays far below any meaningful dose, so it only ever collapses genuine ties
 * (degenerate, equal-residual solutions) — never a salt the fit actually needs.
 */
const SUPPORT_SLACK_REL = 1e-9

/** Residual 2-norm and the NNLS solution restricted to `salts` (in order). */
function fitOn(
  salts: readonly SaltId[],
  b: number[],
): { x: number[]; r: number } {
  if (salts.length === 0) {
    let sq = 0
    for (const v of b) sq += v * v
    return { x: [], r: Math.sqrt(sq) }
  }
  const { x, residualNorm } = nnls(buildMatrix(salts), b)
  return { x, r: residualNorm }
}

/**
 * Choose the deterministic, priority-minimal salt support that attains the
 * optimal residual, then return the NNLS doses on that support (aligned to the
 * returned `salts`). See the policy note above and ADR 0009.
 */
function selectRecipe(
  palette: readonly SaltId[],
  b: number[],
): { salts: SaltId[]; x: number[] } {
  // Canonicalise to the fixed priority order so the result does not depend on
  // the caller's palette ordering.
  const ordered = SALT_ORDER.filter((s) => palette.includes(s))

  // Optimal residual over the whole palette — the bar we must not fall below.
  const rStar = fitOn(ordered, b).r
  let bSq = 0
  for (const v of b) bSq += v * v
  const threshold = rStar + SUPPORT_SLACK_REL * (1 + Math.sqrt(bSq))

  // Forward selection: add salts in priority order until r* is reached.
  const chosen: SaltId[] = []
  for (const salt of ordered) {
    chosen.push(salt)
    if (fitOn(chosen, b).r <= threshold) break
  }

  // Pruning: drop any salt (lowest priority first) whose removal still attains
  // r*. This strips redundant, equal-residual contributors.
  for (let i = chosen.length - 1; i >= 0; i--) {
    const trial = chosen.filter((_, idx) => idx !== i)
    if (fitOn(trial, b).r <= threshold) chosen.splice(i, 1)
  }

  return { salts: chosen, x: fitOn(chosen, b).x }
}

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

  // Deterministic, priority-minimal recipe selection (ADR 0009): NNLS finds the
  // best fit, then we collapse the underdetermined freedom toward a sparse,
  // SALT_ORDER-preferred support without giving up the optimal residual.
  const { salts: chosen, x } = selectRecipe(salts, b)

  // Per-litre dose, with the single gypsum solubility-ceiling clamp applied.
  const dosePerLitre: SaltDose = {}
  chosen.forEach((saltId, col) => {
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
