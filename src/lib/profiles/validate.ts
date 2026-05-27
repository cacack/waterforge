// Profile validation for Waterforge.
//
// Pure TypeScript, no runtime dependencies. Validation returns typed errors
// rather than throwing, so callers can surface problems to the UI. The
// charge-balance helper is deliberately separate so the solver pipeline (#10)
// can call it independently.

import { IONS, ION_ORDER } from '../chem/constants'
import type { IonId } from '../chem/constants'
import type { Profile, ProfileIons } from './types'

// ---------------------------------------------------------------------------
// Validation result types
// ---------------------------------------------------------------------------

/** A single validation failure with a path to the offending field. */
export interface ValidationError {
  /** Dot-separated path to the offending field (e.g. `'ions.Ca'`, `'provenance.source_date'`). */
  path: string
  /** Human-readable description of what went wrong. */
  message: string
}

/** A successful parse — `value` is the narrowed `Profile`. */
export interface ValidationOk {
  ok: true
  value: Profile
}

/** A failed parse — `errors` lists every problem found. */
export interface ValidationFail {
  ok: false
  errors: ValidationError[]
}

export type ValidationResult = ValidationOk | ValidationFail

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const ION_IDS = new Set<string>(ION_ORDER)

function addError(
  errors: ValidationError[],
  path: string,
  message: string,
): void {
  errors.push({ path, message })
}

// ---------------------------------------------------------------------------
// Public validator
// ---------------------------------------------------------------------------

/**
 * Validate an `unknown` value as a Waterforge Profile.
 *
 * Returns `{ ok: true, value }` on success (with the value narrowed to
 * `Profile`) or `{ ok: false, errors }` on failure. All errors are collected
 * before returning — a single call surfaces every problem, not just the first.
 *
 * Key invariant enforced: if `ions.HCO3` is present, `alkalinity_unit` MUST
 * also be present. This is the explicit guard against the ×1.22 silent
 * misconversion trap.
 */
export function validateProfile(raw: unknown): ValidationResult {
  const errors: ValidationError[] = []

  if (!isPlainObject(raw)) {
    return {
      ok: false,
      errors: [{ path: '', message: 'Profile must be a plain object' }],
    }
  }

  // --- name ---
  if (typeof raw['name'] !== 'string' || raw['name'].trim().length === 0) {
    addError(errors, 'name', 'must be a non-empty string')
  }

  // --- ions ---
  if (!isPlainObject(raw['ions'])) {
    addError(errors, 'ions', 'must be a plain object')
  } else {
    const ions = raw['ions'] as Record<string, unknown>

    for (const key of Object.keys(ions)) {
      if (!ION_IDS.has(key)) {
        addError(errors, `ions.${key}`, `unknown ion id '${key}'`)
        continue
      }
      const v = ions[key]
      if (typeof v !== 'number' || !isFinite(v)) {
        addError(errors, `ions.${key}`, 'must be a finite number')
      } else if (v < 0) {
        addError(
          errors,
          `ions.${key}`,
          'must be >= 0 (concentrations are non-negative)',
        )
      }
    }

    // Alkalinity unit convention: required when HCO3 is present.
    const hasHco3 =
      typeof ions['HCO3'] === 'number' && isFinite(ions['HCO3'] as number)
    const alkUnit = raw['alkalinity_unit']

    if (hasHco3) {
      if (alkUnit === undefined) {
        addError(
          errors,
          'alkalinity_unit',
          'required when ions.HCO3 is present — specify "as_HCO3" or "as_CaCO3" to prevent silent unit-conversion errors',
        )
      } else if (alkUnit !== 'as_HCO3' && alkUnit !== 'as_CaCO3') {
        addError(errors, 'alkalinity_unit', 'must be "as_HCO3" or "as_CaCO3"')
      }
    } else if (alkUnit !== undefined) {
      // alkalinity_unit present but HCO3 absent — warn but not fatal; it may
      // be present for documentation purposes. We do validate the value though.
      if (alkUnit !== 'as_HCO3' && alkUnit !== 'as_CaCO3') {
        addError(errors, 'alkalinity_unit', 'must be "as_HCO3" or "as_CaCO3"')
      }
    }
  }

  // --- optional numeric fields ---
  for (const field of ['co2', 'tds'] as const) {
    const v = raw[field]
    if (v !== undefined) {
      if (typeof v !== 'number' || !isFinite(v)) {
        addError(errors, field, 'must be a finite number when present')
      } else if (v < 0) {
        addError(errors, field, 'must be >= 0 when present')
      }
    }
  }

  const ph = raw['ph']
  if (ph !== undefined) {
    if (typeof ph !== 'number' || !isFinite(ph)) {
      addError(errors, 'ph', 'must be a finite number when present')
    } else if (ph < 0 || ph > 14) {
      addError(errors, 'ph', 'must be between 0 and 14 when present')
    }
  }

  // --- optional string fields ---
  for (const field of ['comment', 'url'] as const) {
    const v = raw[field]
    if (v !== undefined && typeof v !== 'string') {
      addError(errors, field, 'must be a string when present')
    }
  }

  // --- provenance ---
  if (!isPlainObject(raw['provenance'])) {
    addError(errors, 'provenance', 'must be a plain object')
  } else {
    const prov = raw['provenance'] as Record<string, unknown>

    if (typeof prov['verified'] !== 'boolean') {
      addError(errors, 'provenance.verified', 'must be a boolean')
    }

    if (
      typeof prov['source'] !== 'string' ||
      prov['source'].trim().length === 0
    ) {
      addError(errors, 'provenance.source', 'must be a non-empty string')
    }

    if (typeof prov['source_date'] !== 'string') {
      addError(errors, 'provenance.source_date', 'must be a string')
    } else if (!ISO_DATE_RE.test(prov['source_date'])) {
      addError(
        errors,
        'provenance.source_date',
        'must be an ISO 8601 date string (YYYY-MM-DD)',
      )
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, value: raw as unknown as Profile }
}

// ---------------------------------------------------------------------------
// Charge-balance helper
// ---------------------------------------------------------------------------

/**
 * Compute the charge-balance residual (meq/L) for a set of ion concentrations.
 *
 * The residual is defined as:
 *   Σ (concentration_i / molarMass_i × charge_i) for all ions
 *
 * For a perfectly balanced natural water this is approximately zero.  A large
 * absolute residual (|residual| > 0.5 meq/L is a common heuristic threshold)
 * suggests either a measurement error or that a significant unmeasured ion is
 * present. Issue #10 uses this helper to surface warnings in the UI.
 *
 * @param ions - Ion concentrations in mg/L (as-HCO₃ canonical form).
 * @returns Charge-balance residual in meq/L (positive = cation excess).
 */
export function chargeBalanceResidual(ions: ProfileIons): number {
  let residual = 0
  for (const id of ION_ORDER) {
    const conc = ions[id]
    if (conc == null || conc === 0) continue
    const ion = IONS[id as IonId]
    // meq/L = (mg/L) / (molar mass g/mol) × charge
    residual += (conc / ion.molarMass) * ion.charge
  }
  return residual
}
