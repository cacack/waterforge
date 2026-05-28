// Boot-flow integration tests for App.svelte's startup sequence.
//
// Issue #63 reported that opening a shared `v1:…` URL showed whatever the
// previous session had in localStorage rather than the snapshot encoded in
// the URL. The boot order in App.svelte is:
//
//   1. loadFromStorage()                          // localStorage → app
//   2. decodeHash(location.hash.slice(1))         // URL hash → snapshot
//   3. applySnapshot(decoded)                     // snapshot → app (wins)
//   4. initPersistence()                          // future writes to storage
//
// These tests mirror that sequence exactly to prove that the hash wins over
// any pre-existing localStorage state.
//
// Storage is stubbed via vi.stubGlobal because the engine layer doesn't have
// a real browser localStorage available in the vitest node environment, and
// loadFromStorage() is a no-op without it.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { app } from './state.svelte'
import {
  snapshotState,
  applySnapshot,
  loadFromStorage,
  SNAPSHOT_VERSION,
  type AppSnapshot,
} from './persist.svelte'
import { encodeHash, decodeHash } from './share'
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

function resetApp() {
  const evian = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]
  app.target = evian
  app.sourceMode = 'distilled'
  app.source = {}
  app.salts = [...SALT_ORDER]
  app.batch = { volume: 1, unit: 'L' }
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
    const hash = encodeHash(hashSnap)

    // Mirror App.svelte's boot sequence.
    loadFromStorage()
    expect(app.target?.name).toBe('Volvic')

    const decoded = decodeHash(hash)
    expect(decoded).not.toBeNull()
    applySnapshot(decoded)

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
    }
    const hash = encodeHash(hashSnap)

    loadFromStorage()
    applySnapshot(decodeHash(hash))

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
    const hash = encodeHash(snapshotState())

    // Simulate a fresh page load: reset state, then run boot sequence.
    resetApp()
    loadFromStorage()
    expect(app.target?.name).toBe('Volvic') // storage applied

    const decoded = decodeHash(hash)
    applySnapshot(decoded)
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
})
