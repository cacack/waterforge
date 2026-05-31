import { describe, expect, it } from 'vitest'
import { fahrenheitToCelsius } from './conversions'
import {
  CO2_G_PER_L_PER_VOLUME,
  gramsPerLitreToVolumes,
  regulatorPsi,
  toCelsius,
  toVolumes,
  volumesAtPressure,
  volumesToGramsPerLitre,
} from './carbonation'

describe('volumes <-> g/L', () => {
  it('1 volume of CO2 is ~1.96 g/L', () => {
    expect(volumesToGramsPerLitre(1)).toBeCloseTo(CO2_G_PER_L_PER_VOLUME, 12)
  })

  it('round-trips', () => {
    expect(gramsPerLitreToVolumes(volumesToGramsPerLitre(2.4))).toBeCloseTo(
      2.4,
      12,
    )
  })
})

describe('unit normalisation', () => {
  it('toVolumes passes volumes through and converts g/L', () => {
    expect(toVolumes(2.4, 'volumes')).toBe(2.4)
    expect(toVolumes(volumesToGramsPerLitre(2.4), 'gPerL')).toBeCloseTo(2.4, 12)
  })

  it('toCelsius passes °C through and converts °F', () => {
    expect(toCelsius(4, 'C')).toBe(4)
    expect(toCelsius(32, 'F')).toBeCloseTo(0, 12)
  })
})

describe('regulatorPsi (empirical force-carbonation fit)', () => {
  // Reference cells from standard CO2 carbonation charts (tolerance ~0.5 psi
  // covers chart rounding and the empirical fit).
  it('~2.0 volumes at 32 °F needs ~3.8 psi', () => {
    expect(regulatorPsi(2.0, fahrenheitToCelsius(32))).toBeCloseTo(3.8, 1)
  })

  it('~2.4 volumes at 40 °F needs ~11.1 psi', () => {
    expect(regulatorPsi(2.4, fahrenheitToCelsius(40))).toBeCloseTo(11.1, 1)
  })

  it('~2.5 volumes at 38 °F needs ~11.2 psi', () => {
    expect(regulatorPsi(2.5, fahrenheitToCelsius(38))).toBeCloseTo(11.2, 1)
  })

  it('clamps to 0 when the target is below atmospheric solubility (warm + low)', () => {
    // 0.5 volumes at 75 °F would imply a negative gauge pressure.
    expect(regulatorPsi(0.5, fahrenheitToCelsius(75))).toBe(0)
  })

  it('rises with carbonation at fixed temperature', () => {
    const t = fahrenheitToCelsius(38)
    expect(regulatorPsi(3.0, t)).toBeGreaterThan(regulatorPsi(2.0, t))
  })

  it('rises with temperature at fixed carbonation', () => {
    expect(regulatorPsi(2.5, fahrenheitToCelsius(50))).toBeGreaterThan(
      regulatorPsi(2.5, fahrenheitToCelsius(35)),
    )
  })
})

describe('volumesAtPressure (inverse)', () => {
  it('round-trips with regulatorPsi over the practical range', () => {
    const t = fahrenheitToCelsius(38)
    const psi = regulatorPsi(2.5, t)
    expect(volumesAtPressure(psi, t)).toBeCloseTo(2.5, 6)
  })
})
