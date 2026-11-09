// Tests for the deploy-only Cloudflare Web Analytics beacon (#338).

import { describe, it, expect } from 'vitest'
import {
  analyticsBeaconPlugin,
  beaconTag,
} from '../scripts/analytics-beacon.mjs'

const TOKEN = '0123456789abcdef0123456789abcdef'

const EXPECTED_TAG = {
  tag: 'script',
  attrs: {
    defer: true,
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    'data-cf-beacon': `{"token":"${TOKEN}"}`,
  },
  injectTo: 'body',
}

describe('beaconTag', () => {
  it.each([undefined, null, '', '  \n'])(
    'returns null for %j (no beacon)',
    (token) => {
      expect(beaconTag(token)).toBeNull()
    },
  )

  it('builds the beacon script descriptor for a valid token', () => {
    expect(beaconTag(TOKEN)).toEqual(EXPECTED_TAG)
  })

  it('ignores surrounding whitespace from a pasted token', () => {
    expect(beaconTag(` ${TOKEN}\n`)).toEqual(EXPECTED_TAG)
  })

  it.each([
    ['uppercase hex', TOKEN.toUpperCase()],
    ['too short', TOKEN.slice(1)],
    ['too long', `${TOKEN}0`],
    ['injection-shaped', `${TOKEN.slice(0, 20)}"></script>`],
  ])('rejects a %s token', (_label, token) => {
    expect(() => beaconTag(token)).toThrow(/CF_BEACON_TOKEN/)
  })

  it('does not echo the rejected value', () => {
    expect(() => beaconTag('not-a-token')).toThrow(
      expect.objectContaining({
        message: expect.not.stringContaining('not-a-token'),
      }),
    )
  })
})

describe('analyticsBeaconPlugin', () => {
  // The hook ignores its arguments, so call it bare.
  const transform = (token: string | undefined) =>
    (analyticsBeaconPlugin(token).transformIndexHtml as () => unknown)()

  it('applies to production builds only', () => {
    expect(analyticsBeaconPlugin(TOKEN).apply).toBe('build')
  })

  it('leaves the HTML untouched without a token', () => {
    expect(transform(undefined)).toBeUndefined()
    expect(transform('')).toBeUndefined()
  })

  it('injects the beacon tag with a token', () => {
    expect(transform(TOKEN)).toEqual([EXPECTED_TAG])
  })

  it('defers validation until the HTML is transformed', () => {
    // Creating the plugin (every config load, incl. dev and vitest) must not
    // throw; only the build's HTML transform does.
    expect(() => analyticsBeaconPlugin('bad')).not.toThrow()
    expect(() => transform('bad')).toThrow(/CF_BEACON_TOKEN/)
  })
})
