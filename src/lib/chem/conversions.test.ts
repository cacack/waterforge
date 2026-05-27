import { describe, expect, it } from 'vitest'
import {
  HCO3_PER_CACO3,
  LITRES_PER_US_GALLON,
  caco3ToHco3,
  hco3ToCaco3,
  litresToUsGallons,
  mgToMmol,
  mmolToMg,
  usGallonsToLitres,
} from './conversions'
import { HCO3_WEIGHT, IONS } from './constants'

describe('mg <-> mmol', () => {
  it('round-trips through a molar mass', () => {
    const molarMass = IONS.Ca.molarMass
    const mmol = mgToMmol(80.156, molarMass)
    expect(mmol).toBeCloseTo(2, 12)
    expect(mmolToMg(mmol, molarMass)).toBeCloseTo(80.156, 12)
  })

  it('1 mmol of HCO3 weighs its derived molar mass in mg', () => {
    // Derived from atomic weights (H + C + 3*O), ~61.016 g/mol; the often-quoted
    // 61.017 is a rounding of the same sum.
    expect(mmolToMg(1, HCO3_WEIGHT)).toBeCloseTo(61.016, 3)
  })
})

describe('litre <-> US gallon', () => {
  it('uses the exact definition 1 gal = 3.785411784 L', () => {
    expect(LITRES_PER_US_GALLON).toBe(3.785411784)
    expect(usGallonsToLitres(1)).toBeCloseTo(3.785411784, 12)
  })

  it('round-trips', () => {
    expect(litresToUsGallons(usGallonsToLitres(5))).toBeCloseTo(5, 12)
  })
})

describe('alkalinity as-CaCO3 <-> as-HCO3', () => {
  it('1 mg/L as CaCO3 ~ 1.219 mg/L as HCO3 (ratio of equivalent weights)', () => {
    // HCO3_WEIGHT / CACO3_EQUIVALENT_WEIGHT, derived from atomic weights.
    expect(HCO3_PER_CACO3).toBeCloseTo(61.016 / 50.043, 4)
    expect(caco3ToHco3(1)).toBeCloseTo(HCO3_PER_CACO3, 12)
  })

  it('round-trips', () => {
    expect(hco3ToCaco3(caco3ToHco3(123.4))).toBeCloseTo(123.4, 9)
  })

  it('100 mg/L as CaCO3 is ~121.9 mg/L as HCO3', () => {
    expect(caco3ToHco3(100)).toBeCloseTo(121.93, 2)
  })
})
