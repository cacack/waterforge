// URL-hash sharing for Waterforge recipes.
//
// Hash grammar (the value after `#`), classified by `parseHash` on its first
// characters:
//
//   v1:<base64url>   legacy share link — base64url(JSON.stringify(snapshot)).
//                    Decode-only: still accepted, no longer produced.
//   <digit><b64url>  binary snapshot; the digit is the format version. Only
//                    `2` is known — any other version is ignored.
//   <slug>           target-only permalink (e.g. `#evian`); matches
//                    SLUG_PATTERN. Selects the target, leaves other state.
//   anything else    ignored.
//
// v2 binary layout (big-endian), produced by `encodeShareHash`:
//
//   flags          uint16  bits 0–8: salt active, per V2_SALT_BITS
//                          bit 9: sourceMode 'known'; bit 10: batch unit 'gal';
//                          bit 11: temp unit 'F'; bits 12–15: free for new
//                          salts (written 0 until assigned)
//   batch volume   uint24  thousandths (0.001 … 16777.215)
//   carb. temp     int16   tenths of a degree
//   slug length    uint8   0 = no target
//   slug           ASCII   `slugLength` bytes
//   source ions    7 × uint16 tenths of mg/L in V2_IONS order — only when bit 9 set
//
// Values are rounded to field precision and clamped to field range on encode.
// Decoding rebuilds a version-1 AppSnapshot so `applySnapshot` stays the
// single validator. Malformed input of any kind decodes to `null`.

import {
  SALT_ORDER,
  SLUG_PATTERN,
  findProfile,
  findProfileBySlug,
  type IonId,
  type IonProfile,
  type SaltId,
} from '$lib'
import { SNAPSHOT_VERSION, type AppSnapshot } from './persist.svelte'

/** The prefix of a legacy v1 (JSON) share hash. */
const V1_PREFIX = 'v1:'

/** The leading version character of a v2 binary share hash. */
const V2_PREFIX = '2'

const FLAG_SOURCE_KNOWN = 1 << 9
const FLAG_UNIT_GAL = 1 << 10
const FLAG_TEMP_F = 1 << 11

/** Fixed-size v2 header: flags (2) + volume (3) + temp (2) + slug length (1). */
const V2_HEADER_BYTES = 8

/**
 * Flag bit for each salt — the frozen v2 wire mapping, deliberately separate
 * from SALT_ORDER (the solver's dosing priority, free to change). Typed over
 * every SaltId, so a new salt fails type-check until it is given a bit. Bits
 * 9–11 are taken; a new salt takes the next free bit of 12–15 (ADR 0021).
 * Never renumber an existing entry.
 */
export const V2_SALT_BITS: Readonly<Record<SaltId, number>> = {
  gypsum: 0,
  epsom: 1,
  tableSalt: 2,
  calciumChloride: 3,
  calciumChlorideAnhydrous: 4,
  bakingSoda: 5,
  chalk: 6,
  magnesiumChloride: 7,
  potassiumBicarbonate: 8,
}

/**
 * Ion order of the v2 source-ion block — frozen, separate from ION_ORDER.
 * The block is fixed at these seven ions; carrying a new ion needs a new
 * format version (ADR 0021).
 */
export const V2_IONS: readonly IonId[] = [
  'Ca',
  'Mg',
  'Na',
  'K',
  'HCO3',
  'SO4',
  'Cl',
]
const V2_IONS_BYTES = V2_IONS.length * 2

/** App default carbonating temperature (°C), used when a snapshot omits it. */
const DEFAULT_CARBONATION = { temp: 4, tempUnit: 'C' } as const

/** Result of classifying a URL hash — see the grammar in the header. */
export type ParsedHash =
  { kind: 'snapshot'; snapshot: unknown } | { kind: 'target'; slug: string }

// ---------------------------------------------------------------------------
// base64url helpers
// ---------------------------------------------------------------------------

function bytesToBase64url(bytes: Uint8Array): string {
  // btoa works on a binary string — convert Uint8Array to binary string first.
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }
  // Standard base64 → base64url: replace + → -, / → _, strip trailing =
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Throws on invalid input; callers catch and map to `null`. */
function base64urlToBytes(b64url: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(b64url)) throw new Error('not base64url')
  // Reverse base64url → base64, add back padding
  const b64 =
    b64url.replace(/-/g, '+').replace(/_/g, '/') +
    '=='.slice(0, (4 - (b64url.length % 4)) % 4)
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** Scale, round, and clamp to an integer field; non-finite input → 0. */
function toField(
  value: number,
  scale: number,
  min: number,
  max: number,
): number {
  const scaled = Math.round(value * scale)
  if (!Number.isFinite(scaled)) return 0
  return Math.min(max, Math.max(min, scaled))
}

// ---------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------

/**
 * Encode a snapshot as a compact v2 share hash: `'2' + base64url(bytes)`.
 *
 * Returns the hash value without the leading `#`. The target is carried by
 * profile slug; a target with no profile or no slug is encoded as no target.
 */
