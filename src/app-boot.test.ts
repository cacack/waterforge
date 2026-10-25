// Boot-flow integration tests for App.svelte's startup sequence.
//
// Issue #63 reported that opening a shared URL showed whatever the previous
// session had in localStorage rather than the snapshot encoded in the URL.
// The boot order in App.svelte is:
//
//   1. loadFromStorage()                          // localStorage → app
//   2. parseHash(location.hash.slice(1))          // URL hash → snapshot/slug
//   3. applySnapshot(snapshot) | app.target = …   // hash → app (wins)
//   4. initPersistence()                          // future writes to storage
//
// These tests mirror that sequence exactly (`applyHash` below calls the same
// parseHash + applyParsedHash pair as App.svelte's applyHashIfPresent) to prove that the hash wins over any
// pre-existing localStorage state, and that a `#<slug>` target link changes
// only the target (issue #302).
//
// Storage is stubbed via vi.stubGlobal because the engine layer doesn't have
// a real browser localStorage available in the vitest node environment, and
// loadFromStorage() is a no-op without it.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { app } from './state.svelte'
import {
  snapshotState,
  applyParsedHash,
  loadFromStorage,
  SNAPSHOT_VERSION,
  type AppSnapshot,
} from './persist.svelte'
import { encodeShareHash, parseHash } from './share'
import { PROFILES, SALT_ORDER, findProfile } from '$lib'

// ---------------------------------------------------------------------------
// In-memory localStorage stub
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'waterforge:state'

function createStorageStub(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (k: string) => store.get(k) ?? null,
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => {
      store.delete(k)
    },
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
  }
}

/** App.svelte's applyHashIfPresent, minus reading `location` and the history update. */
function applyHash(raw: string): boolean {
  const parsed = parseHash(raw)
  return parsed !== null && applyParsedHash(parsed)
}

function resetApp() {
  const evian = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]
  app.target = evian
  app.sourceMode = 'distilled'
  app.source = {}
  app.salts = [...SALT_ORDER]
  app.batch = { volume: 1, unit: 'L' }
  app.carbonation = { temp: 4, tempUnit: 'C' }
}

// ---------------------------------------------------------------------------
// Boot order: hash wins over localStorage
// ---------------------------------------------------------------------------

describe('App boot order — hash wins over localStorage (issue #63)', () => {
  let storage: Storage

  beforeEach(() => {
    storage = createStorageStub()
    vi.stubGlobal('localStorage', storage)
    resetApp()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loadFromStorage reads a previously-saved snapshot', () => {
    const volvic = findProfile('Volvic')
    const stored: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Volvic',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(stored))

    loadFromStorage()
    expect(app.target?.name).toBe('Volvic')
    expect(volvic).toBeDefined()
  })

  it('hash-applied snapshot overrides whatever was in localStorage', () => {
    // Seed localStorage with Volvic.
    const storedSnap: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Volvic',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(storedSnap))

    // Build a hash for Evian.
    const hashSnap: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    const hash = encodeShareHash(hashSnap)

    // Mirror App.svelte's boot sequence.
    loadFromStorage()
    expect(app.target?.name).toBe('Volvic')

    expect(applyHash(hash)).toBe(true)

    expect(app.target?.name).toBe('Evian')
  })

  it('subsequent snapshotState reflects the hash state, not the storage state', () => {
    const storedSnap: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Volvic',
      sourceMode: 'distilled',
      source: { Ca: 12 },
      salts: [...SALT_ORDER],
      batch: { volume: 3, unit: 'L' },
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(storedSnap))

    const hashSnap: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'known',
      source: { Ca: 80 },
      salts: ['gypsum', 'epsom'],
      batch: { volume: 5, unit: 'gal' },
      // Default carbonating temperature: the hash omits carbonation, so apply
      // leaves the reset default, which snapshotState then re-emits.
      carbonation: { temp: 4, tempUnit: 'C' },
    }
    const hash = encodeShareHash(hashSnap)

    loadFromStorage()
    applyHash(hash)

    const after = snapshotState()
    expect(after).toEqual(hashSnap)
  })

  it('round-trips "Artificial mineral water" through the full boot sequence', () => {
    // Issue #63 highlighted this specific profile (lowercase 'm'). Seed
    // localStorage with a different profile so we can prove the hash wins.
    const storedSnap: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Volvic',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(storedSnap))

    // User had "Artificial mineral water" selected when they hit Share.
    app.target = findProfile('Artificial mineral water') ?? null
    const hash = encodeShareHash(snapshotState())

    // Simulate a fresh page load: reset state, then run boot sequence.
    resetApp()
    loadFromStorage()
    expect(app.target?.name).toBe('Volvic') // storage applied

    applyHash(hash)
    expect(app.target?.name).toBe('Artificial mineral water')
  })

  it('no hash means localStorage state is preserved', () => {
    const storedSnap: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Volvic',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(storedSnap))

    loadFromStorage()
    // No hash → no applySnapshot call → storage state remains.
    expect(app.target?.name).toBe('Volvic')
  })

  it('a second hash apply overrides state set by the first (same-tab paste)', () => {
    // Models the issue #63 reproduction: user opens waterforge.app with
    // some state, then pastes a different shared URL into the same tab.
    // The browser does not reload (fragment-only navigation), so App.svelte's
    // initial-mount hash-apply does not re-run — App.svelte must listen for
    // hashchange and re-apply. This test proves the engine layer handles
    // repeated application correctly; the listener wiring itself is verified
    // by the live reproduction recorded on the issue.
    const hashA: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Evian',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    applyHash(encodeShareHash(hashA))
    expect(app.target?.name).toBe('Evian')

    // User pastes a shared URL for a different profile into the same tab.
    const hashB: AppSnapshot = {
      version: SNAPSHOT_VERSION,
      targetName: 'Volvic',
      sourceMode: 'distilled',
      source: {},
      salts: [...SALT_ORDER],
      batch: { volume: 1, unit: 'L' },
    }
    applyHash(encodeShareHash(hashB))
    expect(app.target?.name).toBe('Volvic')
  })
})

// ---------------------------------------------------------------------------
// Target links: `#<slug>` changes only the target (issue #302)
// ---------------------------------------------------------------------------

describe('App boot — target link (issue #302)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageStub())
    resetApp()
    // A custom recipe the target link must not disturb.
    app.sourceMode = 'known'
    app.source = { Ca: 12, Mg: 3 }
    app.salts = ['gypsum', 'epsom']
    app.batch = { volume: 5, unit: 'gal' }
    app.carbonation = { temp: 40, tempUnit: 'F' }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('selects the linked target and leaves everything else untouched', () => {
    const volvic = findProfile('Volvic')
    expect(volvic?.slug).toBeTruthy()
    const before = snapshotState()

    expect(applyHash(volvic!.slug!)).toBe(true)

    expect(app.target?.name).toBe('Volvic')
    expect(snapshotState()).toEqual({ ...before, targetName: 'Volvic' })
  })

  it('an unknown slug changes nothing', () => {
    const before = snapshotState()

    expect(applyHash('no-such-water')).toBe(false)

    expect(snapshotState()).toEqual(before)
  })
})
