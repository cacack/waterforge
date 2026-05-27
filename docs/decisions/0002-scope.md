# ADR 0002 — Scope: clone drinking mineral water; exclude mash-pH / residual alkalinity

**Status:** Accepted
**Date:** 2026-05-27

## Context

Water-chemistry tools for homebrewers span two distinct problems:

1. **Matching a finished water profile** — reproducing the ion composition of a
   named mineral water from a clean (distilled or known-source) baseline using
   food-grade salts.
2. **Predicting mash outcomes** — modelling how a water profile interacts with
   grain: mash pH, residual alkalinity, buffering, flavour contribution.

These require different chemistry, different inputs, and serve different
audiences. Tools like Bru'n Water and EZ Water Calculator address problem 2.
Waterforge addresses problem 1 only.

The method Waterforge tracks — Martin Lersch's / Khymos — is explicitly a
recipe for cloning a finished water profile, not a mash-chemistry tool.

## Decision

Waterforge's scope is:

- **In scope:** compute the gram additions of food-grade salts needed to turn
  distilled water (or any known-source water) into a faithful clone of a target
  ion profile (Ca, Mg, Na, K, HCO₃, SO₄, Cl in mg/L).
- **Out of scope:** mash pH prediction, residual alkalinity, water-to-grain
  interaction, flavour modelling, or any brewing-process chemistry.

The distilled-water-first baseline is intentional: it maximises reproducibility
anywhere in the world regardless of local tap-water chemistry.

## Consequences

- Users looking for mash-pH tools are redirected to established alternatives
  (Bru'n Water, EZ Water Calculator).
- The ion set is fixed at the seven ions the source method models; expanding it
  (e.g. adding fluoride or nitrate) is a deliberate extension that must be
  evaluated against the method's foundations.
- Keeping scope narrow reduces the risk of silent unit-convention errors (e.g.
  alkalinity as-CaCO₃ vs. as-HCO₃) creeping in through mash-chemistry paths.
