// Shared UI state for the recipe builder (Svelte 5 runes).
//
// Holds the user's inputs — target profile, source water, salt palette, batch —
// and derives the live solver result from them. The vertical-slice components
// (#15–#20) read and mutate this `app` object; the engine in `$lib` stays
// framework-agnostic and is only called through `computeResult()`.

import {
  PROFILES,
  SALT_ORDER,
  profileToIonProfile,
  regulatorPsi,
  solve,
  toCarbonationVolumes,
  toCelsius,
  volumesToGramsPerLitre,
  type IonProfile,
  type Profile,
  type SaltId,
  type SolveResult,
  type TemperatureUnit,
  type VolumeUnit,
} from '$lib'

export type SourceMode = 'distilled' | 'known'

// A recognisable default so the shell shows a real recipe out of the box.
const defaultTarget = PROFILES.find((p) => p.name === 'Evian') ?? PROFILES[0]

export const app = $state({
  target: defaultTarget as Profile | null,
  sourceMode: 'distilled' as SourceMode,
  source: {} as IonProfile,
  salts: [...SALT_ORDER] as SaltId[],
  batch: { volume: 1, unit: 'L' as VolumeUnit },
  // Carbonating temperature for the recipe carbonation readout. Display value
  // + unit (mirrors CarbonationSection); the recipe line owns this state, the
  // standalone calculator keeps its own.
  carbonation: { temp: 4, tempUnit: 'C' as TemperatureUnit },
})

/** The live solver result for the current inputs (null until a target is chosen). */
export function computeResult(): SolveResult | null {
  if (!app.target) return null
  const target = profileToIonProfile(app.target)
  const source = app.sourceMode === 'known' ? app.source : {}
  return solve(target, source, app.salts, app.batch)
}

/**
 * Resolved carbonation instruction for the selected profile, as a discriminated
 * union so the renderer stays a thin switch and the branching is unit-testable.
 *
 * - `'target'` — the profile carries a `carbonation_target`: report the target
 *   carbonation (volumes + g/L) and the regulator PSI at the chosen carbonating
 *   temperature.
 * - `'still'` — the profile is recorded as still: no carbonation number.
 * - `'none'` — no `carbonation_target` to report, so render nothing. This
 *   covers both an unknown-style profile and a profile that is styled
 *   `'sparkling'` but has no numeric target yet — per the issue spec, we never
 *   show a guessed value, so the absence of a target (not the style) is what
 *   matters here.
 *
 * Reads `app.target` and `app.carbonation` from the module-level state
 * singleton — callers must set those before calling (the signature looks pure
 * but is not). Orthogonal to the salt solver: never touches `computeResult()`
 * or the ion math; only reuses the framework-agnostic carbonation engine.
 */
export type CarbonationReadout =
  | { kind: 'none' }
  | { kind: 'still' }
  | {
      kind: 'target'
      volumes: number
      gPerL: number
      /**
       * Regulator gauge pressure in psi. `0` is a meaningful value, not missing
       * data: it means the target is reached at atmospheric pressure (no
       * regulator needed) — `regulatorPsi` clamps negatives to 0.
       */
      psi: number
      tempC: number
    }

export function computeCarbonation(): CarbonationReadout {
  const target = app.target?.carbonation_target
  if (target) {
    const tempC = toCelsius(app.carbonation.temp, app.carbonation.tempUnit)
    const volumes = toCarbonationVolumes(target.value, target.unit)
    const gPerL = volumesToGramsPerLitre(volumes)
    const psi = regulatorPsi(volumes, tempC)
    return { kind: 'target', volumes, gPerL, psi, tempC }
  }
  if (app.target?.carbonation_style === 'still') return { kind: 'still' }
  return { kind: 'none' }
}
