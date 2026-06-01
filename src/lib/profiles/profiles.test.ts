import { describe, expect, it } from 'vitest'
import { validateProfile, chargeBalanceResidual } from './validate'
import { profileToIonProfile } from './convert'
import { findProfile } from './library'
import { HCO3_PER_CACO3 } from '../chem/conversions'
import { IONS, SO4_WEIGHT } from '../chem/constants'
import type { CarbonationUnit } from '../chem/carbonation'
import type { Profile } from './types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A minimal, fully-valid profile (as_HCO3 convention). */
const EVIAN_LIKE: Profile = {
  name: 'Evian-like',
  ions: { Ca: 80, Mg: 26, Na: 6.5, K: 1, HCO3: 360, SO4: 12.6, Cl: 6.8 },
  alkalinity_unit: 'as_HCO3',
  provenance: {
    verified: true,
    source: 'Evian label analysis 2024',
    source_date: '2024-01-15',
  },
}

/** Same water, but bicarbonate expressed as-CaCO3 (÷ 1.219 from as-HCO3). */
const EVIAN_CACO3: Profile = {
  ...EVIAN_LIKE,
  ions: {
    ...EVIAN_LIKE.ions,
    // 360 mg/L as HCO3 → 360 / 1.219 ≈ 295.3 mg/L as CaCO3
    HCO3: 360 / HCO3_PER_CACO3,
  },
  alkalinity_unit: 'as_CaCO3',
}

/** A valid profile with no HCO3 (alkalinity_unit may be absent). */
const NO_HCO3: Profile = {
  name: 'Low-alkalinity spring',
  ions: { Ca: 20, Mg: 5, Na: 10, Cl: 15, SO4: 8 },
  provenance: {
    verified: false,
    source: 'Lab report 2023',
    source_date: '2023-06-01',
  },
}

// ---------------------------------------------------------------------------
// validateProfile — valid inputs
// ---------------------------------------------------------------------------

