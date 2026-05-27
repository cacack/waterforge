import { describe, expect, it } from 'vitest'
import { solve } from './solve'
import { forward } from './matrix'
import { sequentialOracle } from './oracle'
import { nnls } from './nnls'
import { buildMatrix } from './matrix'
import { ION_ORDER, type SaltId } from '../chem'
import type { IonProfile, SaltDose } from './types'

// A fully-determined palette: each salt is the unique source of at least one
// ion, so the deficit vector lands in the column space with a UNIQUE
// non-negative solution. This lets the NNLS solver, the sequential oracle, and
// the forward round-trip all agree exactly.
const DETERMINED_PALETTE: SaltId[] = [
  'gypsum', // Ca + SO4
  'epsom', // Mg + SO4
  'tableSalt', // Na + Cl
  'potassiumBicarbonate', // K + HCO3
]

// Known doses (g/L) used to synthesise a target whose exact recipe we know.
const KNOWN_DOSE: SaltDose = {
  gypsum: 0.5,
  epsom: 0.3,
  tableSalt: 0.2,
  potassiumBicarbonate: 0.4,
}

describe('forward round-trip exactness', () => {
  it('recovers the salt doses that generated a determined target', () => {
    const target = forward(KNOWN_DOSE)
    const A = buildMatrix(DETERMINED_PALETTE)
    const b = ION_ORDER.map((ion) => target[ion] ?? 0)
    const { x } = nnls(A, b)
    DETERMINED_PALETTE.forEach((salt, i) => {
      expect(x[i]).toBeCloseTo(KNOWN_DOSE[salt]!, 6)
    })
  })
})

describe('golden test: known recipe reproduced to >= 6 decimals', () => {
  // Build a target purely from the known dose into distilled (zero) water.
  const target = forward(KNOWN_DOSE)
  const source: IonProfile = {}

  it('NNLS and the sequential oracle agree to >= 6 decimals', () => {
    const oracleDose = sequentialOracle(target, source, DETERMINED_PALETTE)
    const result = solve(target, source, DETERMINED_PALETTE)

    for (const salt of DETERMINED_PALETTE) {
      const oracleGrams = oracleDose[salt] ?? 0
      const nnlsGrams = result.dosePerLitre[salt] ?? 0
      expect(nnlsGrams).toBeCloseTo(oracleGrams, 6)
      // Both must also match the original known dose.
      expect(nnlsGrams).toBeCloseTo(KNOWN_DOSE[salt]!, 6)
      expect(oracleGrams).toBeCloseTo(KNOWN_DOSE[salt]!, 6)
    }
  })

  it('the forward round-trip reproduces the target ions to >= 6 decimals', () => {
    const result = solve(target, source, DETERMINED_PALETTE)
    for (const ion of ION_ORDER) {
      expect(result.resultProfile[ion] ?? 0).toBeCloseTo(target[ion] ?? 0, 6)
    }
  })
})

describe('source-water subtraction', () => {
  it('doses only the deficit above the source water', () => {
    const target = forward(KNOWN_DOSE)
    // Source already provides half of everything the known dose would add.
    const source = forward({
      gypsum: 0.25,
      epsom: 0.15,
      tableSalt: 0.1,
      potassiumBicarbonate: 0.2,
    })
    const result = solve(target, source, DETERMINED_PALETTE)
    expect(result.dosePerLitre.gypsum).toBeCloseTo(0.25, 6)
    expect(result.dosePerLitre.epsom).toBeCloseTo(0.15, 6)
    expect(result.dosePerLitre.tableSalt).toBeCloseTo(0.1, 6)
    expect(result.dosePerLitre.potassiumBicarbonate).toBeCloseTo(0.2, 6)
  })
})

describe('batch scaling', () => {
  it('scales the per-litre dose to a litre batch', () => {
    const target = forward(KNOWN_DOSE)
    const result = solve(target, {}, DETERMINED_PALETTE, {
      volume: 10,
      unit: 'L',
    })
    expect(result.recipe.gypsum).toBeCloseTo(0.5 * 10, 6)
  })

  it('scales to a US gallon batch', () => {
    const target = forward(KNOWN_DOSE)
    const result = solve(target, {}, DETERMINED_PALETTE, {
      volume: 1,
      unit: 'gal',
    })
    // 1 US gallon = 3.785411784 L.
    expect(result.recipe.gypsum).toBeCloseTo(0.5 * 3.785411784, 6)
  })
})

describe('readouts', () => {
  it('computes sulfate:chloride ratio, TDS and charge residual', () => {
    const target = forward(KNOWN_DOSE)
    const result = solve(target, {}, DETERMINED_PALETTE)
    const so4 = result.resultProfile.SO4 ?? 0
    const cl = result.resultProfile.Cl ?? 0
    expect(result.readouts.sulfateChlorideRatio).toBeCloseTo(so4 / cl, 9)
    // TDS is the sum of all ion concentrations.
    const tds = ION_ORDER.reduce(
      (sum, ion) => sum + (result.resultProfile[ion] ?? 0),
      0,
    )
    expect(result.readouts.tds).toBeCloseTo(tds, 9)
    // A target built from neutral salts is charge-balanced (~0 meq/L).
    expect(result.readouts.chargeResidual).toBeCloseTo(0, 6)
  })
})

describe('gypsum solubility ceiling', () => {
  it('clamps gypsum at the solubility ceiling', () => {
    // Demand more calcium sulfate than can dissolve.
    const target = forward({ gypsum: 10 })
    const result = solve(target, {}, ['gypsum'])
    expect(result.dosePerLitre.gypsum).toBeLessThanOrEqual(2.0)
    // Beyond saturation, gypsum warns.
    expect(result.warnings.some((w) => w.mineral === 'gypsum')).toBe(true)
  })
})
