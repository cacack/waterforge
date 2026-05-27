# ADR 0009 — Recipe-selection policy for underdetermined salt palettes

**Status:** Accepted
**Date:** 2026-05-27

## Context

When several salts can source the same ion — gypsum and Epsom both supply SO₄,
table salt and calcium/magnesium chloride both supply Cl, baking soda and chalk
both supply HCO₃ — the linear system **A**·**x** = **b** is underdetermined: many
non-negative salt recipes hit the same target. NNLS (ADR 0003) returns the
optimum it happens to land on, which is effectively the minimum-L2-norm
solution. That has two problems for a tool whose job is to hand a person a
recipe:

1. **It splits doses across redundant salts.** Rather than "gypsum + Epsom for
   the sulfate," min-norm NNLS will sprinkle a little calcium chloride,
   magnesium chloride, baking soda and chalk in too, because spreading the dose
   lowers the L2 norm. The recipe is mathematically fine but not what anyone
   would actually weigh out.
2. **It is not deterministic across palette orderings.** The active-set search
   depends on column order, so the _same_ target with the _same_ salts in a
   different order can yield a materially different recipe (verified: San
   Pellegrino over the full palette gives one recipe in `SALT_ORDER` and a
   different one under a reordering).

Note this degeneracy bites hardest on _infeasible_ targets (most real bottled
waters cannot be reproduced exactly from this palette): there the residual-
minimising fit genuinely has many equal-quality supports to choose between. On
_achievable_ targets the exact solution is usually unique, so plain NNLS already
behaves — but we still want a single, stable, intuitive answer everywhere.

Three candidate policies were considered (per the issue):

- **Per-ion residual weighting.** Re-weight the rows of **A**·**x** = **b** so the
  fit prioritises some ions. This changes _what counts as the best fit_ rather
  than _which of the equally-good recipes we surface_, so it does not actually
  resolve the salt-choice degeneracy; it also introduces hand-tuned weights
  (against "precision over hand-waving") and risks perturbing the exact-target
  invariant. Rejected.
- **Minimal-salt regularizer.** Add an L1/L2 penalty on the doses to prefer
  fewer/lighter salts. True sparsity (L0) is combinatorial, and an L1/L2 term
  _perturbs the exact solution_ — it would trade away the ≥6-decimal target hit
  (ADR 0007) for tidiness, which we are not willing to do. Rejected as a primary
  mechanism, though the spirit (prefer sparse recipes) is kept below.
- **Deterministic priority tiebreak.** Among the recipes that achieve the
  optimal fit, pick the one preferred by the existing `SALT_ORDER` priority. This
  preserves exactness _exactly_ (it only ever chooses between equally-good
  solutions) and is fully deterministic. Chosen.

## Decision

Layer a **deterministic, priority-ordered greedy support selection** on top of
NNLS — a lexicographic objective: **best fit first, then priority/sparsity.**
Implemented in `selectRecipe()` in `src/lib/solver/solve.ts`:

1. **Best fit first.** Run NNLS over the whole palette to get the optimal
   residual **r\***. No recipe worse than **r\*** is ever accepted, so when the
   target is achievable (**r\*** ≈ 0) the surfaced recipe is still exact and the
   golden invariant (ADR 0007) is untouched.
2. **Priority / sparsity second.** Canonicalise the palette to `SALT_ORDER`
   (making the result independent of the caller's ordering), then walk it in
   priority order, adding salts only until **r\*** is reached. Finally prune any
   salt — lowest priority first — whose removal does not raise the residual above
   **r\***. The result is the highest-priority _minimal_ set of salts that still
   attains the optimal fit.

The acceptance slack is **exactness-safe**: it scales with the target magnitude
(`1e-9 · (1 + ‖b‖)`) but stays far below any meaningful dose, so it only ever
collapses genuine ties (degenerate, equal-residual supports) and never drops a
salt the fit actually needs. This reuses the existing pure-TypeScript NNLS — no
new runtime dependency, consistent with ADR 0003.

The sequential oracle (`oracle.ts`) was considered as a direct recipe source but
rejected: its greedy single-ion assignment is _not_ residual-optimal on the full
palette (it over-doses bicarbonate sources and leaves large residuals on real
profiles), so using it to surface recipes would regress fit quality. It remains
the golden-test reference only.

## Consequences

- For underdetermined targets the surfaced recipe is **deterministic** (byte-
  identical across permuted palettes and repeated runs) and **sparse/intuitive**
  (the smallest high-priority salt set that still fits best) — e.g. a sulfate-
  rich water is built from gypsum + Epsom rather than from a smear of chloride
  salts.
- Uniquely-determined targets are **unchanged**: the policy only ever selects
  among equal-residual solutions, so the determined-palette golden test and the
  round-trip / charge-balance invariants (ADR 0007) still hold to ≥6 decimals.
- The fit quality is **never worse** than plain NNLS: the chosen recipe matches
  the unconstrained NNLS optimal residual to floating-point precision.
- Cost is a handful of extra small NNLS solves (at most ~2 per salt, on systems
  of ≤8 salts × 7 ions) — negligible, in keeping with ADR 0003's O(n³)/n ≤ 8
  budget.
- The single-clamp gypsum pass (ADR 0005) is applied after selection, unchanged.
- If a future palette grows large enough that the greedy forward-selection's
  cost matters, or if users want an explicit "show me alternative recipes" mode,
  this is the natural extension point.
