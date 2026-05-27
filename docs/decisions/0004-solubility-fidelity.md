# ADR 0004 — Solubility fidelity: box bound + saturation-index warnings

**Status:** Accepted
**Date:** 2026-05-27

## Context

Real water has solubility limits. The most practically relevant one for the
Waterforge salt palette is gypsum (CaSO₄·2H₂O), which saturates at roughly
2.0–2.5 g/L. If a solver dose exceeds this, the salt will not fully dissolve
and the actual ion concentrations will fall short of the target.

Beyond gypsum, calcite (CaCO₃) can precipitate at high calcium + bicarbonate
concentrations. A full treatment would model all mineral equilibria
simultaneously via a coupled Ksp system — but that adds significant complexity
and requires pH and temperature as inputs that the source method does not use.

The simplification available to us: at the concentrations and conditions typical
of drinking-water cloning, the gypsum ceiling is the dominant practical limit.
Calcite risk is real but less likely to be binding.

## Decision

Implement solubility fidelity in two complementary parts:

1. **Gypsum box bound** — after NNLS, clamp the gypsum dose to ≤ 2.0 g/L
   (the conservative lower end of gypsum's solubility range). This prevents
   emitting a physically unachievable recipe. It is a single hard bound, not an
   iterative re-solve (see ADR 0005).

2. **Saturation-index warnings** — after computing the result profile, compute
   saturation indices (SI = log₁₀(IAP / Ksp)) for gypsum (Ksp ≈ 10⁻⁴·⁵⁸) and
   calcite (Ksp ≈ 10⁻⁸·⁴⁸) and surface a warning when SI ≥ 0. Activity
   coefficients are approximated as 1 (conservative; real ionic strength lowers
   activities, so these warnings may fire at lower concentrations than a full
   Debye-Hückel treatment would predict).

Full coupled-Ksp equilibrium (including pH, CO₂ partial pressure, ionic
strength, and temperature dependence) is deferred.

## Consequences

- Recipes never instruct the user to dissolve more gypsum than is physically
  achievable under the 2.0 g/L approximation.
- Saturation warnings for gypsum and calcite are surfaced in the UI so the user
  can choose a different target or accept the approximation.
- The conservative activity-coefficient assumption (= 1) means warnings may fire
  for profiles that a full model would deem safe; this is acceptable — better to
  warn unnecessarily than to under-warn.
- A full Ksp equilibrium solver is identified as a future extension, not
  currently in scope.
