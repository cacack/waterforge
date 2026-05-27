# ADR 0007 — Solver-correctness invariant: golden tests and round-trip exactness

**Status:** Accepted
**Date:** 2026-05-27

## Context

The solver produces gram-accurate salt recipes that users will follow in their
kitchen. An undetected regression — a wrong stoichiometry coefficient, a
unit-conversion error, a sign flip — would silently produce incorrect mineral
water. The solver must be continuously verified against a known-correct
reference.

Two verification strategies are available:

1. **Reference comparison** — compare NNLS output against the deterministic
   sequential oracle (`sequentialOracle` in `src/lib/solver/oracle.ts`), which
   implements the Lersch / Khymos greedy assignment method. For a
   fully-determined palette (each driver ion covered by exactly one salt in the
   priority order), both methods must agree to full floating-point precision.

2. **Round-trip exactness** — apply a known dose, compute the resulting profile,
   verify that the profile matches the forward model exactly. Also verify that
   the contribution matrix entries satisfy per-salt charge balance (cation
   equivalents = anion equivalents for each salt).

## Decision

Maintain both invariants as automated tests (Vitest, `environment: 'node'`):

- **Golden test:** run `solve()` and `sequentialOracle()` on a representative
  target profile with the full salt palette; assert that each salt dose agrees
  to ≥6 decimal places.
- **Round-trip exactness:** feed a known dose through `forward()`, then verify
  the result profile matches the expected ion concentrations exactly (within
  floating-point epsilon).
- **Charge-balance per salt:** for each salt in the palette, verify that the
  contribution matrix row satisfies charge balance (sum of
  stoichiometry × charge × (mg/molarMass) = 0).

## Consequences

- Any regression in stoichiometry constants, matrix construction, or the NNLS
  algorithm fails the golden test immediately.
- The tests run in a pure Node environment (no browser, no DOM), confirming
  the engine's framework independence (see architecture overview).
- The 6-decimal-place threshold is the project's published success criterion
  for solver reproducibility.
- The oracle remains in the production codebase (not test-only) so it can serve
  as an auditable reference and as a fallback for simpler integrations.
