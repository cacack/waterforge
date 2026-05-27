import { describe, expect, it } from 'vitest'
import { solve } from './solve'
import { forward, buildMatrix } from './matrix'
import { nnls } from './nnls'
import { ION_ORDER, SALT_ORDER, type SaltId } from '../chem'
import type { IonProfile, SaltDose } from './types'

// Tests for the recipe-selection policy (ADR 0009): when several salts can
// source the same ion the system is underdetermined, and plain NNLS returns a
// minimum-L2-norm solution that (a) splits doses across redundant salts and
// (b) depends on the column order of the palette. The policy must surface a
// recipe that is DETERMINISTIC, still hits the target EXACTLY when achievable,
// and is SENSIBLE (priority-minimal salt support).

/** Largest absolute per-ion mismatch (mg/L) between two profiles. */
function maxIonError(a: IonProfile, b: IonProfile): number {
  let err = 0
  for (const ion of ION_ORDER) {
    err = Math.max(err, Math.abs((a[ion] ?? 0) - (b[ion] ?? 0)))
  }
  return err
}

/** A few non-trivial reorderings of the full palette. */
const PALETTE_PERMUTATIONS: SaltId[][] = [
  [...SALT_ORDER],
  [
    'epsom',
    'tableSalt',
    'gypsum',
    'potassiumBicarbonate',
    'magnesiumChloride',
    'calciumChloride',
    'bakingSoda',
    'chalk',
  ],
  [
    'magnesiumChloride',
    'calciumChloride',
    'chalk',
    'bakingSoda',
    'tableSalt',
    'epsom',
    'gypsum',
    'potassiumBicarbonate',
  ],
]

// Real, published profiles used as fixtures (CC-BY-SA-4.0, Lersch / Khymos).
const SAN_PELLEGRINO: IonProfile = {
  Ca: 164,
  Mg: 49.5,
  Na: 31.2,
  K: 2.2,
  HCO3: 243,
  SO4: 402,
  Cl: 49.4,
}
const CONTREX: IonProfile = {
  Ca: 468,
  Mg: 74.5,
  Na: 9.4,
  K: 3.2,
  HCO3: 372,
  SO4: 1121,
  Cl: 10,
}

describe('recipe policy: determinism', () => {
  it('returns a byte-identical recipe across permuted palettes (achievable target)', () => {
    // Feasible high-sulfate target built from a known recipe.
    const target = forward({ gypsum: 0.9, epsom: 0.6, tableSalt: 0.12 })
    const recipes = PALETTE_PERMUTATIONS.map((p) =>
      JSON.stringify(solve(target, {}, p).dosePerLitre),
    )
    expect(new Set(recipes).size).toBe(1)
  })

  it('returns a byte-identical recipe across permuted palettes (infeasible real profile)', () => {
    // San Pellegrino is not exactly reproducible from this palette; plain NNLS
    // would split the residual fit differently per column order. The policy
    // must not.
    const recipes = PALETTE_PERMUTATIONS.map((p) =>
      JSON.stringify(solve(SAN_PELLEGRINO, {}, p).dosePerLitre),
    )
    expect(new Set(recipes).size).toBe(1)
  })

  it('fixes the order-dependence that plain NNLS exhibits on this profile', () => {
    // Sanity-check the premise: plain NNLS really is order-dependent here, so
    // the determinism above is a property the policy adds, not a no-op.
    const b = ION_ORDER.map((ion) => SAN_PELLEGRINO[ion] ?? 0)
    const orderA: SaltId[] = [...SALT_ORDER]
    const orderB: SaltId[] = PALETTE_PERMUTATIONS[2]
    const toMap = (order: SaltId[]): SaltDose => {
      const { x } = nnls(buildMatrix(order), b)
      const m: SaltDose = {}
      order.forEach((s, i) => {
        if (x[i] > 1e-9) m[s] = +x[i].toFixed(6)
      })
      return m
    }
    expect(JSON.stringify(toMap(orderA))).not.toBe(
      JSON.stringify(toMap(orderB)),
    )
  })

  it('is repeatable: identical input yields identical output', () => {
    const a = solve(SAN_PELLEGRINO, {}, SALT_ORDER).dosePerLitre
    const b = solve(SAN_PELLEGRINO, {}, SALT_ORDER).dosePerLitre
    expect(a).toEqual(b)
  })
})

