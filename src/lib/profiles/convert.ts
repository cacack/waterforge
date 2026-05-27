// Profile → engine IonProfile converter.
//
// Normalises a validated Profile to the engine's canonical representation:
// all seven ions in mg/L with HCO₃ expressed as-HCO₃. The alkalinity
// conversion is the one conversion that MUST be explicit (the ×1.219 trap).

import { caco3ToHco3 } from '../chem/conversions'
import type { IonProfile } from '../solver/types'
import type { Profile } from './types'

/**
 * Convert a validated `Profile` to the engine's canonical `IonProfile`.
 *
 * The `IonProfile` that the solver expects has:
 * - all ion concentrations in mg/L
 * - HCO₃ expressed **as-HCO₃** (not as-CaCO₃)
 *
 * This function handles the alkalinity unit conversion transparently:
 * - `alkalinity_unit === 'as_HCO3'` — HCO₃ value is used as-is.
 * - `alkalinity_unit === 'as_CaCO3'` — HCO₃ value is converted via
 *   `caco3ToHco3()` (multiply by HCO₃_WEIGHT / CaCO₃_EQUIVALENT_WEIGHT ≈ 1.219).
 * - `alkalinity_unit` absent — HCO₃ is omitted from the result.
 *
 * All other ions are copied verbatim (they are always mg/L in the Profile).
 *
 * @param profile - A profile that has passed `validateProfile`.
 * @returns An `IonProfile` ready to pass to `solve()`.
 */
export function profileToIonProfile(profile: Profile): IonProfile {
  const result: IonProfile = {}
  const { ions, alkalinity_unit } = profile

  for (const [key, value] of Object.entries(ions)) {
    if (value === undefined || value === null) continue
    const id = key as keyof typeof ions

    if (id === 'HCO3') {
      if (alkalinity_unit === 'as_CaCO3') {
        result.HCO3 = caco3ToHco3(value)
      } else if (alkalinity_unit === 'as_HCO3') {
        result.HCO3 = value
      }
      // If alkalinity_unit is absent, HCO3 is not reported — skip it.
    } else {
      result[id] = value
    }
  }

  return result
}