describe('validateProfile — valid inputs', () => {
  it('accepts a complete as_HCO3 profile', () => {
    const result = validateProfile(EVIAN_LIKE)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('Evian-like')
      expect(result.value.alkalinity_unit).toBe('as_HCO3')
    }
  })

  it('accepts a complete as_CaCO3 profile', () => {
    expect(validateProfile(EVIAN_CACO3).ok).toBe(true)
  })

  it('accepts a profile without HCO3 and without alkalinity_unit', () => {
    expect(validateProfile(NO_HCO3).ok).toBe(true)
  })

  it('accepts a profile without HCO3 but WITH alkalinity_unit (allowed)', () => {
    const p = {
      ...NO_HCO3,
      alkalinity_unit: 'as_HCO3' as const,
    }
    expect(validateProfile(p).ok).toBe(true)
  })

  it('accepts optional fields co2, ph, tds, comment, url', () => {
    const p: Profile = {
      ...EVIAN_LIKE,
      co2: 5,
      ph: 7.2,
      tds: 309,
      comment: 'High Alps spring',
      url: 'https://example.com/evian',
    }
    const result = validateProfile(p)
    expect(result.ok).toBe(true)
  })

  it('accepts zero concentrations', () => {
    const p: Profile = {
      name: 'Pure water baseline',
      ions: { Ca: 0, Mg: 0, Na: 0 },
      provenance: {
        verified: false,
        source: 'Distilled water reference',
        source_date: '2024-01-01',
      },
    }
    expect(validateProfile(p).ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateProfile — invalid inputs
// ---------------------------------------------------------------------------

describe('validateProfile — invalid inputs', () => {
  it('rejects non-object input', () => {
    const result = validateProfile('not an object')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0)
    }
  })

  it('rejects missing name', () => {
    const bad = { ...EVIAN_LIKE, name: '' }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'name')).toBe(true)
    }
  })

  it('rejects negative ion concentrations', () => {
    const bad = { ...EVIAN_LIKE, ions: { ...EVIAN_LIKE.ions, Ca: -1 } }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'ions.Ca')).toBe(true)
    }
  })

  it('rejects unknown ion keys', () => {
    const bad = {
      ...EVIAN_LIKE,
      ions: { ...EVIAN_LIKE.ions, Fe: 0.1 } as unknown,
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'ions.Fe')).toBe(true)
    }
  })

  it('rejects HCO3 present without alkalinity_unit (the trap)', () => {
    const bad = { ...EVIAN_LIKE, alkalinity_unit: undefined as never }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      const paths = result.errors.map((e) => e.path)
      expect(paths).toContain('alkalinity_unit')
    }
  })

  it('rejects invalid alkalinity_unit value', () => {
    const bad = { ...EVIAN_LIKE, alkalinity_unit: 'ppm' as never }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'alkalinity_unit')).toBe(true)
    }
  })

  it('rejects ph out of range', () => {
    const bad = { ...EVIAN_LIKE, ph: 15 }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'ph')).toBe(true)
    }
  })

  it('rejects missing provenance', () => {
    const bad: Record<string, unknown> = {
      name: EVIAN_LIKE.name,
      ions: EVIAN_LIKE.ions,
      alkalinity_unit: EVIAN_LIKE.alkalinity_unit,
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'provenance')).toBe(true)
    }
  })

  it('rejects malformed source_date', () => {
    const bad = {
      ...EVIAN_LIKE,
      provenance: { ...EVIAN_LIKE.provenance, source_date: '15-01-2024' },
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === 'provenance.source_date'),
      ).toBe(true)
    }
  })

  it('collects multiple errors in one pass', () => {
    const bad = { name: '', ions: { Ca: -1 }, provenance: null }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ---------------------------------------------------------------------------
// validateProfile — carbonation (still/sparkling + target)
// ---------------------------------------------------------------------------

/** A sparkling profile carrying a fully-sourced carbonation target. */
const SPARKLING_WITH_TARGET: Profile = {
  ...EVIAN_LIKE,
  name: 'Fizzy-like',
  carbonation_style: 'sparkling',
  carbonation_target: {
    value: 2.4,
    unit: 'volumes',
    provenance: {
      verified: true,
      source: 'Producer carbonation spec 2025',
      source_date: '2025-03-10',
    },
  },
}

describe('validateProfile — carbonation', () => {
  it('accepts a sparkling profile with a fully-sourced target', () => {
    const result = validateProfile(SPARKLING_WITH_TARGET)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.carbonation_style).toBe('sparkling')
      expect(result.value.carbonation_target?.value).toBe(2.4)
      expect(result.value.carbonation_target?.unit).toBe('volumes')
      expect(result.value.carbonation_target?.provenance.verified).toBe(true)
    }
  })

  it('accepts a target with no carbonation_style (unknown ≠ still)', () => {
    const p: Profile = { ...SPARKLING_WITH_TARGET }
    delete p.carbonation_style
    expect(validateProfile(p).ok).toBe(true)
  })

  it('accepts carbonation_style alone (no numeric target)', () => {
    const p = { ...EVIAN_LIKE, carbonation_style: 'still' as const }
    expect(validateProfile(p).ok).toBe(true)
  })

  it('accepts a gPerL target', () => {
    const p: Profile = {
      ...SPARKLING_WITH_TARGET,
      carbonation_target: {
        ...SPARKLING_WITH_TARGET.carbonation_target!,
        value: 4.7,
        unit: 'gPerL',
      },
    }
    expect(validateProfile(p).ok).toBe(true)
  })

  it('rejects an invalid carbonation_style', () => {
    const bad = { ...EVIAN_LIKE, carbonation_style: 'bubbly' as never }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'carbonation_style')).toBe(
        true,
      )
    }
  })

  it('rejects a target without its unit (the trap)', () => {
    const bad = {
      ...SPARKLING_WITH_TARGET,
      carbonation_target: {
        value: 2.4,
        provenance: SPARKLING_WITH_TARGET.carbonation_target!.provenance,
      } as never,
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === 'carbonation_target.unit'),
      ).toBe(true)
    }
  })

  it('rejects a target with an invalid unit', () => {
    const bad = {
      ...SPARKLING_WITH_TARGET,
      carbonation_target: {
        ...SPARKLING_WITH_TARGET.carbonation_target!,
        unit: 'psi' as never,
      },
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === 'carbonation_target.unit'),
      ).toBe(true)
    }
  })

  it('rejects a target without provenance', () => {
    const bad = {
      ...SPARKLING_WITH_TARGET,
      carbonation_target: { value: 2.4, unit: 'volumes' } as never,
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(
        result.errors.some((e) =>
          e.path.startsWith('carbonation_target.provenance'),
        ),
      ).toBe(true)
    }
  })

  it('rejects a negative target value', () => {
    const bad = {
      ...SPARKLING_WITH_TARGET,
      carbonation_target: {
        ...SPARKLING_WITH_TARGET.carbonation_target!,
        value: -1,
      },
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === 'carbonation_target.value'),
      ).toBe(true)
    }
  })

  it('rejects a target without its value (mirror of the unit trap)', () => {
    const bad = {
      ...SPARKLING_WITH_TARGET,
      carbonation_target: {
        unit: 'volumes',
        provenance: SPARKLING_WITH_TARGET.carbonation_target!.provenance,
      } as never,
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === 'carbonation_target.value'),
      ).toBe(true)
    }
  })

  it('rejects a NaN target value (number but not finite)', () => {
    const bad = {
      ...SPARKLING_WITH_TARGET,
      carbonation_target: {
        ...SPARKLING_WITH_TARGET.carbonation_target!,
        value: NaN,
      },
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === 'carbonation_target.value'),
      ).toBe(true)
    }
  })

  it('rejects a target on a still profile (incoherent combination)', () => {
    const bad: Profile = {
      ...SPARKLING_WITH_TARGET,
      carbonation_style: 'still',
    }
    const result = validateProfile(bad)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'carbonation_target')).toBe(
        true,
      )
    }
  })
})