describe('recipe policy: target-hit on achievable profiles', () => {
  it('reproduces a simple achievable target to >= 6 decimals', () => {
    const known: SaltDose = {
      gypsum: 0.2,
      tableSalt: 0.1,
      potassiumBicarbonate: 0.08,
    }
    const target = forward(known)
    const result = solve(target, {}, SALT_ORDER)
    expect(maxIonError(result.resultProfile, target)).toBeLessThan(1e-6)
  })

  it('reproduces an achievable target that genuinely needs a redundant salt', () => {
    // Ca comes from BOTH gypsum and calciumChloride; the chloride content forces
    // calciumChloride to stay in the recipe. The policy must keep it (exactness
    // wins over sparsity), not strip it.
    const known: SaltDose = {
      gypsum: 0.3,
      calciumChloride: 0.2,
      tableSalt: 0.1,
      potassiumBicarbonate: 0.05,
    }
    const target = forward(known)
    const result = solve(target, {}, SALT_ORDER)
    expect(maxIonError(result.resultProfile, target)).toBeLessThan(1e-6)
    expect(result.dosePerLitre.calciumChloride).toBeGreaterThan(0)
  })

  it('does not fit worse than plain NNLS on an infeasible target', () => {
    // The policy is lexicographic: best fit first. Its residual must match the
    // unconstrained NNLS optimum to floating-point precision.
    const b = ION_ORDER.map((ion) => SAN_PELLEGRINO[ion] ?? 0)
    const optimal = nnls(buildMatrix([...SALT_ORDER]), b).residualNorm
    const result = solve(SAN_PELLEGRINO, {}, SALT_ORDER)
    let resSq = 0
    for (const ion of ION_ORDER) {
      const d = (SAN_PELLEGRINO[ion] ?? 0) - (result.resultProfile[ion] ?? 0)
      resSq += d * d
    }
    expect(Math.sqrt(resSq)).toBeCloseTo(optimal, 6)
  })
})

describe('recipe policy: sensible salt choices', () => {
  it('SIMPLE profile: picks the obvious minimal recipe, no redundant salts', () => {
    // A low-mineral target reachable with gypsum (Ca/SO4), table salt (Na/Cl)
    // and potassium bicarbonate (K/HCO3). The policy should pick exactly those
    // three and avoid the redundant chloride/bicarbonate pathways.
    const target = forward({
      gypsum: 0.15,
      tableSalt: 0.08,
      potassiumBicarbonate: 0.06,
    })
    const used = Object.keys(solve(target, {}, SALT_ORDER).dosePerLitre).sort()
    expect(used).toEqual(['gypsum', 'potassiumBicarbonate', 'tableSalt'])
  })

  it('HIGH-SULFATE profile: sources divalents via the sulfate salts, not chloride', () => {
    // A sulfate-dominant target should be built from gypsum + Epsom (the SO4
    // pathway), not calcium/magnesium chloride. Demonstrates the priority
    // tiebreak choosing the intuitive recipe for a Contrex/Pellegrino-style
    // water.
    const target = forward({ gypsum: 1.2, epsom: 0.8, tableSalt: 0.05 })
    const used = Object.keys(solve(target, {}, SALT_ORDER).dosePerLitre)
    expect(used).toContain('gypsum')
    expect(used).toContain('epsom')
    expect(used).not.toContain('calciumChloride')
    expect(used).not.toContain('magnesiumChloride')
  })

  it('HIGH-SULFATE real profile (San Pellegrino): no redundant Mg-chloride pathway', () => {
    // San Pellegrino is sulfate-rich, so magnesium should ride in on Epsom, not
    // magnesium chloride. Plain order-A NNLS pulls magnesiumChloride in; the
    // policy must not.
    const used = Object.keys(solve(SAN_PELLEGRINO, {}, SALT_ORDER).dosePerLitre)
    expect(used).toContain('gypsum')
    expect(used).toContain('epsom')
    expect(used).not.toContain('magnesiumChloride')
  })

  it('HIGH-SULFATE real profile (Contrex): uses the sulfate salts, drops the Mg-chloride pathway', () => {
    const used = Object.keys(solve(CONTREX, {}, SALT_ORDER).dosePerLitre)
    expect(used).toContain('gypsum')
    expect(used).toContain('epsom')
    expect(used).not.toContain('magnesiumChloride')
  })
})
