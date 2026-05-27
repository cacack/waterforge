# Constitution

> The mission, principles, and non-goals of Waterforge. When in conflict with
> this document, future decisions should align here or explicitly update it.

## Mission

Waterforge turns distilled (or known-source) water and food-grade salts into
faithful clones of bottled mineral waters. It's a static, client-side web app
that takes a target water profile, subtracts what's already in your source
water, and computes the exact salt additions needed to hit it — so anyone can
reproduce a named mineral water at home, precisely and reproducibly. It descends
from Martin Lersch's (Khymos) freely published method and data, and keeps that
work free.

## Audience

**This is for:** homebrewers and water hobbyists who want to match a specific
drinking-water profile from a clean baseline using food-grade salts, and who
care about getting the numbers right.

**This is not for:** brewers looking for mash-pH or residual-alkalinity tooling —
Waterforge models the water itself, not what happens when grain hits it (reach
for Bru'n Water / EZ Water Calculator there).

## Principles

When in doubt, prefer:

1. **Free and copyleft over proprietary control** — code stays GPLv3, profile
   data CC-BY-SA-4.0 with attribution to Lersch/Khymos. What we build on the
   commons stays in the commons.
2. **Distilled-first over tap-water assumptions** — build up from a known-zero
   baseline; treat known-source water as the handled exception, not the default.
   Results should be reproducible anywhere.
3. **Precision over hand-waving** — exact stoichiometry and explicit units (mind
   the as-CaCO₃ / as-HCO₃ trap), not rules of thumb. Surface uncertainty
   (solubility / saturation warnings) rather than bury it.
4. **Faithful to the source method over novel chemistry** — track Lersch's
   published method; deviations are documented decisions, not silent
   reinventions.
5. **Static and client-side over backend convenience** — everything runs in the
   browser. No servers, accounts, or telemetry: cheaper to host, private by
   default, durable.

## Non-Goals

This project is explicitly **not** trying to:

- Predict mash pH or residual alkalinity — that's grain-and-water chemistry, out
  of scope.
- Be a general brewing-water tool — we model finished drinking water, not
  brewing-salts-for-style.
- Predict flavor or sensory outcomes — we match ion profiles, not taste.
- Run a backend — no accounts, no cloud sync, no server-side state.

## Success Criteria

We'll know this is working if:

- The solver reproduces a known published recipe to ≥6 decimal places
  (golden-test verified).
- A user can go from a named target to a gram-accurate, batch-scaled salt recipe
  — with sulfate:chloride, TDS, charge-residual, and saturation readouts/warnings
  — in one unbroken flow.
- A seed library of the planned bottled/brewing/coffee target profiles ships and
  is browsable.
- The app is live and usable at a public URL (GitHub Pages), no install required.

---

_Last refreshed: 2026-05-27_
