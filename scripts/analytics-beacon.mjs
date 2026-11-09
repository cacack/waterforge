// Build the Cloudflare Web Analytics beacon tag for the official deploy (#338).
//
// With the Cloudflare proxy off (ADR 0025), the beacon can no longer be
// injected at the edge, so the build adds it instead. Only deploy.yml sets
// CF_BEACON_TOKEN, from a repo variable forks don't inherit — every other
// build (local, CI, forks, archived copies) ships no telemetry (ADR 0018).
//
// The token lands in the built HTML, so anything that is not 32-char lowercase
// hex fails the build rather than being injected. That is the format of the
// site token Cloudflare issued for waterforge.app; loosen the pattern if
// Cloudflare ever changes it.
//
// The exported signatures are declared by hand in analytics-beacon.d.mts —
// change both together.

const TOKEN_PATTERN = /^[0-9a-f]{32}$/

/**
 * Vite tag descriptor for the beacon, or `null` when no token is configured.
 * Surrounding whitespace (a stray newline from a paste) is ignored.
 *
 * @param {string | null | undefined} token Value of CF_BEACON_TOKEN.
 * @returns {import('vite').HtmlTagDescriptor | null}
 * @throws If the token is set but not 32 lowercase hex characters.
 */
export function beaconTag(token) {
  const value = token?.trim()
  if (!value) return null
  if (!TOKEN_PATTERN.test(value)) {
    // Deliberately does not echo the value: it may be a misplaced secret.
    throw new Error(
      'analytics-beacon: CF_BEACON_TOKEN must be 32 lowercase hex characters.',
    )
  }
  return {
    tag: 'script',
    // Mirrors Cloudflare's manual-install snippet: a classic deferred script,
    // not a module, so the beacon finds its own data-cf-beacon config.
    attrs: {
      defer: true,
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      'data-cf-beacon': JSON.stringify({ token: value }),
    },
    injectTo: 'body',
  }
}

/**
 * Vite plugin that adds the beacon to index.html in production builds only.
 * The token is validated when the HTML is transformed, not when the config
 * loads, so a bad value fails `vite build` without breaking `vite dev` or
 * vitest.
 *
 * @param {string | null | undefined} token Value of CF_BEACON_TOKEN.
 * @returns {import('vite').Plugin}
 */
export function analyticsBeaconPlugin(token) {
  return {
    name: 'waterforge:analytics-beacon',
    apply: 'build',
    transformIndexHtml() {
      const tag = beaconTag(token)
      return tag ? [tag] : undefined
    },
  }
}