export function encodeShareHash(snapshot: AppSnapshot): string {
  const known = snapshot.sourceMode === 'known'
  const slug =
    snapshot.targetName != null
      ? (findProfile(snapshot.targetName)?.slug ?? '')
      : ''
  const carbonation = snapshot.carbonation ?? DEFAULT_CARBONATION

  let flags = 0
  for (const id of SALT_ORDER) {
    if (snapshot.salts.includes(id)) flags |= 1 << V2_SALT_BITS[id]
  }
  if (known) flags |= FLAG_SOURCE_KNOWN
  if (snapshot.batch.unit === 'gal') flags |= FLAG_UNIT_GAL
  if (carbonation.tempUnit === 'F') flags |= FLAG_TEMP_F

  const bytes = new Uint8Array(
    V2_HEADER_BYTES + slug.length + (known ? V2_IONS_BYTES : 0),
  )
  const view = new DataView(bytes.buffer)
  view.setUint16(0, flags)
  // Min 1 (0.001), not 0: applySnapshot rejects a zero volume.
  const volume = toField(snapshot.batch.volume, 1000, 1, 0xffffff)
  view.setUint16(2, volume >>> 8)
  view.setUint8(4, volume & 0xff)
  view.setInt16(5, toField(carbonation.temp, 10, -0x8000, 0x7fff))
  view.setUint8(7, slug.length)
  for (let i = 0; i < slug.length; i++) {
    bytes[V2_HEADER_BYTES + i] = slug.charCodeAt(i)
  }
  if (known) {
    const ionsAt = V2_HEADER_BYTES + slug.length
    V2_IONS.forEach((ion, i) => {
      view.setUint16(
        ionsAt + i * 2,
        toField(snapshot.source[ion] ?? 0, 10, 0, 0xffff),
      )
    })
  }

  return V2_PREFIX + bytesToBase64url(bytes)
}

// ---------------------------------------------------------------------------
// Decode
// ---------------------------------------------------------------------------

/**
 * Classify and decode a URL hash value (without the leading `#`).
 *
 * Returns a snapshot (still `unknown` — pass it to `applySnapshot`), a target
 * slug, or `null` for anything unrecognised or malformed. Never throws.
 */
export function parseHash(raw: string): ParsedHash | null {
  if (raw.startsWith(V1_PREFIX)) {
    const snapshot = decodeHash(raw)
    return snapshot === null ? null : { kind: 'snapshot', snapshot }
  }
  if (/^[0-9]/.test(raw)) {
    if (!raw.startsWith(V2_PREFIX)) return null
    const snapshot = decodeV2(raw.slice(V2_PREFIX.length))
    return snapshot === null ? null : { kind: 'snapshot', snapshot }
  }
  if (SLUG_PATTERN.test(raw)) return { kind: 'target', slug: raw }
  return null
}

/** Decode a v2 payload (after the version char) into a version-1 snapshot. */
function decodeV2(b64url: string): AppSnapshot | null {
  let bytes: Uint8Array
  try {
    bytes = base64urlToBytes(b64url)
  } catch {
    return null
  }
  if (bytes.length < V2_HEADER_BYTES) return null

  const view = new DataView(bytes.buffer)
  const flags = view.getUint16(0)
  const known = (flags & FLAG_SOURCE_KNOWN) !== 0
  const slugLength = view.getUint8(7)
  const expected = V2_HEADER_BYTES + slugLength + (known ? V2_IONS_BYTES : 0)
  if (bytes.length !== expected) return null

  const slug = String.fromCharCode(
    ...bytes.subarray(V2_HEADER_BYTES, V2_HEADER_BYTES + slugLength),
  )
  const source: IonProfile = {}
  if (known) {
    const ionsAt = V2_HEADER_BYTES + slugLength
    V2_IONS.forEach((ion, i) => {
      const tenths = view.getUint16(ionsAt + i * 2)
      if (tenths !== 0) source[ion] = tenths / 10
    })
  }
  const salts: SaltId[] = SALT_ORDER.filter(
    (id) => (flags & (1 << V2_SALT_BITS[id])) !== 0,
  )
  const volume = ((view.getUint16(2) << 8) | view.getUint8(4)) / 1000

  return {
    version: SNAPSHOT_VERSION,
    targetName: slugLength > 0 ? (findProfileBySlug(slug)?.name ?? null) : null,
    sourceMode: known ? 'known' : 'distilled',
    source,
    salts,
    batch: { volume, unit: flags & FLAG_UNIT_GAL ? 'gal' : 'L' },
    carbonation: {
      temp: view.getInt16(5) / 10,
      tempUnit: flags & FLAG_TEMP_F ? 'F' : 'C',
    },
  }
}

/**
 * Decode a legacy `v1:` hash value (without the leading `#`) into the
 * original object.
 *
 * Returns `null` if the string is missing, uses an unrecognised prefix, or
 * contains invalid base64 / non-JSON content. Callers use {@link parseHash}.
 */
function decodeHash(hash: string): unknown {
  if (!hash || !hash.startsWith(V1_PREFIX)) return null

  const b64url = hash.slice(V1_PREFIX.length)
  if (!b64url) return null

  try {
    const json = new TextDecoder().decode(base64urlToBytes(b64url))
    return JSON.parse(json)
  } catch {
    // Invalid base64 or malformed JSON — silently ignore.
    return null
  }
}

/**
 * Build a full shareable URL for the given hash value.
 *
 * Accepts explicit `origin` and `pathname` strings so the function is testable
 * outside a browser. Call-sites in the browser pass `location.origin` and
 * `location.pathname` — that way the result works on both the root path (`/`)
 * and any base-path deployment (e.g. a GitHub Pages sub-directory).
 */
export function buildShareUrl(
  origin: string,
  pathname: string,
  hashValue: string,
): string {
  return origin + pathname + '#' + hashValue
}
