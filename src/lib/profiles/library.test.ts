// Tests for the bundled mineral-water profile library.
//
// Data: CC-BY-SA-4.0 — Martin Lersch / Khymos (Mineral Water Calculator v6).

import { describe, expect, it } from 'vitest'
import { PROFILES, findProfile } from './library'
import { validateProfile, chargeBalanceResidual } from './validate'
import { profileToIonProfile } from './convert'

// ---------------------------------------------------------------------------
// Library shape
// ---------------------------------------------------------------------------

describe('PROFILES — library shape', () => {
  it('contains 45 profiles (44 seed rows + #98 Batch 1 net change)', () => {
    // Seed library was 44 (46 TSV rows − "test" row − removed Kessel). Issue #98
    // Batch 1 retired 3 rows (Calistoga Sparkling, Calistoga Premium, historical
    // Harghita) and added 4 (Calistoga Spring Water, Perla Harghitei, Perla
    // Harghitei Plată, Tiva Harghita): 44 − 3 + 4 = 45.
    expect(PROFILES.length).toBe(45)
  })

  it('does not contain the "test" row', () => {
    const names = PROFILES.map((p) => p.name)
    expect(names).not.toContain('test')
  })

  it('all profile names are non-empty strings', () => {
    for (const p of PROFILES) {
      expect(typeof p.name).toBe('string')
      expect(p.name.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Validation — every profile passes validateProfile
// ---------------------------------------------------------------------------

describe('PROFILES — all pass validateProfile', () => {
  it('validates every profile without errors', () => {
    const failures: string[] = []
    for (const p of PROFILES) {
      const result = validateProfile(p)
      if (!result.ok) {
        failures.push(
          `${p.name}: ${result.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`,
        )
      }
    }
    expect(failures).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Spot checks — Evian
// ---------------------------------------------------------------------------

describe('Evian — exact values from TSV', () => {
  const evian = findProfile('Evian')

  it('is found in the library', () => {
    expect(evian).toBeDefined()
  })

  it('has correct ion values', () => {
    expect(evian!.ions.Ca).toBe(80)
    expect(evian!.ions.Mg).toBe(26)
    expect(evian!.ions.Na).toBe(6.5)
    expect(evian!.ions.K).toBe(1)
    expect(evian!.ions.HCO3).toBe(360)
    expect(evian!.ions.SO4).toBe(15)
    expect(evian!.ions.Cl).toBe(10)
  })

  it('alkalinity_unit is as_HCO3', () => {
    expect(evian!.alkalinity_unit).toBe('as_HCO3')
  })

  it('ph is 7.2', () => {
    expect(evian!.ph).toBe(7.2)
  })

  it('tds is 345', () => {
    expect(evian!.tds).toBe(345)
  })

  it('co2 is 0 (source: "no gas")', () => {
    expect(evian!.co2).toBe(0)
  })

  it('provenance is verified with correct source string', () => {
    expect(evian!.provenance.verified).toBe(true)
    expect(evian!.provenance.source).toBe(
      'Evian official water quality page (evian.com/en_int)',
    )
    expect(evian!.provenance.source_date).toBe('2026-05-27')
  })

  it('NO3 value from TSV (3.8 mg/L) is preserved in comment', () => {
    expect(evian!.comment).toContain('NO₃ 3.8 mg/L')
  })
})

// ---------------------------------------------------------------------------
// Spot checks — Perrier
// ---------------------------------------------------------------------------

describe('Perrier — exact values from TSV', () => {
  const perrier = findProfile('Perrier')

  it('is found in the library', () => {
    expect(perrier).toBeDefined()
  })

  it('has correct ion values', () => {
    expect(perrier!.ions.Ca).toBe(150)
    expect(perrier!.ions.Mg).toBe(3.9)
    expect(perrier!.ions.Na).toBe(9.6)
    expect(perrier!.ions.K).toBe(0.6)
    expect(perrier!.ions.HCO3).toBe(420)
    expect(perrier!.ions.SO4).toBe(25.3)
    expect(perrier!.ions.Cl).toBe(19.5)
  })

  it('alkalinity_unit is as_HCO3', () => {
    expect(perrier!.alkalinity_unit).toBe('as_HCO3')
  })

  it('ph is 5.5', () => {
    expect(perrier!.ph).toBe(5.5)
  })

  it('tds is 456', () => {
    expect(perrier!.tds).toBe(456)
  })

  it('NO3 value (7.3 mg/L) is preserved in comment', () => {
    expect(perrier!.comment).toContain('NO₃ 7.3 mg/L')
  })
})

// ---------------------------------------------------------------------------
// Spot checks — Tea brewing (min) — newly verified against US 2006/0286263 A1
// ---------------------------------------------------------------------------

describe('Tea brewing (min) — verified against US 2006/0286263 A1', () => {
  const tea = findProfile('Tea brewing (min)')

  it('is found in the library', () => {
    expect(tea).toBeDefined()
  })

  it('has the patent "Functional water 1" ion values', () => {
    expect(tea!.ions.Ca).toBe(4.3)
    expect(tea!.ions.Mg).toBe(6.8)
    expect(tea!.ions.Na).toBe(12.7)
    expect(tea!.ions.K).toBe(4.3)
    expect(tea!.ions.HCO3).toBe(10.5)
    expect(tea!.ions.SO4).toBe(3.3)
    expect(tea!.ions.Cl).toBe(23.7)
  })

  it('provenance is verified with the patent source', () => {
    expect(tea!.provenance.verified).toBe(true)
    expect(tea!.provenance.source).toContain(
      'US Patent Application 2006/0286263 A1',
    )
    expect(tea!.provenance.source_date).toBe('2026-05-28')
  })
})

// ---------------------------------------------------------------------------
// Spot checks — Voss (no HCO3 → no alkalinity_unit required)
// ---------------------------------------------------------------------------

describe('Voss — profile without HCO3', () => {
  const voss = findProfile('Voss')

  it('is found in the library', () => {
    expect(voss).toBeDefined()
  })

  it('has no HCO3 ion', () => {
    expect(voss!.ions.HCO3).toBeUndefined()
  })

  it('alkalinity_unit is absent', () => {
    expect(voss!.alkalinity_unit).toBeUndefined()
  })

  it('has correct Ca and Mg', () => {
    expect(voss!.ions.Ca).toBe(2.7)
    expect(voss!.ions.Mg).toBe(0.61)
  })
})

// ---------------------------------------------------------------------------
// Spot checks — Dorna (re-sourced to a real HCO3 value)
// ---------------------------------------------------------------------------

describe('Dorna — real HCO3 with alkalinity_unit', () => {
  const dorna = findProfile('Dorna')

  it('is found', () => {
    expect(dorna).toBeDefined()
  })

  it('HCO3 is the current bottler value', () => {
    expect(dorna!.ions.HCO3).toBe(680.8)
  })

  it('alkalinity_unit is as_HCO3', () => {
    expect(dorna!.alkalinity_unit).toBe('as_HCO3')
  })
})

// ---------------------------------------------------------------------------
// Spot checks — San Narciso (naturally carbonated, no numeric CO2 published)
// ---------------------------------------------------------------------------

describe('San Narciso — CO2 handling', () => {
  const sn = findProfile('San Narciso')

  it('is found', () => {
    expect(sn).toBeDefined()
  })

  it('co2 is absent (bottler publishes no numeric CO₂ figure)', () => {
    expect(sn!.co2).toBeUndefined()
  })

  it('comment confirms natural carbonation', () => {
    expect(sn!.comment).toContain('agua con gas natural')
  })
})

// ---------------------------------------------------------------------------
// Spot checks — Contrex (CO2 "no gas" → 0)
// ---------------------------------------------------------------------------

describe('Contrex — CO2 "no gas" → 0', () => {
  const contrex = findProfile('Contrex')

  it('is found', () => {
    expect(contrex).toBeDefined()
  })

  it('co2 is 0', () => {
    expect(contrex!.co2).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Charge-balance sanity check
// ---------------------------------------------------------------------------

/**
 * Profiles that are knowingly imbalanced in the source data.
 * They pass validateProfile but their charge-balance residual is large.
 * Listed here to make the imbalance explicit and prevent silent regressions
 * when the data is refreshed (issue #11).
 */
const KNOWN_IMBALANCED = new Set([
  'Burton (beer brewing)', // classic recipe; NO3 unmeasured/excluded
  'London (beer brewing)', // classic recipe; NO3 unmeasured/excluded
  'Munich (beer brewing)', // classic recipe; NO3 unmeasured/excluded
  'Farris', // high Na/Cl, large residual
  'Saint-Yorre', // very high mineralisation, known imbalance
  'San Narciso', // high-mineralisation Na-HCO3 water; published ion set has anion excess
  'Tiva Harghita', // high-bicarbonate RO carbonated water; published ion set has cation deficit (residual ≈ -2.9 meq/L)
])

describe('charge-balance sanity', () => {
  it('every profile produces a finite residual', () => {
    for (const p of PROFILES) {
      const ionProfile = profileToIonProfile(p)
      const residual = chargeBalanceResidual(ionProfile)
      expect(isFinite(residual)).toBe(true)
    }
  })

  it('well-balanced profiles have |residual| < 1.5 meq/L', () => {
    const failures: string[] = []
    for (const p of PROFILES) {
      if (KNOWN_IMBALANCED.has(p.name)) continue
      const ionProfile = profileToIonProfile(p)
      const residual = chargeBalanceResidual(ionProfile)
      if (Math.abs(residual) >= 1.5) {
        failures.push(`${p.name}: residual = ${residual.toFixed(3)} meq/L`)
      }
    }
    expect(failures).toEqual([])
  })

  it('known-imbalanced profiles are listed explicitly (no silent additions)', () => {
    // This test documents which profiles have large residuals.
    // If a new profile has |residual| >= 1.5 it should be added to KNOWN_IMBALANCED.
    const largeResidual: string[] = []
    for (const p of PROFILES) {
      const ionProfile = profileToIonProfile(p)
      const residual = chargeBalanceResidual(ionProfile)
      if (Math.abs(residual) >= 1.5) {
        largeResidual.push(p.name)
      }
    }
    // Every profile with a large residual must be in the known set.
    for (const name of largeResidual) {
      expect(KNOWN_IMBALANCED.has(name)).toBe(true)
    }
  })
})
