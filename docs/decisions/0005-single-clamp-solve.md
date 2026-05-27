# ADR 0005 — Single-clamp solve: one gypsum ceiling pass, not iterative re-solve

**Status:** Accepted
**Date:** 2026-05-27

## Context

The gypsum solubility ceiling (ADR 0004) introduces a complication: if the NNLS
solution exceeds the gypsum ceiling, clamping it changes the achieved ion
profile. A calcium deficit that gypsum was partially covering may now go
unmet — and the solver could theoretically be re-run with the clamped value
fixed, producing a different (perhaps worse) solution.

Two strategies:

1. **Iterative re-solve** — clamp gypsum, fix it, re-run NNLS on the remaining
   deficit, repeat until stable. Correct in principle but adds complexity,
   iteration logic, and potential non-termination edge cases.

2. **Single-clamp pass** — apply the ceiling clamp once after NNLS, recompute
   the forward profile from the clamped doses, report the result. Simple,
   deterministic, and transparent.

## Decision

Use a **single-clamp pass**: after NNLS returns doses, clamp gypsum to
`GYPSUM_CEILING_G_PER_L = 2.0` if it exceeds that value, then compute the
result profile from the clamped doses. No re-solve.

The residual ion mismatch (if any) is visible to the user via the result profile
and the saturation warning. The user can then adjust their target.

## Consequences

- `solve()` is a single linear pass: deterministic, fast, and easy to reason
  about.
- If gypsum is clamped, the result profile may have lower Ca and/or SO₄ than
  the target; the UI should surface this via the result profile comparison.
- The saturation-index warning for gypsum (ADR 0004) will fire when the clamp
  is active, alerting the user.
- An iterative re-solve remains a possible future extension if profiles routinely
  hit the ceiling and the residual mismatch is unacceptable.
