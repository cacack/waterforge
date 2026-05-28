// Tests for the JSON import/export logic.
//
// The component-level UI (file picker, dialog, clipboard) is not tested here
// because it requires a DOM environment. Instead we test the pure-logic paths:
//   - export: snapshotState() round-trip fidelity and filename generation.
//   - import: AppSnapshot path, Profile path (with alkalinity unit conversion),
//     and error cases.

import { describe, it, expect, beforeEach } from 'vitest'
import { app } from './state.svelte'
import {
  snapshotState,
  applySnapshot,
  buildRecipeExport,
  SNAPSHOT_VERSION,
  type AppSnapshot,
} from './persist.svelte'
import { computeResult } from './state.svelte'
import {
  PROFILES,
  SALT_ORDER,
  profileToIonProfile,
  validateProfile,
  type Profile,
  type SaltId,
} from '$lib'

// ---------------------------------------------------------------------------
// Helpers (mirrors what Actions.svelte does inline)
// ---------------------------------------------------------------------------

function buildJson(): string {
  return JSON.stringify(snapshotState(), null, 2)
}

function buildFilename(targetName: string | null): string {
  const name = targetName ?? 'custom'
  const safe = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_.]/g, '')
  return `waterforge-${safe || 'recipe'}.json`
}

/** Mirrors the applyJson logic in Actions.svelte. Returns error string or null. */
function applyJson(raw: string): string | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return 'Invalid JSON — could not parse the text.'
  }

  if (typeof parsed === 'object' && parsed !== null && 'version' in parsed) {
    const snap = parsed as Record<string, unknown>
    if (
      typeof snap['version'] === 'number' &&
      snap['version'] !== SNAPSHOT_VERSION
    ) {
      return `Unsupported snapshot version ${snap['version']}. Only version 1 is supported.`
    }
    applySnapshot(parsed)
    return null
  }

  if (typeof parsed === 'object' && parsed !== null && 'ions' in parsed) {
    const result = validateProfile(parsed)
    if (!result.ok) {
      const msgs = result.errors.slice(0, 3).map((e) => e.message)
      return `Invalid profile: ${msgs.join('; ')}`
    }
    const profile = result.value as Profile
    const ions = profileToIonProfile(profile)
    app.target = null
    app.source = ions
    app.sourceMode = 'known'
    return null
  }

  return 'Unrecognised format. Expected a Waterforge recipe export or a water profile.'
}

// ---------------------------------------------------------------------------
// Reset helper
// ---------------------------------------------------------------------------

function resetApp() {
  const evian = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]
  app.target = evian
  app.sourceMode = 'distilled'
  app.source = {}
  app.salts = [...SALT_ORDER]
  app.batch = { volume: 1, unit: 'L' }
}

// ---------------------------------------------------------------------------
// Export: blob content equals snapshotState() JSON
// ---------------------------------------------------------------------------

