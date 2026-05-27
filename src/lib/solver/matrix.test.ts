import { describe, expect, it } from 'vitest'
import { buildMatrix, contribution, forward } from './matrix'
import { ION_ORDER, IONS, SALTS } from '../chem'

describe('contribution coefficients (mg ion / g salt / L)', () => {
  it('gypsum supplies Ca and SO4 per its stoichiometry', () => {
    // 1 g gypsum = 1000/172.17 mmol -> 1 mmol Ca and 1 mmol SO4 per mmol salt.
    expect(contribution('gypsum', 'Ca')).toBeCloseTo(
      (1000 * IONS.Ca.molarMass) / SALTS.gypsum.molarMass,
      9,
    )
    expect(contribution('gypsum', 'SO4')).toBeCloseTo(
      (1000 * IONS.SO4.molarMass) / SALTS.gypsum.molarMass,
      9,
    )
    expect(contribution('gypsum', 'Na')).toBe(0)
  })

  it('calcium chloride supplies two chloride per calcium', () => {
    const ca = contribution('calciumChloride', 'Ca')
    const cl = contribution('calciumChloride', 'Cl')
    // Two mmol Cl per mmol Ca: mass ratio = 2 * Cl / Ca molar masses.
    expect(cl / ca).toBeCloseTo((2 * IONS.Cl.molarMass) / IONS.Ca.molarMass, 12)
  })
})

describe('matrix shape', () => {
  it('has one row per ion in canonical order', () => {
    const A = buildMatrix(['gypsum', 'epsom'])
    expect(A.length).toBe(ION_ORDER.length)
    expect(A[0].length).toBe(2)
  })
})

describe('forward model', () => {
  it('scales linearly with dose', () => {
    const single = forward({ gypsum: 1 })
    const double = forward({ gypsum: 2 })
    expect(double.Ca!).toBeCloseTo(2 * single.Ca!, 12)
  })

  it('omits ions a salt does not contribute', () => {
    const p = forward({ tableSalt: 1 })
    expect(p.Na).toBeGreaterThan(0)
    expect(p.Cl).toBeGreaterThan(0)
    expect(p.Ca).toBeUndefined()
  })
})
