// Tests for the versioned snapshot serialization and applySnapshot validation.
//
// Note: localStorage persistence wiring (initPersistence / loadFromStorage) is
// not tested here because those functions depend on the Svelte $effect runtime
// and browser APIs that are unavailable in the Node/vitest environment.
// Round-trip correctness of the serialization layer is what matters most.

import { describe, it, expect, beforeEach } from 'vitest'
import { app } from './state.svelte'
import {
  snapshotState,
  applySnapshot,
  buildRecipeExport,
  SNAPSHOT_VERSION,
  type AppSnapshot,
} from './persist.svelte'
import { PROFILES, SALT_ORDER, type Profile } from '$lib'

// Reset app to known defaults before each test so tests are independent.
function resetApp() {
  const evian = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]
  app.target = evian
  app.sourceMode = 'distilled'
  app.source = {}
  app.salts = [...SALT_ORDER]
  app.batch = { volume: 1, unit: 'L' }
  app.carbonation = { temp: 4, tempUnit: 'C' }
}

describe('snapshotState', () => {
  beforeEach(resetApp)

  it('returns the current schema version', () => {
    const snap = snapshotState()
    expect(snap.version).toBe(SNAPSHOT_VERSION)
  })

  it('captures targetName as the profile name string', () => {
    const snap = snapshotState()
    expect(snap.targetName).toBe('Evian')
  })

  it('captures null target as null targetName', () => {
    app.target = null
    const snap = snapshotState()
    expect(snap.targetName).toBeNull()
  })

  it('captures sourceMode', () => {
    app.sourceMode = 'known'
    const snap = snapshotState()
    expect(snap.sourceMode).toBe('known')
  })

  it('captures source water as a shallow copy', () => {
    app.source = { Ca: 12.5, Mg: 3.0 }
    const snap = snapshotState()
    expect(snap.source).toEqual({ Ca: 12.5, Mg: 3.0 })
    // Mutation after snapshot should not affect snap
    app.source = {}
    expect(snap.source).toEqual({ Ca: 12.5, Mg: 3.0 })
  })

  it('captures salts as a copy', () => {
    app.salts = ['gypsum', 'tableSalt']
    const snap = snapshotState()
    expect(snap.salts).toEqual(['gypsum', 'tableSalt'])
    // Mutation after snapshot should not affect snap
    app.salts = [...SALT_ORDER]
    expect(snap.salts).toEqual(['gypsum', 'tableSalt'])
  })

  it('captures batch', () => {
    app.batch = { volume: 5, unit: 'gal' }
    const snap = snapshotState()
    expect(snap.batch).toEqual({ volume: 5, unit: 'gal' })
  })
})

describe('applySnapshot — round-trip', () => {
  beforeEach(resetApp)

  it('round-trips target profile by name', () => {
    app.target = PROFILES.find((p) => p.name === 'Volvic') ?? null
    applySnapshot(snapshotState())
    expect(app.target?.name).toBe('Volvic')
  })

  it('round-trips null target', () => {
    app.target = null
    applySnapshot(snapshotState())
    expect(app.target).toBeNull()
  })

  it('round-trips sourceMode', () => {
    app.sourceMode = 'known'
    applySnapshot(snapshotState())
    expect(app.sourceMode).toBe('known')
  })

  it('round-trips source water', () => {
    app.source = { Ca: 10, Mg: 2, Na: 1 }
    applySnapshot(snapshotState())
    expect(app.source).toEqual({ Ca: 10, Mg: 2, Na: 1 })
  })

  it('round-trips salts', () => {
    app.salts = ['gypsum', 'epsom', 'bakingSoda']
    applySnapshot(snapshotState())
    expect(app.salts).toEqual(['gypsum', 'epsom', 'bakingSoda'])
  })

  it('round-trips batch volume and unit', () => {
    app.batch = { volume: 20, unit: 'gal' }
    applySnapshot(snapshotState())
    expect(app.batch).toEqual({ volume: 20, unit: 'gal' })
  })

  it('produces equivalent state after full round-trip', () => {
    app.target = PROFILES.find((p) => p.name === 'San Pellegrino') ?? null
    app.sourceMode = 'known'
    app.source = { Ca: 5, Cl: 2 }
    app.salts = ['gypsum', 'tableSalt', 'calciumChloride']
    app.batch = { volume: 2, unit: 'L' }

    const before = snapshotState()
    applySnapshot(before)
    const after = snapshotState()

    expect(after).toEqual(before)
  })
})

describe('carbonation — snapshot round-trip & tolerance', () => {
  beforeEach(resetApp)

  it('captures the carbonating temperature and unit', () => {
    app.carbonation = { temp: 38, tempUnit: 'F' }
    const snap = snapshotState()
    expect(snap.carbonation).toEqual({ temp: 38, tempUnit: 'F' })
  })

  it('round-trips the carbonating temperature', () => {
    app.carbonation = { temp: 6, tempUnit: 'C' }
    applySnapshot(snapshotState())
    expect(app.carbonation).toEqual({ temp: 6, tempUnit: 'C' })
  })

  it('round-trips a Fahrenheit carbonating temperature', () => {
    app.carbonation = { temp: 40, tempUnit: 'F' }
    applySnapshot(snapshotState())
    expect(app.carbonation).toEqual({ temp: 40, tempUnit: 'F' })
  })

  it('keeps the default when a legacy snapshot omits carbonation', () => {
    app.carbonation = { temp: 6, tempUnit: 'C' }
    // A snapshot from before the carbonation field existed.
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    })
    // Other state applies; carbonation is left intact (not reset).
    expect(app.target?.name).toBe('Evian')
    expect(app.carbonation).toEqual({ temp: 6, tempUnit: 'C' })
  })

  it('ignores a non-finite carbonating temperature', () => {
    app.carbonation = { temp: 4, tempUnit: 'C' }
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
      carbonation: { temp: NaN, tempUnit: 'F' },
    })
    // temp ignored (kept), but a valid unit still applies.
    expect(app.carbonation.temp).toBe(4)
    expect(app.carbonation.tempUnit).toBe('F')
  })

  it('ignores an invalid temperature unit', () => {
    app.carbonation = { temp: 4, tempUnit: 'C' }
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
      carbonation: { temp: 10, tempUnit: 'K' },
    })
    expect(app.carbonation.temp).toBe(10)
    expect(app.carbonation.tempUnit).toBe('C')
  })

  it('ignores an out-of-range carbonating temperature from a crafted snapshot', () => {
    app.carbonation = { temp: 4, tempUnit: 'C' }
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
      // A finite-but-absurd value that would otherwise propagate Infinity
      // through the carbonation math into the UI.
      carbonation: { temp: 1e308, tempUnit: 'C' },
    })
    expect(app.carbonation.temp).toBe(4)
  })
})