describe('export — buildJson', () => {
  beforeEach(resetApp)

  it('produces valid JSON', () => {
    const json = buildJson()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('JSON content equals snapshotState() serialised', () => {
    const snap = snapshotState()
    const json = buildJson()
    expect(JSON.parse(json)).toEqual(snap)
  })

  it('includes the schema version', () => {
    const parsed = JSON.parse(buildJson()) as AppSnapshot
    expect(parsed.version).toBe(SNAPSHOT_VERSION)
  })

  it('reflects current target name', () => {
    const volvic = PROFILES.find((p) => p.name === 'Volvic') ?? null
    app.target = volvic
    const parsed = JSON.parse(buildJson()) as AppSnapshot
    expect(parsed.targetName).toBe('Volvic')
  })

  it('pretty-prints with 2-space indent', () => {
    const json = buildJson()
    // A pretty-printed object will have newlines
    expect(json).toContain('\n')
    expect(json).toContain('  ')
  })
})

// ---------------------------------------------------------------------------
// Export: filename generation
// ---------------------------------------------------------------------------

describe('export — buildFilename', () => {
  it('uses the target name in the filename', () => {
    expect(buildFilename('Evian')).toBe('waterforge-evian.json')
  })

  it('converts spaces to hyphens', () => {
    expect(buildFilename('San Pellegrino')).toBe(
      'waterforge-san-pellegrino.json',
    )
  })

  it('strips special characters', () => {
    expect(buildFilename('Foo & Bar!')).toBe('waterforge-foo--bar.json')
  })

  it('falls back to "recipe" when name is empty after sanitisation', () => {
    expect(buildFilename('!!!')).toBe('waterforge-recipe.json')
  })

  it('uses "custom" when target is null', () => {
    expect(buildFilename(null)).toBe('waterforge-custom.json')
  })
})

// ---------------------------------------------------------------------------
// Import: AppSnapshot round-trip
// ---------------------------------------------------------------------------

describe('import — AppSnapshot round-trip', () => {
  beforeEach(resetApp)

  it('applies a valid snapshot JSON and restores state', () => {
    app.target = PROFILES.find((p) => p.name === 'Volvic') ?? null
    app.batch = { volume: 5, unit: 'gal' }
    const json = buildJson()

    // Reset to different state
    resetApp()
    expect(app.target?.name).toBe('Evian')

    const err = applyJson(json)
    expect(err).toBeNull()
    expect(app.target?.name).toBe('Volvic')
    expect(app.batch).toEqual({ volume: 5, unit: 'gal' })
  })

  it('round-trips source water ions', () => {
    app.source = { Ca: 10, Mg: 3, Na: 5 }
    app.sourceMode = 'known'
    const json = buildJson()

    resetApp()
    const err = applyJson(json)
    expect(err).toBeNull()
    expect(app.source).toEqual({ Ca: 10, Mg: 3, Na: 5 })
    expect(app.sourceMode).toBe('known')
  })

  it('round-trips salts list', () => {
    app.salts = ['gypsum', 'tableSalt']
    const json = buildJson()

    resetApp()
    const err = applyJson(json)
    expect(err).toBeNull()
    expect(app.salts).toEqual(['gypsum', 'tableSalt'])
  })

  it('returns an error for unsupported version number', () => {
    const snap = {
      version: 999,
      targetName: 'Volvic',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    const err = applyJson(JSON.stringify(snap))
    expect(err).toMatch(/version 999/)
  })
})

// ---------------------------------------------------------------------------
// Import: Profile schema (alkalinity unit conversion)
// ---------------------------------------------------------------------------

describe('import — Profile schema', () => {
  beforeEach(resetApp)

  const profileAsHco3: Profile = {
    name: 'TestWater',
    ions: { Ca: 80, Mg: 26, HCO3: 360 },
    alkalinity_unit: 'as_HCO3',
    provenance: {
      verified: false,
      source: 'test',
      source_date: '2024-01-01',
    },
  }

  const profileAsCaco3: Profile = {
    name: 'TestWaterCaCO3',
    ions: { Ca: 80, Mg: 26, HCO3: 295.3 }, // ≈ 360 × (61/74.5) ≈ 295.3 as-CaCO₃
    alkalinity_unit: 'as_CaCO3',
    provenance: {
      verified: false,
      source: 'test',
      source_date: '2024-01-01',
    },
  }

  it('applies a Profile with as_HCO3 alkalinity', () => {
    const err = applyJson(JSON.stringify(profileAsHco3))
    expect(err).toBeNull()
    expect(app.sourceMode).toBe('known')
    expect(app.target).toBeNull()
    expect(app.source.HCO3).toBeCloseTo(360, 1)
    expect(app.source.Ca).toBe(80)
  })

  it('converts as_CaCO3 → as_HCO3 on import', () => {
    const err = applyJson(JSON.stringify(profileAsCaco3))
    expect(err).toBeNull()
    // profileToIonProfile multiplies by HCO3_WEIGHT / CaCO3_EQUIVALENT_WEIGHT ≈ 1.2191
    // 295.3 × 1.2191 ≈ 360
    expect(app.source.HCO3).toBeCloseTo(360, 0)
  })

  it('the two profiles produce equivalent HCO3 after conversion', () => {
    applyJson(JSON.stringify(profileAsHco3))
    const hco3FromHco3 = app.source.HCO3!

    resetApp()

    applyJson(JSON.stringify(profileAsCaco3))
    const hco3FromCaco3 = app.source.HCO3!

    expect(hco3FromHco3).toBeCloseTo(hco3FromCaco3, 0)
  })

  it('returns an error for a malformed Profile', () => {
    const bad = { ions: { Ca: 'not-a-number' }, name: 'Bad' }
    const err = applyJson(JSON.stringify(bad))
    expect(err).toMatch(/Invalid profile/)
  })
})

// ---------------------------------------------------------------------------
// Import: error handling
// ---------------------------------------------------------------------------

describe('import — error handling', () => {
  beforeEach(resetApp)

  it('returns error for invalid JSON string', () => {
    const err = applyJson('{not json}')
    expect(err).toMatch(/Invalid JSON/)
  })

  it('returns error for unrecognised format', () => {
    const err = applyJson(JSON.stringify({ foo: 'bar' }))
    expect(err).toMatch(/Unrecognised format/)
  })

  it('does not crash or modify state when given a plain string', () => {
    const nameBefore = app.target?.name
    const err = applyJson('"just a string"')
    expect(err).toMatch(/Unrecognised format/)
    expect(app.target?.name).toBe(nameBefore)
  })

  it('does not crash or modify state when given an array', () => {
    const nameBefore = app.target?.name
    const err = applyJson('[1,2,3]')
    expect(err).toMatch(/Unrecognised format/)
    expect(app.target?.name).toBe(nameBefore)
  })
})

// ---------------------------------------------------------------------------
// Export: buildRecipeExport — self-contained recipe download
// ---------------------------------------------------------------------------

describe('export — buildRecipeExport', () => {
  beforeEach(resetApp)

  it('embeds the full target profile (ions + alkalinity unit), not just the name', () => {
    const perrier = PROFILES.find((p) => p.name === 'Perrier')
    expect(perrier).toBeDefined()
    app.target = perrier!

    const exported = buildRecipeExport()

    expect(exported.targetName).toBe('Perrier')
    expect(exported.target).not.toBeNull()
    expect(exported.target!.name).toBe('Perrier')
    expect(exported.target!.ions).toEqual(perrier!.ions)
    expect(exported.target!.alkalinity_unit).toBe(
      perrier!.alkalinity_unit ?? 'as_HCO3',
    )
  })

  it('embeds the computed per-batch recipe matching computeResult().recipe', () => {
    // Known, deterministic setup: Evian target, distilled source, default
    // salt palette, 1 L batch.
    app.target = PROFILES.find((p) => p.name === 'Evian') ?? null
    app.sourceMode = 'distilled'
    app.source = {}
    app.salts = [...SALT_ORDER]
    app.batch = { volume: 1, unit: 'L' }

    const result = computeResult()
    expect(result).not.toBeNull()

    const exported = buildRecipeExport()
    expect(exported.recipe).not.toBeNull()
    expect(exported.recipe!.batchVolume).toBe(1)
    expect(exported.recipe!.batchUnit).toBe('L')

    // perBatch matches the solver's recipe ion-by-ion (floats → toBeCloseTo).
    for (const id of Object.keys(result!.recipe) as SaltId[]) {
      expect(exported.recipe!.perBatch[id] ?? 0).toBeCloseTo(
        result!.recipe[id] ?? 0,
        6,
      )
    }

    // perLitre matches the solver's dosePerLitre.
    for (const id of Object.keys(result!.dosePerLitre) as SaltId[]) {
      expect(exported.recipe!.perLitre[id] ?? 0).toBeCloseTo(
        result!.dosePerLitre[id] ?? 0,
        6,
      )
    }

    // resultProfile + readouts are populated.
    expect(exported.resultProfile).not.toBeNull()
    expect(exported.readouts).not.toBeNull()
    expect(exported.readouts!.tds).toBeCloseTo(result!.readouts.tds, 6)
  })

  it('round-trips through applySnapshot: re-importing restores the same inputs', () => {
    // Start with a non-default state we can detect was restored.
    app.target = PROFILES.find((p) => p.name === 'Volvic') ?? null
    app.sourceMode = 'known'
    app.source = { Ca: 12, Mg: 8 }
    app.salts = ['gypsum', 'tableSalt']
    app.batch = { volume: 5, unit: 'gal' }

    const json = JSON.stringify(buildRecipeExport())

    // Reset to defaults so we can verify the import actually changed things.
    resetApp()
    expect(app.target?.name).toBe('Evian')

    // Existing import path needs no change: applySnapshot reads only the
    // known input keys and silently ignores target/recipe/resultProfile/readouts.
    expect(() => applySnapshot(JSON.parse(json))).not.toThrow()

    expect(app.target?.name).toBe('Volvic')
    expect(app.sourceMode).toBe('known')
    expect(app.source).toEqual({ Ca: 12, Mg: 8 })
    expect(app.salts).toEqual(['gypsum', 'tableSalt'])
    expect(app.batch).toEqual({ volume: 5, unit: 'gal' })
  })

  it('handles a null target: target/recipe/resultProfile/readouts are all null but the file still parses', () => {
    app.target = null

    const exported = buildRecipeExport()
    expect(exported.targetName).toBeNull()
    expect(exported.target).toBeNull()
    expect(exported.recipe).toBeNull()
    expect(exported.resultProfile).toBeNull()
    expect(exported.readouts).toBeNull()

    const json = JSON.stringify(exported)
    expect(() => JSON.parse(json)).not.toThrow()

    // Re-importing leaves app.target null.
    resetApp() // sets target to Evian
    expect(snapshotState().targetName).toBe('Evian')
    applySnapshot(JSON.parse(json))
    expect(app.target).toBeNull()
  })
})
