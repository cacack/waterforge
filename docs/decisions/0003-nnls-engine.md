# ADR 0003 — NNLS-over-a-matrix engine: Lawson–Hanson in pure TypeScript

**Status:** Accepted
**Date:** 2026-05-27

## Context

The core computational problem is: given a target ion profile and a source water
profile, find the gram amounts of a palette of salts to add so the resulting
water matches the target as closely as possible.

Formally: given a matrix **A** (mg ion per g salt per L) and a right-hand-side
vector **b** (per-ion deficit in mg/L), find a salt-dose vector **x** (g/L)
such that **A**·**x** ≈ **b**. Salt doses cannot be negative (you cannot remove
a salt that was never added), so the constraint is **x** ≥ 0.

Several approaches are possible:

- **Unconstrained least squares** — ignores the non-negativity requirement;
  produces negative doses for under-determined or conflicting targets.
- **Greedy sequential assignment** — the oracle in the source method (Lersch /
  Khymos): dose each salt in priority order to close its driver ion's deficit.
  Deterministic and auditable but not globally optimal; used as a golden
  reference (see ADR 0007).
- **Non-negative least squares (NNLS)** — minimises ‖**A**·**x** − **b**‖
  subject to **x** ≥ 0. Globally optimal among non-negative solutions;
  handles over- and under-determined systems gracefully.
- **General quadratic programming (QP) library** — more general but heavier
  dependency.

## Decision

Use **NNLS** as the production solver, implemented via the **Lawson–Hanson
active-set algorithm** in **pure TypeScript** (no numeric library dependency).

The implementation (`src/lib/solver/nnls.ts`) is self-contained: it builds
normal equations on the active subset, solves them via Gaussian elimination with
partial pivoting, and iterates until the KKT conditions hold. The systems are
small (at most 8 salts × 7 ions), so normal equations are numerically adequate.

## Consequences

- No runtime dependency on a numeric library (NumPy, math.js, etc.); the engine
  stays portable and the bundle stays small.
- The Lawson–Hanson algorithm converges in O(n³) in the worst case, which is
  negligible for n ≤ 8.
- The NNLS solution is verified against the deterministic sequential oracle at
  ≥6 decimal places in golden tests (see ADR 0007).
- If the palette grows large enough to cause convergence issues, switching to a
  proper QP solver becomes the natural next step (noted as a revisit trigger in
  the architecture overview).
