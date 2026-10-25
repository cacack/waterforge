import { describe, expect, it } from 'vitest'
import { MINERAL_BANDS, mineralBand } from './mineral-band'

describe('MINERAL_BANDS', () => {
  it('starts at 0 and is strictly ascending', () => {
    expect(MINERAL_BANDS[0].min).toBe(0)
    for (let i = 1; i < MINERAL_BANDS.length; i++) {
      expect(MINERAL_BANDS[i].min).toBeGreaterThan(MINERAL_BANDS[i - 1].min)
    }
  })

  it('has unique ids', () => {
    const ids = MINERAL_BANDS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('mineralBand', () => {
  it.each([
    [0, 'very-light'],
    [99, 'very-light'],
    [100, 'light'],
    [299, 'light'],
    [300, 'medium'],
    [699, 'medium'],
    [700, 'rich'],
    [1499, 'rich'],
    [1500, 'bold'],
    [10000, 'bold'],
  ])('%d mg/L is %s', (tds, id) => {
    expect(mineralBand(tds).id).toBe(id)
  })

  it('treats non-integer values against the inclusive lower bound', () => {
    expect(mineralBand(99.9).id).toBe('very-light')
    expect(mineralBand(299.99).id).toBe('light')
  })

  it('clamps negative and NaN input to the lowest band', () => {
    expect(mineralBand(-5).id).toBe('very-light')
    expect(mineralBand(Number.NaN).id).toBe('very-light')
  })

  it('returns the band label', () => {
    expect(mineralBand(450).label).toBe('Medium')
  })
})
