// The ion x salt contribution matrix and the forward model.
//
// MATRIX UNITS: entry A[ion][salt] is the milligrams of that ion contributed
// per gram of that salt dissolved in one litre of water (mg ion per g salt per
// L). Derivation: one gram of a salt is (1000 / molarMass) mmol; each mmol of
// salt releases `stoichiometry` mmol of ion; each mmol of ion weighs
// `ion.molarMass` mg. So A[ion][salt] = 1000 * stoich(salt, ion) * ionMolarMass
// / saltMolarMass.
//
// With salt doses x in g/L and the matrix A, the forward model A @ x gives the
// ion concentrations in mg/L the doses produce. This is exact and, for a
// determined palette, invertible. See the solver notes under `docs/`.

import { IONS, ION_ORDER, SALTS, type IonId, type SaltId } from '../chem'
import type { IonProfile, SaltDose } from './types'

/**
 * Contribution coefficient: mg of `ionId` produced per gram of `saltId` per
 * litre. Returns 0 when the salt does not contribute the ion.
 */
export function contribution(saltId: SaltId, ionId: IonId): number {
  const salt = SALTS[saltId]
  const moles = salt.stoichiometry[ionId] ?? 0
  if (moles === 0) return 0
  // 1000 converts g salt -> mg-scale: mg ion per g salt per litre.
  return (1000 * moles * IONS[ionId].molarMass) / salt.molarMass
}

/**
 * Build the dense ion x salt matrix for the given salt palette, using the
 * canonical ion ordering. Rows are ions (in `ION_ORDER`), columns are salts (in
 * the supplied `salts` order). Units: mg ion per g salt per L.
 */
export function buildMatrix(salts: readonly SaltId[]): number[][] {
  return ION_ORDER.map((ionId) =>
    salts.map((saltId) => contribution(saltId, ionId)),
  )
}

/**
 * Forward model: given salt doses (g/L), compute the ion profile (mg/L) they
 * add to pure water. Only ions actually produced appear in the result.
 */
export function forward(dose: SaltDose): IonProfile {
  const profile: IonProfile = {}
  for (const ionId of ION_ORDER) {
    let mg = 0
    for (const saltId of Object.keys(dose) as SaltId[]) {
      const grams = dose[saltId] ?? 0
      if (grams === 0) continue
      mg += contribution(saltId, ionId) * grams
    }
    if (mg !== 0) profile[ionId] = mg
  }
  return profile
}
