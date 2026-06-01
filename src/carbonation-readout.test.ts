// Tests for computeCarbonation() — the pure branching logic behind the recipe
// carbonation readout. Logic-level only (no DOM render), mirroring the other
// `src/*.test.ts` suites. Uses in-test profile fixtures so the suite never
// depends on profile-library data the parallel data prompt owns.

import { describe, it, expect, beforeEach } from 'vitest'
import { app, computeCarbonation } from './state.svelte'
import { PROFILES, SALT_ORDER, type Profile } from '$lib'

function resetApp() {
  app.target = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]
  app.sourceMode = 'distilled'
  app.source = {}
  app.salts = [...SALT_ORDER]
  app.batch = { volume: 1, unit: 'L' }
  app.carbonation = { temp: 4, tempUnit: 'C' }
}

const provenance = {
  verified: true,
  source: 'test',
  source_date: '2026-01-01',
}

const sparkling: Profile = {
  name: 'Test Sparkling',
  ions: { Na: 10 },
  carbonation_style: 'sparkling',
  carbonation_target: { value: 2.4, unit: 'volumes', provenance },
  provenance,
}

const sparklingGPerL: Profile = {
  name: 'Test Sparkling g/L',
  ions: { Na: 10 },
  carbonation_style: 'sparkling',
  carbonation_target: { value: 4.7, unit: 'gPerL', provenance },
  provenance,
}

const still: Profile = {
  name: 'Test Still',
  ions: { Na: 10 },
  carbonation_style: 'still',
  provenance,
}

const unknown: Profile = {
  name: 'Test Unknown',
  ions: { Na: 10 },
  provenance,
}

describe('computeCarbonation', () => {
  beforeEach(resetApp)

  it("returns 'none' when no target is selected", () => {
    app.target = null
    expect(computeCarbonation()).toEqual({ kind: 'none' })
  })

  it("returns 'none' for a profile with neither target nor style", () => {
    app.target = unknown
    expect(computeCarbonation()).toEqual({ kind: 'none' })
  })

  it("returns 'still' for a still profile", () => {
    app.target = still
    expect(computeCarbonation()).toEqual({ kind: 'still' })
  })

  it("returns 'target' with finite figures for a target profile", () => {
    app.target = sparkling
    const r = computeCarbonation()
    expect(r.kind).toBe('target')
    if (r.kind !== 'target') return
    expect(r.volumes).toBeCloseTo(2.4)
    expect(r.gPerL).toBeCloseTo(2.4 * 1.96)
    expect(r.tempC).toBe(4)
    expect(Number.isFinite(r.psi)).toBe(true)
    // Magnitude anchor (not just "> 0"): hand-computed from the Henry's-law fit
    // for 2.4 volumes at 4 °C ≈ 10.75 psi. Pins the value so a regression in
    // the engine constants or unit conversion can't pass silently.
    expect(r.psi).toBeCloseTo(10.75, 1)
  })

  it('normalises a g/L target to volumes', () => {
    app.target = sparklingGPerL
    const r = computeCarbonation()
    expect(r.kind).toBe('target')
    if (r.kind !== 'target') return
    expect(r.volumes).toBeCloseTo(4.7 / 1.96)
    expect(r.gPerL).toBeCloseTo(4.7)
  })

  it('honours the carbonating-temperature unit', () => {
    app.target = sparkling
    app.carbonation = { temp: 39.2, tempUnit: 'F' } // ≈ 4 °C
    const r = computeCarbonation()
    expect(r.kind).toBe('target')
    if (r.kind !== 'target') return
    expect(r.tempC).toBeCloseTo(4, 1)
  })

  it('PSI strictly increases as temperature rises (CO₂ less soluble when warm)', () => {
    app.target = sparkling
    const psis = [2, 4, 8, 12, 16, 20].map((t) => {
      app.carbonation = { temp: t, tempUnit: 'C' }
      const r = computeCarbonation()
      if (r.kind !== 'target') throw new Error('expected target')
      return r.psi
    })
    for (let i = 1; i < psis.length; i++) {
      expect(psis[i]).toBeGreaterThan(psis[i - 1])
      expect(Number.isFinite(psis[i])).toBe(true)
    }
  })
})
