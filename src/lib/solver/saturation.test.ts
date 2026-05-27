import { describe, expect, it } from 'vitest'
import {
  calciteSaturationIndex,
  gypsumSaturationIndex,
  saturationWarnings,
} from './saturation'
import { forward } from './matrix'

describe('gypsum saturation index', () => {
  it('warns on a supersaturated gypsum solution', () => {
    // 4 g/L gypsum is well past gypsum's ~2.4 g/L solubility.
    const profile = forward({ gypsum: 4 })
    const si = gypsumSaturationIndex(profile)
    expect(si).toBeGreaterThanOrEqual(0)
    const warnings = saturationWarnings(profile)
    expect(warnings.some((w) => w.mineral === 'gypsum')).toBe(true)
  })

  it('does not warn on a dilute gypsum solution', () => {
    // 0.3 g/L gypsum is comfortably undersaturated.
    const profile = forward({ gypsum: 0.3 })
    const si = gypsumSaturationIndex(profile)
    expect(si).toBeLessThan(0)
    const warnings = saturationWarnings(profile)
    expect(warnings.some((w) => w.mineral === 'gypsum')).toBe(false)
  })

  it('reports no gypsum index when sulfate is absent', () => {
    expect(gypsumSaturationIndex({ Ca: 100 })).toBe(-Infinity)
  })
})

describe('calcite saturation index', () => {
  it('reports no calcite index when carbonate is absent', () => {
    expect(calciteSaturationIndex({ Ca: 100 })).toBe(-Infinity)
  })

  it('warns when calcium and alkalinity are both high', () => {
    const profile = { Ca: 400, HCO3: 1200 }
    expect(calciteSaturationIndex(profile)).toBeGreaterThanOrEqual(0)
    const warnings = saturationWarnings(profile)
    expect(warnings.some((w) => w.mineral === 'calcite')).toBe(true)
  })
})
