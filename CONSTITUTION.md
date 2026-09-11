# Constitution

> The mission, posture, principles, and non-goals of Waterforge. When in conflict
> with this document, future decisions should align here or explicitly update it
> — see [How intent is recorded](#how-intent-is-recorded).

## Mission

Waterforge turns distilled (or known-source) water and food-grade salts into
faithful clones of bottled mineral waters. It's a static, client-side web app
that takes a target water profile, subtracts what's already in your source
water, and computes the exact salt additions needed to hit it — and, for a
sparkling target, the regulator pressure to carbonate it to match — so anyone can
reproduce a named mineral water at home, precisely and reproducibly. Its recipe
method descends from Martin Lersch's (Khymos) freely published work; the profile
data is now an independently-sourced compilation, and the whole stays free.

## Audience

**Built for:** its maintainer, first. Waterforge exists because he wanted it and
he uses it. That is the whole reason it is maintained, and it is enough.

**Aimed at:** homebrewers and water hobbyists who want to match a specific
drinking-water profile from a clean baseline using food-grade salts, and who care
about getting the numbers right. This describes the aim, not a measured
population — anyone who finds the app useful is welcome to it.

**This is not for:** brewers looking for mash-pH or residual-alkalinity tooling —
Waterforge models the water itself, not what happens when grain hits it (reach
for Bru'n Water / EZ Water Calculator there).

## Posture

What kind of project this is, in four layers. Which layer is load-bearing
matters more than the labels:

1. **Why it exists and is maintained** — it was built for its maintainer, who
   actively uses it. This is the load-bearing justification, and it needs no
   audience to hold. Maintenance is not a service owed to anyone.
2. **The standard of care** — it is nonetheless finished to the standard its
   maintainer would have wanted had he stumbled on it: sourced, licensed,
   documented, precise. That standard is freely chosen, not a debt owed.
3. **The backstop** — should that use end, the sourced profile compilation and a
   correct solver are still worth preserving on their own: copyleft, forkable,
   archived. Insurance on an artifact, not service to a population.
4. **Aspiration, not commitment** — if users arrive, good. Serving a user base
   would be a new decision, recorded here when it is made; it is not assumed
   today, and no work is owed to a hypothetical audience.

See [ADR 0016](docs/decisions/0016-built-for-its-maintainer.md) for the
alternatives weighed and why they were rejected.

## Principles

When in doubt, prefer:

1. **Free and copyleft over proprietary control** — code stays GPLv3, profile
   data CC-BY-SA-4.0 (per-profile sources; recipe method credited to
   Lersch/Khymos). What we build on the commons stays in the commons.
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
   default, durable — and installable, so it keeps working offline at the
   counter.
6. **Real use over assumed demand** — effort is justified by the maintainer's own
   use of the app, by correctness under Principle 3, or by the durability of the
   artifact. Never by an assumed audience. "Users might want this" is not a
   reason; "this would mislead or annoy me at the counter" is.

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
- A browsable library of sourced target profiles ships — bottled, brewing,
  coffee, and synthetic references. It grows opportunistically, with every new
  profile held to the same authoritative-sourcing standard (see ADR 0011).
- The app is live and usable at [waterforge.app](https://waterforge.app), no
  install required — and installable for offline use.
- Once feature-complete, it stays that way: the site is up, dependencies stay
  current, and security advisories are cleared promptly — a released version is
  always installable and correct.

## How intent is recorded

Project intent lives in a hierarchy. When two documents disagree, the one higher
in this list wins, and the lower one is brought into line:

1. **This constitution** — mission, values, posture, guiding principles. The
   ethos. Changes here are deliberate and rare.
2. **Decisions ([ADRs](docs/decisions/))** — the decisions made along the way
   that carry the constitution out, each with its context, alternatives, and
   consequences. An ADR is superseded by a later ADR, never silently overridden
   (see [CONTRIBUTING.md](CONTRIBUTING.md)).
3. **[Architecture](docs/architecture/) and code** — the implementation of those
   decisions.
4. **Issues and [roadmap](ROADMAP.md)** — planning. They record what is being
   worked on and when, not what the project is for. Neither may quietly redefine
   anything above it.

---

_Last refreshed: 2026-09-11_