// ---------------------------------------------------------------------------
// Round-trip: parse → serialize → parse is stable
// ---------------------------------------------------------------------------

describe('round-trip stability', () => {
  it('JSON.parse(JSON.stringify(profile)) passes validateProfile unchanged', () => {
    const serialised = JSON.parse(JSON.stringify(EVIAN_LIKE)) as unknown
    const result = validateProfile(serialised)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual(EVIAN_LIKE)
    }
  })

  it('round-trip is stable for as_CaCO3 profiles', () => {
    const serialised = JSON.parse(JSON.stringify(EVIAN_CACO3)) as unknown
    const result = validateProfile(serialised)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.alkalinity_unit).toBe('as_CaCO3')
    }
  })

  it('double serialisation is idempotent', () => {
    const once = JSON.parse(JSON.stringify(EVIAN_LIKE)) as unknown
    const twice = JSON.parse(JSON.stringify(once)) as unknown
    expect(twice).toEqual(once)
  })
})

// ---------------------------------------------------------------------------
// profileToIonProfile — alkalinity unit conversion
// ---------------------------------------------------------------------------

describe('profileToIonProfile — alkalinity conversion', () => {
  it('as_HCO3 profile passes HCO3 through unchanged', () => {
    const ion = profileToIonProfile(EVIAN_LIKE)
    expect(ion.HCO3).toBeCloseTo(360, 9)
  })

  it('as_CaCO3 profile converts HCO3 to as_HCO3 (×1.219)', () => {
    const ion = profileToIonProfile(EVIAN_CACO3)
    // The as_CaCO3 value is 360 / HCO3_PER_CACO3; converting back should give 360.
    expect(ion.HCO3).toBeCloseTo(360, 6)
  })

  it('as_CaCO3 and as_HCO3 variants produce the same IonProfile', () => {
    const fromHco3 = profileToIonProfile(EVIAN_LIKE)
    const fromCaco3 = profileToIonProfile(EVIAN_CACO3)
    expect(fromCaco3.HCO3).toBeCloseTo(fromHco3.HCO3!, 6)
  })

  it('profile without alkalinity_unit omits HCO3 from IonProfile', () => {
    const ion = profileToIonProfile(NO_HCO3)
    expect(ion.HCO3).toBeUndefined()
  })

  it('non-HCO3 ions are copied verbatim', () => {
    const ion = profileToIonProfile(EVIAN_LIKE)
    expect(ion.Ca).toBe(80)
    expect(ion.Mg).toBe(26)
    expect(ion.Na).toBe(6.5)
    expect(ion.K).toBe(1)
    expect(ion.SO4).toBe(12.6)
    expect(ion.Cl).toBe(6.8)
  })
})

// ---------------------------------------------------------------------------
// chargeBalanceResidual
// ---------------------------------------------------------------------------

