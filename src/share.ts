// URL-hash sharing for Waterforge recipes.
//
// Encodes an AppSnapshot as a base64url string suitable for use in
// `location.hash`. The snapshot JSON is small (typically <500 bytes), so plain
// base64url is sufficient — no compression step is needed.
//
// Encoding:  JSON.stringify(snapshot)  →  base64url string
// Decoding:  base64url string  →  JSON.parse  →  unknown (caller validates)
//
// The prefix "v1:" is prepended to the encoded string so we can introduce
// alternative encodings (e.g. compressed) in the future without breaking old
// links.  Any hash that doesn't start with "v1:" is ignored.

/** The prefix written before the base64url payload. */
const HASH_PREFIX = 'v1:'

/**
 * Encode a plain object as a base64url string for use in `location.hash`.
 *
 * Returns the full hash value (without the leading `#`).
 */
export function encodeHash(snapshot: unknown): string {
  const json = JSON.stringify(snapshot)
  const bytes = new TextEncoder().encode(json)

  // btoa works on a binary string — convert Uint8Array to binary string first.
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }

  // Standard base64 → base64url: replace + → -, / → _, strip trailing =
  const b64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return HASH_PREFIX + b64
}

/**
 * Decode a hash value (without the leading `#`) into the original object.
 *
 * Returns `null` if the string is missing, uses an unrecognised prefix, or
 * contains invalid base64 / non-JSON content — callers should treat `null` as
 * "no shareable state in the URL".
 */
export function decodeHash(hash: string): unknown {
  if (!hash || !hash.startsWith(HASH_PREFIX)) return null

  const b64url = hash.slice(HASH_PREFIX.length)
  if (!b64url) return null

  try {
    // Reverse base64url → base64, add back padding
    const b64 =
      b64url.replace(/-/g, '+').replace(/_/g, '/') +
      '=='.slice(0, (4 - (b64url.length % 4)) % 4)

    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const json = new TextDecoder().decode(bytes)
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
