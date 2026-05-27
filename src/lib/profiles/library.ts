// Waterforge profile library — parsed, validated mineral-water profiles.
//
// Data: CC-BY-SA-4.0 — Martin Lersch / Khymos (Mineral Water Calculator v6).
// See LICENSE-DATA in the repository root for the full licence text.
//
// This module loads the bundled profiles.json, validates each entry at import
// time (so a malformed JSON edit surfaces immediately as a runtime error), and
// exports the resulting typed array for use by the UI and the solver.

import type { Profile } from './types'
import { validateProfile } from './validate'
import rawProfiles from './profiles.json'

/**
 * All bundled mineral-water profiles, each validated against the Profile
 * schema at module load time.
 *
 * Throws if any entry fails validation — this is intentional: a data-file
 * corruption should be caught loudly at startup, not silently ignored.
 */
export const PROFILES: Profile[] = (rawProfiles as unknown[]).map(
  (raw, index) => {
    const result = validateProfile(raw)
    if (!result.ok) {
      const errSummary = result.errors
        .map((e) => `${e.path}: ${e.message}`)
        .join('; ')
      throw new Error(`profiles.json entry ${index} is invalid: ${errSummary}`)
    }
    return result.value
  },
)

/**
 * Look up a profile by name (case-sensitive, exact match).
 *
 * Returns `undefined` when not found.
 */
export function findProfile(name: string): Profile | undefined {
  return PROFILES.find((p) => p.name === name)
}
