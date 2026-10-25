// Tests for src/share.ts — v2 share-hash round-trips, hash classification,
// legacy v1 decoding, URL length budget, and malformed-input tolerance.

import { describe, it, expect, beforeEach } from 'vitest'
import { encodeShareHash, parseHash, buildShareUrl } from './share'
import { app } from './state.svelte'
import {
  snapshotState,
  applySnapshot,
  SNAPSHOT_VERSION,
  type AppSnapshot,
} from './persist.svelte'
import { ION_ORDER, PROFILES, SALT_ORDER, findProfile } from '$lib'

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

/** Encode then parse, asserting the result is a snapshot. */
function roundTrip(snap: AppSnapshot): unknown {
  const parsed = parseHash(encodeShareHash(snap))
  expect(parsed?.kind).toBe('snapshot')
  return parsed?.kind === 'snapshot' ? parsed.snapshot : undefined
}

function toBase64url(text: string): string {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** A hand-built v2 payload: gypsum only, 1 L, 0 °C, the given slug, no ions. */
function v2WithSlug(slug: string): string {
  const bytes = [0x00, 0x01, 0x00, 0x03, 0xe8, 0x00, 0x00, slug.length]
  return '2' + toBase64url(String.fromCharCode(...bytes) + slug)
}

// ---------------------------------------------------------------------------
// encodeShareHash / parseHash — round-trips
// ---------------------------------------------------------------------------

describe('encodeShareHash / parseHash — round-trips', () => {
  beforeEach(resetApp)

  it('round-trips the current snapshot', () => {
    const snap = snapshotState()
    expect(roundTrip(snap)).toEqual(snap)
  })

  it('round-trips a null target', () => {
    app.target = null
    const snap = snapshotState()
    expect(roundTrip(snap)).toEqual(snap)
  })

  it('round-trips custom source, gallons, °F, partial salts', () => {
    app.sourceMode = 'known'
    app.source = { Ca: 48, Mg: 9.5, Na: 6, HCO3: 178, SO4: 12, Cl: 8 }
    app.salts = ['gypsum', 'epsom', 'bakingSoda']
    app.batch = { volume: 2.5, unit: 'gal' }
    app.carbonation = { temp: 38, tempUnit: 'F' }
    app.target = findProfile('Volvic') ?? null
    const snap = snapshotState()
    expect(roundTrip(snap)).toEqual(snap)
  })

  it('round-trips the minimum batch volume', () => {
    app.batch = { volume: 0.001, unit: 'L' }
    const decoded = roundTrip(snapshotState()) as AppSnapshot
    expect(decoded.batch.volume).toBe(0.001)
  })

  it('rounds to field precision', () => {
    app.sourceMode = 'known'
    app.source = { Ca: 12.34, Mg: 0.04 }
    app.batch = { volume: 1.23456, unit: 'L' }
    app.carbonation = { temp: 3.96, tempUnit: 'C' }
    const decoded = roundTrip(snapshotState()) as AppSnapshot
    expect(decoded.source).toEqual({ Ca: 12.3 }) // Mg rounds to 0 → omitted
    expect(decoded.batch.volume).toBe(1.235)
    expect(decoded.carbonation).toEqual({ temp: 4, tempUnit: 'C' })
  })

  it('clamps out-of-range values', () => {
    app.sourceMode = 'known'
    app.source = { Ca: 99999, Mg: -5 }
    app.batch = { volume: 1e9, unit: 'L' }
    app.carbonation = { temp: -5000, tempUnit: 'C' }
    const decoded = roundTrip(snapshotState()) as AppSnapshot
    expect(decoded.source).toEqual({ Ca: 6553.5 })
    expect(decoded.batch.volume).toBe(16777.215)
    expect(decoded.carbonation?.temp).toBe(-3276.8)
  })

  it('lists salts in SALT_ORDER regardless of input order', () => {
    app.salts = ['bakingSoda', 'gypsum']
    const decoded = roundTrip(snapshotState()) as AppSnapshot
    expect(decoded.salts).toEqual(['gypsum', 'bakingSoda'])
  })

  it('drops source ions in distilled mode', () => {
    app.source = { Ca: 10 }
    const decoded = roundTrip(snapshotState()) as AppSnapshot
    expect(decoded.source).toEqual({})
  })

  it('falls back to the default carbonation when the snapshot omits it', () => {
    const snap: AppSnapshot = { ...snapshotState(), carbonation: undefined }
    const decoded = roundTrip(snap) as AppSnapshot
    expect(decoded.carbonation).toEqual({ temp: 4, tempUnit: 'C' })
  })

  it('produces a URL-safe hash starting with the 2 prefix', () => {
    expect(encodeShareHash(snapshotState())).toMatch(/^2[A-Za-z0-9_-]+$/)
  })

  it('decodes to the current snapshot version', () => {
    const decoded = roundTrip(snapshotState()) as AppSnapshot
    expect(decoded.version).toBe(SNAPSHOT_VERSION)
  })

  it('decodes a known slug in a hand-built payload', () => {
    expect(parseHash(v2WithSlug('evian'))).toMatchObject({
      kind: 'snapshot',
      snapshot: {
        targetName: 'Evian',
        salts: ['gypsum'],
        batch: { volume: 1 },
      },
    })
  })

  it('decodes an unknown slug to a null target', () => {
    expect(parseHash(v2WithSlug('no-such-water'))).toMatchObject({
      kind: 'snapshot',
      snapshot: { targetName: null },
    })
  })
})

// ---------------------------------------------------------------------------
// URL length budget (issue #302: QR labels need ≤ 78 chars)
// ---------------------------------------------------------------------------

describe('share URL length', () => {
  beforeEach(resetApp)

  it('fits 78 chars for every profile × source mode', () => {
    const maxSource = Object.fromEntries(ION_ORDER.map((ion) => [ion, 6553.5]))
    for (const profile of PROFILES) {
      for (const sourceMode of ['distilled', 'known'] as const) {
        const snap: AppSnapshot = {
          ...snapshotState(),
          targetName: profile.name,
          sourceMode,
          source: sourceMode === 'known' ? maxSource : {},
        }
        const url = 'https://waterforge.app/#' + encodeShareHash(snap)
        expect(
          url.length,
          `${profile.name} / ${sourceMode}`,
        ).toBeLessThanOrEqual(78)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Legacy v1 links
// ---------------------------------------------------------------------------

describe('parseHash — legacy v1 links', () => {
  const v1Snapshot = {
    version: 1,
    targetName: 'Evian',
    sourceMode: 'known',
    source: { Ca: 48, Mg: 9.5 },
    salts: ['gypsum', 'epsom'],
    batch: { volume: 20, unit: 'gal' },
    carbonation: { temp: 38, tempUnit: 'F' },
  }
  const v1Hash = 'v1:' + toBase64url(JSON.stringify(v1Snapshot))

  it('still parses to the original snapshot', () => {
    expect(parseHash(v1Hash)).toEqual({
      kind: 'snapshot',
      snapshot: v1Snapshot,
    })
  })

  it('returns null for v1 with no payload, bad base64, or non-JSON', () => {
    expect(parseHash('v1:')).toBeNull()
    expect(parseHash('v1:!!!notbase64!!!')).toBeNull()
    expect(parseHash('v1:' + toBase64url('not json'))).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Regression coverage for issue #63 — share/restore round-trip for the
// "Artificial mineral water" profile (lowercase 'm' is significant).
// ---------------------------------------------------------------------------

describe('issue #63 — share/restore round-trip for "Artificial mineral water"', () => {
  beforeEach(resetApp)

  it('round-trips through encode → parse → apply', () => {
    app.target = findProfile('Artificial mineral water') ?? null
    const snap = snapshotState()
    const decoded = roundTrip(snap)
    expect(decoded).toEqual(snap)

    app.target = findProfile('Evian') ?? null
    applySnapshot(decoded)
    expect(app.target?.name).toBe('Artificial mineral water')
  })
})

// ---------------------------------------------------------------------------
// parseHash — target links and malformed input
// ---------------------------------------------------------------------------

describe('parseHash — classification and malformed input', () => {
  beforeEach(resetApp)

  it('classifies a slug as a target link', () => {
    expect(parseHash('evian')).toEqual({ kind: 'target', slug: 'evian' })
    expect(parseHash('acqua-panna')).toEqual({
      kind: 'target',
      slug: 'acqua-panna',
    })
  })

  it('returns null for non-slug, unknown-version, and garbage hashes', () => {
    expect(parseHash('')).toBeNull()
    expect(parseHash('Evian')).toBeNull()
    expect(parseHash('v9:x')).toBeNull()
    expect(parseHash('9abc')).toBeNull()
    expect(parseHash('2')).toBeNull()
    expect(parseHash('2!!!garbage!!!')).toBeNull()
    expect(parseHash('2' + 'A'.repeat(40))).toBeNull()
  })

  it('returns null for truncated or overlong v2 payloads', () => {
    app.sourceMode = 'known'
    app.source = { Ca: 10 }
    const hash = encodeShareHash(snapshotState())
    for (let cut = 1; cut < hash.length; cut++) {
      expect(parseHash(hash.slice(0, cut)), `cut ${cut}`).toBeNull()
    }
    expect(parseHash(hash + 'AAAA')).toBeNull()
  })

  it('does not throw on garbage input', () => {
    expect(() => parseHash('garbage!')).not.toThrow()
    expect(() => parseHash('v1:~~~~~')).not.toThrow()
    expect(() => parseHash('2' + 'x'.repeat(1001))).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl
// ---------------------------------------------------------------------------

describe('buildShareUrl', () => {
  it('builds a URL with the hash value appended', () => {
    const url = buildShareUrl('https://example.com', '/', '2abc')
    expect(url).toBe('https://example.com/#2abc')
  })

  it('includes the pathname when non-root', () => {
    const url = buildShareUrl('https://example.com', '/waterforge/', '2abc')
    expect(url).toBe('https://example.com/waterforge/#2abc')
  })
})
