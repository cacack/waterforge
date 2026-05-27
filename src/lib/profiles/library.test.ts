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
  it('contains approximately 45 profiles (TSV rows minus test row)', () => {
    // 46 data rows in source TSV, minus the "test" row = 45.
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
    expect(evian!.ions.Ca).toBe(78)
    expect(evian!.ions.Mg).toBe(24)
    expect(evian!.ions.Na).toBe(5)
    expect(evian!.ions.K).toBe(1)
    expect(evian!.ions.HCO3).toBe(357)
    expect(evian!.ions.SO4).toBe(10)
    expect(evian!.ions.Cl).toBe(4.5)
  })

  it('alkalinity_unit is as_HCO3', () => {
    expect(evian!.alkalinity_unit).toBe('as_HCO3')
  })

  it('ph is 7.2', () => {
    expect(evian!.ph).toBe(7.2)
  })

  it('tds is 357', () => {
    expect(evian!.tds).toBe(357)
  })

  it('co2 is 0 (source: "no gas")', () => {
    expect(evian!.co2).toBe(0)
  })

  it('provenance is unverified with correct source string', () => {
    expect(evian!.provenance.verified).toBe(false)
    expect(evian!.provenance.source).toBe(
      'Martin Lersch — Mineral Water Calculator v6 (Khymos)',
    )
    expect(evian!.provenance.source_date).toBe('2015-01-01')
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
    expect(perrier!.ions.Ca).toBe(147.3)
    expect(perrier!.ions.Mg).toBe(3.4)
    expect(perrier!.ions.Na).toBe(9)
    expect(perrier!.ions.K).toBe(0.6)
    expect(perrier!.ions.HCO3).toBe(390)
    expect(perrier!.ions.SO4).toBe(33)
    expect(perrier!.ions.Cl).toBe(21.5)
  })

  it('alkalinity_unit is as_HCO3', () => {
    expect(perrier!.alkalinity_unit).toBe('as_HCO3')
  })

  it('ph is 5.46', () => {
    expect(perrier!.ph).toBe(5.46)
  })

  it('tds is 475', () => {
    expect(perrier!.tds).toBe(475)
  })

  it('NO3 value from TSV (18 mg/L) is preserved in comment', () => {
    expect(perrier!.comment).toContain('NO₃ 18 mg/L')
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
    expect(voss!.ions.Ca).toBe(3.46)
    expect(voss!.ions.Mg).toBe(0.78)
  })
})

// ---------------------------------------------------------------------------
// Spot checks — Dorna (HCO3 = 0, must still have alkalinity_unit)
// ---------------------------------------------------------------------------

describe('Dorna — HCO3 = 0 with alkalinity_unit', () => {
  const dorna = findProfile('Dorna')

  it('is found', () => {
    expect(dorna).toBeDefined()
  })

  it('HCO3 is 0', () => {
    expect(dorna!.ions.HCO3).toBe(0)
  })

  it('alkalinity_unit is as_HCO3', () => {
    expect(dorna!.alkalinity_unit).toBe('as_HCO3')
  })
})

// ---------------------------------------------------------------------------
// Spot checks — San Narciso (CO2 "little gas" → omitted, note in comment)
// ---------------------------------------------------------------------------

describe('San Narciso — CO2 "little gas" handling', () => {
  const sn = findProfile('San Narciso')

  it('is found', () => {
    expect(sn).toBeDefined()
  })

  it('co2 is absent (ambiguous text omitted)', () => {
    expect(sn!.co2).toBeUndefined()
  })

  it('comment notes the omission', () => {
    expect(sn!.comment).toContain('little gas')
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
  'Dorna', // bicarbonate forced to 0; note says "adjusted"
  'Burton (beer brewing)', // classic recipe; NO3 unmeasured/excluded
  'London (beer brewing)', // classic recipe; NO3 unmeasured/excluded
  'Munich (beer brewing)', // classic recipe; NO3 unmeasured/excluded
  'Calistoga', // large Cl/Na dominance, no HCO3 balance
  'Farris', // high Na/Cl, large residual
  'Saint-Yorre', // very high mineralisation, known imbalance
  'Kessel', // very high Na, HCO3 dominant but residual present
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
