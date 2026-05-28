# Waterforge v1.0

First public release. Waterforge turns distilled (or known-source) water and
food-grade salts into faithful clones of bottled mineral waters — a static,
client-side web app at https://waterforge.app/.

## What it does

Pick a target profile, set your source water, toggle the salts you own, and
get a precise, batch-scaled recipe. The solver uses non-negative least-squares
with exact stoichiometry, so results are reproducible anywhere you can get
distilled water and food-grade salts.

It descends from Martin Lersch's freely published method on
[Khymos](http://khymos.org/), and keeps that work free: code is GPLv3, profile
data is CC-BY-SA-4.0 attributed to Lersch/Khymos.

## How it got here

- **M0 — Foundation** — repo bootstrap, license split, CONSTITUTION, ADRs,
  CI/CD to GitHub Pages, the NNLS solver engine, chemistry/architecture docs.
- **M1 — Data & schema** — locked the profile JSON schema and seeded ~44
  bottled, brewing, and coffee water targets, with sources verified.
- **M2 — Solver finishing** — recipe-selection policy for under-determined
  salt palettes (so the solver picks a stable recipe, not a noisy one).
- **M3 — UI** — app shell, theme, target picker, source-water input,
  salt-palette toggles, batch size + unit, results table, and the readouts
  panel (sulfate:chloride, TDS, charge residual, saturation warnings).
- **M4 — Persistence & sharing** — localStorage persistence, JSON
  import/export, shareable recipe links via URL hash.
- **M5 — Ship** — responsive + a11y QA pass, header icon polish, custom
  domain (waterforge.app), and this release.

## Known limitations

Per [CONSTITUTION.md](https://github.com/cacack/waterforge/blob/main/CONSTITUTION.md),
Waterforge is intentionally _not_:

- A mash-pH or residual-alkalinity tool — reach for Bru'n Water /
  EZ Water Calculator there.
- A general brewing-water tool — we model finished drinking water, not
  brewing salts for a beer style.
- A flavor or sensory predictor — we match ion profiles, not taste.
- A backend service — everything runs in your browser. No accounts, no cloud
  sync, no telemetry.

## Try it

https://waterforge.app/ — pick Evian or Gerolsteiner from the target dropdown
to see a complete recipe with deviation indicators and saturation warnings.

## License

- Code: [GPL-3.0-or-later](https://github.com/cacack/waterforge/blob/main/LICENSE)
- Profile data: [CC-BY-SA-4.0](https://github.com/cacack/waterforge/blob/main/LICENSE-DATA),
  attributed to Martin Lersch (Khymos).
