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
  SNAPSHOT_VERSION,
  type AppSnapshot,
} from './persist.svelte'
import { PROFILES, SALT_ORDER } from '$lib'

// Reset app to known defaults before each test so tests are independent.
function resetApp() {
  const evian = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]
  app.target = evian
  app.sourceMode = 'distilled'
  app.source = {}
  app.salts = [...SALT_ORDER]
  app.batch = { volume: 1, unit: 'L' }
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
