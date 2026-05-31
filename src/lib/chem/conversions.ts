// Unit conversions for water chemistry.
//
// Concentrations are handled in mg/L and mmol/L; volumes in litres and US
// gallons; alkalinity in the two conventions the field uses (as-HCO3 and
// as-CaCO3). Mixing those alkalinity conventions is a classic error, so the
// conversion is made explicit here. See the chemistry guides under `docs/`.

import { CACO3_EQUIVALENT_WEIGHT, HCO3_WEIGHT } from './constants'

/** Exact definition: one US gallon is 3.785411784 litres. */
export const LITRES_PER_US_GALLON = 3.785411784

/** Convert a mass concentration (mg) to amount (mmol) given a molar mass (g/mol). */
export function mgToMmol(mg: number, molarMass: number): number {
  return mg / molarMass
}

/** Convert an amount (mmol) to a mass concentration (mg) given a molar mass (g/mol). */
export function mmolToMg(mmol: number, molarMass: number): number {
  return mmol * molarMass
}

/** Convert litres to US gallons. */
export function litresToUsGallons(litres: number): number {
  return litres / LITRES_PER_US_GALLON
}

/** Convert US gallons to litres. */
export function usGallonsToLitres(gallons: number): number {
  return gallons * LITRES_PER_US_GALLON
}

/** Convert a temperature from Celsius to Fahrenheit. */
export function celsiusToFahrenheit(celsius: number): number {
  return celsius * 1.8 + 32
}

/** Convert a temperature from Fahrenheit to Celsius. */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) / 1.8
}

// Alkalinity expressed as-CaCO3 and as-HCO3 measure the same thing in different
// reference compounds. CaCO3 carries two charge equivalents per mole (so its
// equivalent weight is ~50.0435 g/eq); HCO3 carries one (so its equivalent
// weight is its molar mass, ~61.017 g/eq). The ratio of equivalent weights is
// the conversion factor: 1 mg/L as CaCO3 = 61.017/50.0435 mg/L as HCO3.
export const HCO3_PER_CACO3 = HCO3_WEIGHT / CACO3_EQUIVALENT_WEIGHT

/** Convert alkalinity from mg/L as-CaCO3 to mg/L as-HCO3. */
export function caco3ToHco3(asCaco3: number): number {
  return asCaco3 * HCO3_PER_CACO3
}

/** Convert alkalinity from mg/L as-HCO3 to mg/L as-CaCO3. */
export function hco3ToCaco3(asHco3: number): number {
  return asHco3 / HCO3_PER_CACO3
}
