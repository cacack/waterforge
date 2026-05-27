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
  solve,
  type IonProfile,
  type Profile,
  type SaltId,
  type SolveResult,
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
})

/** The live solver result for the current inputs (null until a target is chosen). */
export function computeResult(): SolveResult | null {
  if (!app.target) return null
  const target = profileToIonProfile(app.target)
  const source = app.sourceMode === 'known' ? app.source : {}
  return solve(target, source, app.salts, app.batch)
}
