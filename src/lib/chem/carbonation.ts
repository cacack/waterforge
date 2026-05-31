// Forced-carbonation math for Waterforge.
//
// This module is the carbonation analogue of the ion engine: pure, framework-
// agnostic functions that turn a target carbonation level into the regulator
// pressure needed to reach it (and back). It is deliberately independent of the
// salt solver — carbonation is an orthogonal axis to ion matching.
//
// Canonical units throughout the engine are **volumes of CO2** (the brewing
// convention) and **degrees Celsius**; gram-per-litre and Fahrenheit are
// handled at the edges via explicit converters so a unit is never assumed
// silently (cf. the as-CaCO3 / as-HCO3 discipline in conversions.ts).
//
// See docs/guides/chemistry.md §2 (Forced carbonation) for the derivation and
// the source of the empirical fit.

import { celsiusToFahrenheit, fahrenheitToCelsius } from './conversions'

/** How a carbonation figure is expressed. */
export type CarbonationUnit = 'volumes' | 'gPerL'

/** How a temperature is expressed. */
export type TemperatureUnit = 'C' | 'F'

// One "volume" of CO2 is one litre of CO2 gas (at 0 °C, 1 atm) dissolved per
// litre of water. At that reference the gas mass is ~1.96 g, so this constant
// converts between volumes and g/L. (CO2 molar mass 44.01 g/mol ÷ 22.414 L/mol
// molar volume ≈ 1.964 g/L; 1.96 is the conventionally rounded value.)
export const CO2_G_PER_L_PER_VOLUME = 1.96

/** Convert a carbonation level from volumes of CO2 to g/L. */
export function volumesToGramsPerLitre(volumes: number): number {
  return volumes * CO2_G_PER_L_PER_VOLUME
}

/** Convert a carbonation level from g/L to volumes of CO2. */
export function gramsPerLitreToVolumes(gPerL: number): number {
  return gPerL / CO2_G_PER_L_PER_VOLUME
}

/** Normalise a carbonation value in either unit to canonical volumes of CO2. */
export function toVolumes(value: number, unit: CarbonationUnit): number {
  return unit === 'volumes' ? value : gramsPerLitreToVolumes(value)
}

/** Normalise a temperature in either unit to canonical Celsius. */
export function toCelsius(value: number, unit: TemperatureUnit): number {
  return unit === 'C' ? value : fahrenheitToCelsius(value)
}

// Empirical fit relating gauge pressure (psi), temperature, and dissolved CO2,
// widely used in homebrewing. It reproduces standard CO2-solubility carbonation
// tables (Henry's law) to within their chart resolution over the fridge-to-room
// range that matters here:
//
//   volumes = (P + 14.695) * (0.01821 + 0.09011 * e^(-(T_F - 32) / 43.11))
//             - 0.003342
//
// where P is gauge pressure in psi and T_F is temperature in °F. We invert it
// to solve for the pressure given a target carbonation. See the chemistry guide
// for provenance.
const HENRY_OFFSET = 0.003342
const HENRY_A0 = 0.01821
const HENRY_A1 = 0.09011
const HENRY_TEMP_SCALE = 43.11
/** Standard atmospheric pressure in psi, to bridge absolute and gauge pressure. */
const ATMOSPHERIC_PSI = 14.695

// Temperature-dependent solubility coefficient of the empirical fit.
function solubilityCoefficient(tempC: number): number {
  const tF = celsiusToFahrenheit(tempC)
  return HENRY_A0 + HENRY_A1 * Math.exp(-(tF - 32) / HENRY_TEMP_SCALE)
}

/**
 * Regulator gauge pressure (psi) needed to dissolve `volumes` of CO2 at the
 * given temperature once the keg reaches equilibrium ("set and forget").
 *
 * Clamped at 0: a negative result means the target carbonation is below what
 * the water would hold even at atmospheric pressure (too warm / too low), so
 * no positive regulator pressure is required.
 */
export function regulatorPsi(volumes: number, tempC: number): number {
  const psi =
    (volumes + HENRY_OFFSET) / solubilityCoefficient(tempC) - ATMOSPHERIC_PSI
  return Math.max(0, psi)
}

/**
 * The equilibrium carbonation (volumes of CO2) reached at a given gauge
 * pressure and temperature — the inverse of {@link regulatorPsi}.
 */
export function volumesAtPressure(psi: number, tempC: number): number {
  return (psi + ATMOSPHERIC_PSI) * solubilityCoefficient(tempC) - HENRY_OFFSET
}
