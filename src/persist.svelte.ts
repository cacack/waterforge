// Versioned serialization + localStorage persistence for Waterforge app state.
//
// Exports two reusable primitives that #22 (JSON export) and #23 (URL sharing)
// build on top of:
//   - snapshotState(): AppSnapshot  — captures current app state as a plain,
//     JSON-serialisable object (target stored by name, not by the full object).
//   - applySnapshot(s: unknown): void — validates then merges into `app`;
//     gracefully repairs / ignores malformed input.
//
// localStorage wiring is handled by `initPersistence()` (called once on
// startup) and a separate effect that writes on every state change.

import {
  SALT_ORDER,
  findProfile,
  type IonProfile,
  type SaltId,
  type VolumeUnit,
} from '$lib'
import { app, type SourceMode } from './state.svelte'

// ---------------------------------------------------------------------------
// Snapshot schema
// ---------------------------------------------------------------------------

/** Current schema version. Increment when the shape changes incompatibly. */
export const SNAPSHOT_VERSION = 1

/** The plain, JSON-serialisable representation of editable app state. */
export interface AppSnapshot {
  /** Schema version for forward-/backward-compat detection. */
  version: number
  /** Target profile name, or null if no target is selected. */
  targetName: string | null
  sourceMode: SourceMode
  /** Source water ion concentrations in mg/L. */
  source: IonProfile
  /** Ordered list of active salt IDs. */
  salts: SaltId[]
  batch: {
    volume: number
    unit: VolumeUnit
  }
}

// ---------------------------------------------------------------------------
// Snapshot / apply
// ---------------------------------------------------------------------------

/**
 * Capture the current app state as a versioned, JSON-serialisable snapshot.
 *
 * The target profile is stored by name (not the full object) so snapshots
 * remain small and stable across library updates.
 */
export function snapshotState(): AppSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    targetName: app.target?.name ?? null,
    sourceMode: app.sourceMode,
    source: { ...app.source },
    salts: [...app.salts],
    batch: { ...app.batch },
  }
}

/**
 * Validate and apply an unknown value as an AppSnapshot.
 *
 * - Ignores the snapshot silently if it is fundamentally malformed.
 * - Tolerates a missing `targetName` (→ null) or a name not found in the
 *   profile library (→ null).
 * - Tolerates unrecognised salt IDs (filters them out) and unknown keys.
 * - Only handles `version === 1`; future versions should add migration logic
 *   above this call.
 */
export function applySnapshot(s: unknown): void {
  if (typeof s !== 'object' || s === null) return

  const snap = s as Record<string, unknown>

  // Version guard — only apply what we understand.
  if (snap['version'] !== SNAPSHOT_VERSION) return

  // --- targetName ----------------------------------------------------------
  const rawName = snap['targetName']
  if (rawName !== null && typeof rawName !== 'string') return
  app.target = rawName != null ? (findProfile(rawName) ?? null) : null

  // --- sourceMode ----------------------------------------------------------
  const rawMode = snap['sourceMode']
  if (rawMode === 'distilled' || rawMode === 'known') {
    app.sourceMode = rawMode
  }

  // --- source --------------------------------------------------------------
  const rawSource = snap['source']
  if (typeof rawSource === 'object' && rawSource !== null) {
    const validIons: IonProfile = {}
    for (const [k, v] of Object.entries(rawSource as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isFinite(v)) {
        validIons[k as keyof IonProfile] = v
      }
    }
    app.source = validIons
  }

  // --- salts ---------------------------------------------------------------
  const rawSalts = snap['salts']
  if (Array.isArray(rawSalts)) {
    const filtered = (rawSalts as unknown[]).filter(
      (id): id is SaltId =>
        typeof id === 'string' &&
        (SALT_ORDER as readonly string[]).includes(id),
    )
    if (filtered.length > 0) {
      app.salts = filtered
    }
  }

  // --- batch ---------------------------------------------------------------
  const rawBatch = snap['batch']
  if (typeof rawBatch === 'object' && rawBatch !== null) {
    const b = rawBatch as Record<string, unknown>
    const vol = b['volume']
    const unit = b['unit']
    if (typeof vol === 'number' && Number.isFinite(vol) && vol > 0) {
      app.batch.volume = vol
    }
    if (unit === 'L' || unit === 'gal') {
      app.batch.unit = unit
    }
  }
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'waterforge:state'

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

/** Write the current snapshot to localStorage. */
function save(): void {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotState()))
  } catch {
    // Quota exceeded or private-browsing restriction — silently ignore.
  }
}

/** Read and apply a saved snapshot from localStorage, if present. */
export function loadFromStorage(): void {
  if (!canUseStorage()) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null) return
    applySnapshot(JSON.parse(raw))
  } catch {
    // Malformed JSON or parse error — silently ignore.
  }
}

/**
 * Wire up the $effect that writes to localStorage on every state change.
 *
 * Call once inside a Svelte component lifecycle (e.g. App.svelte) so the
 * effect is tracked. We expose this as a separate function (rather than a
 * top-level effect) so that:
 *   a) it doesn't run in Node/SSR environments during tests, and
 *   b) callers that apply a snapshot from a URL hash (#23) can do so before
 *      the first save fires, preventing the localStorage write from winning.
 */
export function initPersistence(): void {
  $effect(() => {
    // Read every reactive field so this effect re-runs on any state change.
    const _snap = snapshotState()
    save()
    // Svelte effects must return void (no cleanup needed here).
    void _snap
  })
}