describe('chargeBalanceResidual', () => {
  it('returns a number close to zero for a well-balanced profile', () => {
    // Use the IonProfile from a validated as_HCO3 profile.
    const ionProfile = profileToIonProfile(EVIAN_LIKE)
    const residual = chargeBalanceResidual(ionProfile)
    // Evian is a real water; balance should be within ±0.5 meq/L.
    expect(Math.abs(residual)).toBeLessThan(0.5)
  })

  it('returns 0 for an empty profile', () => {
    expect(chargeBalanceResidual({})).toBe(0)
  })

  it('is positive when cations dominate', () => {
    // Pure Ca²⁺, no anions → positive residual.
    const residual = chargeBalanceResidual({ Ca: 40 })
    expect(residual).toBeGreaterThan(0)
  })

  it('is negative when anions dominate', () => {
    // Pure Cl⁻, no cations → negative residual.
    const residual = chargeBalanceResidual({ Cl: 35.45 })
    expect(residual).toBeLessThan(0)
  })

  it('is exactly 0 for a hand-balanced pair (Ca / SO4)', () => {
    // 1 mmol/L Ca²⁺ (+2 meq/L) balanced by 1 mmol/L SO4²⁻ (−2 meq/L).
    // Use the exact molar masses from the engine constants to avoid rounding drift.
    //   Ca: 1 mmol/L × IONS.Ca.molarMass  → +2 meq/L
    //   SO4: 1 mmol/L × SO4_WEIGHT        → −2 meq/L  (net = 0)
    const residual = chargeBalanceResidual({
      Ca: IONS.Ca.molarMass,
      SO4: SO4_WEIGHT,
    })
    expect(residual).toBeCloseTo(0, 10)
  })
})

// ---------------------------------------------------------------------------
// Seeded bundled-profile carbonation targets (#123 data half; #132 population)
// ---------------------------------------------------------------------------

describe('bundled profiles — seeded carbonation_target', () => {
  const VALID_UNITS: readonly CarbonationUnit[] = ['volumes', 'gPerL']

  it('Perrier carries a well-formed carbonation_target', () => {
    const perrier = findProfile('Perrier')
    expect(perrier).toBeDefined()
    expect(perrier?.carbonation_style).toBe('sparkling')

    const target = perrier?.carbonation_target
    expect(target).toBeDefined()
    // value finite and strictly > 0 (0 would mean "still", recorded via style).
    expect(Number.isFinite(target?.value)).toBe(true)
    expect(target!.value).toBeGreaterThan(0)
    // unit is a valid CarbonationUnit.
    expect(VALID_UNITS).toContain(target!.unit)
    // provenance is well-formed.
    expect(typeof target!.provenance.verified).toBe('boolean')
    expect(target!.provenance.source.trim().length).toBeGreaterThan(0)
    expect(target!.provenance.source_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('Perrier passes profile validation with its carbonation_target', () => {
    const perrier = findProfile('Perrier')
    expect(validateProfile(perrier).ok).toBe(true)
  })

  it('the carbonation_target is not derived from the source co2 figure', () => {
    // Provenance discipline: the bottled target must be sourced in its own
    // right, never copied from `co2` (source dissolved CO₂). Perrier carries no
    // `co2` field, so the two cannot be conflated here — assert that invariant.
    const perrier = findProfile('Perrier')
    expect(perrier?.co2).toBeUndefined()
    expect(perrier?.carbonation_target?.value).toBeGreaterThan(0)
  })

  it('Gerolsteiner carries an authoritative (verified) carbonation_target', () => {
    const g = findProfile('Gerolsteiner')
    expect(g).toBeDefined()
    expect(g?.carbonation_style).toBe('sparkling')

    const target = g?.carbonation_target
    expect(target).toBeDefined()
    // Producer-published bottled carbonation: 7 g/L natural carbonic acid.
    expect(target!.value).toBe(7)
    expect(target!.unit).toBe('gPerL')
    expect(target!.provenance.verified).toBe(true)
    expect(target!.provenance.source_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(validateProfile(g).ok).toBe(true)
  })

  it('Gerolsteiner carbonation_target is sourced independently of co2', () => {
    // Gerolsteiner *does* carry a `co2` figure, and it happens to coincide
    // (7 g/L) because the carbonation is natural and matched to the source.
    // The discipline is that the target is not *derived from* co2: assert it
    // carries its own provenance, distinct from the profile-level source.
    const g = findProfile('Gerolsteiner')
    expect(g?.co2).toBeDefined()
    expect(g?.carbonation_target?.provenance.source).not.toBe(
      g?.provenance.source,
    )
  })
})
