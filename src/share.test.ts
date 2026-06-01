// Tests for src/share.ts — URL-hash encode/decode round-trips and edge cases.

import { describe, it, expect, beforeEach } from 'vitest'
import { encodeHash, decodeHash, buildShareUrl } from './share'
import { app } from './state.svelte'
import {
  snapshotState,
  applySnapshot,
  SNAPSHOT_VERSION,
} from './persist.svelte'
import { PROFILES, SALT_ORDER, findProfile } from '$lib'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
// encodeHash / decodeHash round-trips
// ---------------------------------------------------------------------------

describe('encodeHash / decodeHash — round-trips', () => {
  beforeEach(resetApp)

  it('round-trips the current snapshot', () => {
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)
  })

  it('round-trips a snapshot with a target profile', () => {
    app.target = PROFILES.find((p) => p.name === 'Volvic') ?? null
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)
  })

  it('round-trips a snapshot with null target', () => {
    app.target = null
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)
  })

  it('round-trips source water ions', () => {
    app.source = { Ca: 48, Mg: 9.5, Na: 6, HCO3: 178, SO4: 12, Cl: 8 }
    app.sourceMode = 'known'
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)
  })

  it('round-trips a custom salts list', () => {
    app.salts = ['gypsum', 'epsom', 'bakingSoda']
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)
  })

  it('round-trips a non-default batch', () => {
    app.batch = { volume: 20, unit: 'gal' }
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)
  })

  it('round-trips the carbonating temperature and unit', () => {
    app.carbonation = { temp: 38, tempUnit: 'F' }
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)
    expect((decoded as Record<string, unknown>)['carbonation']).toEqual({
      temp: 38,
      tempUnit: 'F',
    })
  })

  it('produces only URL-safe characters', () => {
    const snap = snapshotState()
    const hash = encodeHash(snap)
    // Should only contain alphanumeric, hyphens, underscores, colons (prefix)
    expect(hash).toMatch(/^[A-Za-z0-9:_-]+$/)
  })

  it('does not contain base64 padding characters', () => {
    const snap = snapshotState()
    const hash = encodeHash(snap)
    expect(hash).not.toContain('=')
  })

  it('starts with the v1: prefix', () => {
    const snap = snapshotState()
    const hash = encodeHash(snap)
    expect(hash.startsWith('v1:')).toBe(true)
  })

  it('decoded object has the correct snapshot version', () => {
    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash) as Record<string, unknown>
    expect(decoded?.['version']).toBe(SNAPSHOT_VERSION)
  })
})

// ---------------------------------------------------------------------------
// Regression coverage for issue #63 — share/restore round-trip for the
// "Artificial mineral water" profile. The issue reported that the share
// button captured the wrong target (defaulting to Evian) when "Artificial
// mineral water" was selected. Lowercase 'm' in the name is significant —
// findProfile is case-sensitive exact-match.
// ---------------------------------------------------------------------------

describe('issue #63 — share/restore round-trip for "Artificial mineral water"', () => {
  beforeEach(resetApp)

  it('finds the profile by its exact name (case-sensitive)', () => {
    expect(findProfile('Artificial mineral water')).toBeDefined()
  })

  it('snapshotState captures the selected target name verbatim', () => {
    const profile = findProfile('Artificial mineral water')
    expect(profile).toBeDefined()
    app.target = profile ?? null
    const snap = snapshotState()
    expect(snap.targetName).toBe('Artificial mineral water')
  })

  it('round-trips "Artificial mineral water" through encode → decode → apply', () => {
    const profile = findProfile('Artificial mineral water')
    app.target = profile ?? null

    const snap = snapshotState()
    const hash = encodeHash(snap)
    const decoded = decodeHash(hash)
    expect(decoded).toEqual(snap)

    // Reset to a different target to prove apply actually restores.
    app.target = PROFILES.find((p) => p.name === 'Evian') ?? null
    expect(app.target?.name).toBe('Evian')

    applySnapshot(decoded)
    expect(app.target?.name).toBe('Artificial mineral water')
  })
})

// ---------------------------------------------------------------------------
// decodeHash — malformed / garbage input tolerance
// ---------------------------------------------------------------------------

describe('decodeHash — malformed input', () => {
  it('returns null for an empty string', () => {
    expect(decodeHash('')).toBeNull()
  })

  it('returns null for a hash without the v1: prefix', () => {
    expect(decodeHash('aGVsbG8=')).toBeNull()
  })

  it('returns null for a hash with only the prefix', () => {
    expect(decodeHash('v1:')).toBeNull()
  })

  it('returns null for invalid base64url after the prefix', () => {
    expect(decodeHash('v1:!!!notbase64!!!')).toBeNull()
  })

  it('returns null for valid base64 that is not valid JSON', () => {
    // Encode "not json" as base64url
    const notJson = btoa('not json')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(decodeHash('v1:' + notJson)).toBeNull()
  })

  it('does not throw on garbage input', () => {
    expect(() => decodeHash('garbage')).not.toThrow()
    expect(() => decodeHash('v1:~~~~~')).not.toThrow()
    expect(() => decodeHash('v1:' + 'x'.repeat(1000))).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl
// ---------------------------------------------------------------------------

describe('buildShareUrl', () => {
  it('builds a URL with the hash value appended', () => {
    const hash = 'v1:someencodeddata'
    const url = buildShareUrl('https://example.com', '/', hash)
    expect(url).toBe('https://example.com/#v1:someencodeddata')
  })

  it('includes the pathname when non-root', () => {
    const hash = 'v1:abc'
    const url = buildShareUrl('https://example.com', '/waterforge/', hash)
    expect(url).toBe('https://example.com/waterforge/#v1:abc')
  })
})