describe('buildRecipeExport — carbonation block', () => {
  beforeEach(resetApp)

  // In-test fixture so the test does not depend on profile-library data the
  // parallel data prompt owns.
  const sparkling: Profile = {
    name: 'Test Sparkling',
    ions: { Na: 10 },
    carbonation_style: 'sparkling',
    carbonation_target: {
      value: 2.4,
      unit: 'volumes',
      provenance: { verified: true, source: 'test', source_date: '2026-01-01' },
    },
    provenance: { verified: true, source: 'test', source_date: '2026-01-01' },
  }

  const still: Profile = {
    name: 'Test Still',
    ions: { Na: 10 },
    carbonation_style: 'still',
    provenance: { verified: true, source: 'test', source_date: '2026-01-01' },
  }

  it('embeds a resolved carbonation block for a target profile', () => {
    app.target = sparkling
    app.carbonation = { temp: 4, tempUnit: 'C' }
    const exp = buildRecipeExport()
    expect(exp.carbonationRecipe).not.toBeNull()
    expect(exp.carbonationRecipe?.targetValue).toBe(2.4)
    expect(exp.carbonationRecipe?.targetUnit).toBe('volumes')
    expect(exp.carbonationRecipe?.volumes).toBeCloseTo(2.4)
    expect(exp.carbonationRecipe?.tempC).toBe(4)
    expect(Number.isFinite(exp.carbonationRecipe?.psi)).toBe(true)
  })

  it('is null for a still profile', () => {
    app.target = still
    const exp = buildRecipeExport()
    expect(exp.carbonationRecipe).toBeNull()
  })

  it('is null for a profile with neither target nor style', () => {
    app.target = PROFILES.find((p) => p.name === 'Evian') ?? null
    const exp = buildRecipeExport()
    expect(exp.carbonationRecipe).toBeNull()
  })
})

describe('applySnapshot — version handling', () => {
  beforeEach(resetApp)

  it('ignores snapshots with a different version', () => {
    const snap: AppSnapshot = {
      version: 999,
      targetName: 'Volvic',
      sourceMode: 'known',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 5, unit: 'L' },
      carbonation: { temp: 4, tempUnit: 'C' },
    }
    applySnapshot(snap)
    // State should remain at the Evian default, not Volvic
    expect(app.target?.name).toBe('Evian')
  })

  it('ignores version 0', () => {
    applySnapshot({ version: 0, targetName: 'Volvic' })
    expect(app.target?.name).toBe('Evian')
  })
})

describe('applySnapshot — malformed input tolerance', () => {
  beforeEach(resetApp)

  it('ignores null', () => {
    expect(() => applySnapshot(null)).not.toThrow()
    expect(app.target?.name).toBe('Evian')
  })

  it('ignores undefined', () => {
    expect(() => applySnapshot(undefined)).not.toThrow()
    expect(app.target?.name).toBe('Evian')
  })

  it('ignores a primitive string', () => {
    expect(() => applySnapshot('garbage')).not.toThrow()
    expect(app.target?.name).toBe('Evian')
  })

  it('ignores an array', () => {
    expect(() => applySnapshot([])).not.toThrow()
    expect(app.target?.name).toBe('Evian')
  })

  it('tolerates an empty object (wrong version → ignored)', () => {
    expect(() => applySnapshot({})).not.toThrow()
    expect(app.target?.name).toBe('Evian')
  })

  it('resolves an unknown targetName to null', () => {
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'NoSuchWater',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    })
    expect(app.target).toBeNull()
  })

  it('filters out unrecognised salt IDs', () => {
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: ['gypsum', 'notASalt', 'tableSalt'],
      batch: { volume: 1, unit: 'L' },
    })
    expect(app.salts).toEqual(['gypsum', 'tableSalt'])
  })

  it('ignores non-finite numbers in source water', () => {
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: { Ca: Infinity, Mg: 3, Na: NaN },
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    })
    // Only Mg is valid
    expect(app.source).toEqual({ Mg: 3 })
  })

  it('ignores negative or zero batch volumes', () => {
    app.batch = { volume: 2, unit: 'L' }
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: -5, unit: 'L' },
    })
    // Volume should remain 2 from before
    expect(app.batch.volume).toBe(2)
  })

  it('ignores an invalid batch unit', () => {
    app.batch = { volume: 1, unit: 'L' }
    applySnapshot({
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 3, unit: 'fl oz' as 'L' },
    })
    // Volume updated, but unit kept as 'L'
    expect(app.batch.unit).toBe('L')
    expect(app.batch.volume).toBe(3)
  })
})
