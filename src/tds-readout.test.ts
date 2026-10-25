// Tests for computeTdsReadout() — the logic behind the readouts panel's TDS
// cell. Logic-level only (no DOM render), mirroring the other `src/*.test.ts`
// suites. Uses in-test fixtures for the readout logic, plus one catalog
// spot-check for the issue #303 acceptance example.

import { describe, it, expect, beforeEach } from 'vitest'
import { app, computeResult, computeTdsReadout } from './state.svelte'
import { PROFILES, SALT_ORDER, type Profile } from '$lib'

function resetApp() {
  app.target = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]
  app.sourceMode = 'distilled'
  app.source = {}
  app.salts = [...SALT_ORDER]
  app.batch = { volume: 1, unit: 'L' }
}

const provenance = {
  verified: false,
  source: 'test',
  source_date: '2026-01-01',
}

const withoutTds: Profile = {
  name: 'Test (no TDS)',
  ions: { Na: 10, Cl: 15 },
  provenance,
}

const withTds: Profile = {
  ...withoutTds,
  name: 'Test (published TDS)',
  tds: { value: 20, provenance },
}

function readoutFor(target: Profile | null) {
  app.target = target
  return computeTdsReadout(computeResult(), app.target)
}

describe('computeTdsReadout', () => {
  beforeEach(resetApp)

  it('returns null without a result', () => {
    expect(readoutFor(null)).toBeNull()
  })

  it('reports the sum of ions from the result and its band', () => {
    app.target = withoutTds
    const result = computeResult()
    const readout = computeTdsReadout(result, app.target)
    expect(readout!.sumOfIons).toBe(result!.readouts.tds)
    expect(readout!.band.id).toBe('very-light')
    expect(readout!.published).toBeNull()
  })

  it('passes the target’s published TDS through with its provenance', () => {
    const readout = readoutFor(withTds)
    expect(readout!.published).toEqual(withTds.tds)
  })

  // Catalog spot-check (issue #303 acceptance example). Tied to profile data:
  // a refresh of San Pellegrino's analysis may legitimately move these numbers.
  it('San Pellegrino: sum ≈ 953, published 860, band Rich', () => {
    const readout = readoutFor(
      PROFILES.find((p) => p.slug === 'san-pellegrino')!,
    )
    // The readout is the recipe's sum of ions; the solver's best fit lands
    // within a couple of mg/L of the target's 953.6.
    expect(Math.abs(readout!.sumOfIons - 953)).toBeLessThanOrEqual(2)
    expect(readout!.band.id).toBe('rich')
    expect(readout!.published?.value).toBe(860)
  })
})
