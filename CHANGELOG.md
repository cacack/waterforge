# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

From the next release onward, this changelog is maintained automatically by
[release-please](https://github.com/googleapis/release-please) from
conventional-commit messages on `main`.

## [1.7.0](https://github.com/cacack/waterforge/compare/v1.6.0...v1.7.0) (2026-05-31)


### Features

* **carbonation:** add force-carbonation calculator ([de09f75](https://github.com/cacack/waterforge/commit/de09f75da592566361ac4c9d578121e06fa5c142))
* **profiles:** add Magnetic Springs (OH) and Waiākea (HI) ([a9638b2](https://github.com/cacack/waterforge/commit/a9638b294dfbd5bc382b4f6d38a9d51a527bf5cf)), closes [#98](https://github.com/cacack/waterforge/issues/98)


### Bug Fixes

* **carbonation:** address panel-review findings on the calculator ([71348b9](https://github.com/cacack/waterforge/commit/71348b9e60ca011aecc65993bd6852977feb24dc))

## [1.6.0](https://github.com/cacack/waterforge/compare/v1.5.0...v1.6.0) (2026-05-31)


### Features

* **ui:** guide users to request a missing target water ([0740266](https://github.com/cacack/waterforge/commit/07402663aeba33ca61fae91bfe484818a6104716)), closes [#113](https://github.com/cacack/waterforge/issues/113)

## [1.5.0](https://github.com/cacack/waterforge/compare/v1.4.0...v1.5.0) (2026-05-31)


### Features

* **pwa:** add installable offline support ([#26](https://github.com/cacack/waterforge/issues/26)) ([c0d5ed6](https://github.com/cacack/waterforge/commit/c0d5ed6fe4d63707ba3ce47ca2bb1527596b156a))

## [1.4.0](https://github.com/cacack/waterforge/compare/v1.3.0...v1.4.0) (2026-05-30)


### Features

* **profiles:** add 11 bottled-water profiles beyond the Khymos seed ([db9da57](https://github.com/cacack/waterforge/commit/db9da57e8c71b6f35853b9cad049b04c20f34c05)):
  Calistoga Spring Water, Perla Harghitei, Perla Harghitei Plată,
  Tiva Harghita, Buxton, Highland Spring, Fiji, Hépar, Ferrarelle,
  Vichy Catalan, and Vichy Célestins.
* **salts:** add anhydrous calcium chloride and clarify salt names ([34da403](https://github.com/cacack/waterforge/commit/34da403a840676be7a9ea486183cedfc8ebc3ee9)).
  Anhydrous calcium chloride (CaCl₂) is now selectable alongside the
  dihydrate, and salts are renamed to match common packaging
  ("Calcium Carbonate (Chalk)", "Calcium Chloride (Dihydrate)").

## [1.3.0](https://github.com/cacack/waterforge/compare/v1.2.0...v1.3.0) (2026-05-29)


### Features

* **ui:** apply Waterforge brand system ([2c511a4](https://github.com/cacack/waterforge/commit/2c511a47da2085b714f2bd1b95d9b2501038d2cf))

## [1.2.0](https://github.com/cacack/waterforge/compare/v1.1.1...v1.2.0) (2026-05-29)


### Features

* **profiles:** validate 8 brewing/coffee/tea/synthetic reference profiles ([#68](https://github.com/cacack/waterforge/issues/68)) ([abb4ea2](https://github.com/cacack/waterforge/commit/abb4ea258827af89e06d323bb224b90cf7a17e1e))
* **ui:** add site footer with version and license attribution ([c447f1c](https://github.com/cacack/waterforge/commit/c447f1c79be31da623f2f229f9e68d80621ee2bb)), closes [#83](https://github.com/cacack/waterforge/issues/83)


### Bug Fixes

* **profiles:** cite SCA water standard via Wayback Machine archive ([c3859cd](https://github.com/cacack/waterforge/commit/c3859cd59f765ec9d753d0a159b9d375b598bf36))


### Data

_Recorded retroactively: these profile-data changes shipped in 1.2.0 but were
committed with a non-release-driving `data:` type, so release-please omitted
them from this section at the time. Recovered as part of issue #114._

* **profiles:** re-source the commercial bottled-water library against current
  authoritative sources, replacing the stale Khymos-2015 provenance — French,
  German, Italian, Romanian/Balkan, Swiss/Nordic, North American, and remaining
  batches. Corrects ion values where authoritative sources differ and flips many
  profiles to `verified: true` ([#67](https://github.com/cacack/waterforge/issues/67)).
* **profiles:** remove the Harghita profile — no current real-world brand matches
  it ([#94](https://github.com/cacack/waterforge/issues/94)).
* **profiles:** remove the Kessel profile — unrecoverable provenance ([#85](https://github.com/cacack/waterforge/issues/85)).

## [1.1.1](https://github.com/cacack/waterforge/compare/v1.1.0...v1.1.1) (2026-05-28)


### Bug Fixes

* **ui:** replace source-water Switch with a segmented control ([8132a1a](https://github.com/cacack/waterforge/commit/8132a1adc43eabbf5735f3b4bea36b3532456d52))

## [1.1.0](https://github.com/cacack/waterforge/compare/v1.0.1...v1.1.0) (2026-05-28)

### Features

- **ui:** downloaded recipe JSON now includes target profile and doses ([#64](https://github.com/cacack/waterforge/issues/64)) ([084d97e](https://github.com/cacack/waterforge/commit/084d97effc51df060eee178b178551e35311bd38))

### Bug Fixes

- **ci:** pin release-please tag format to vX.Y.Z ([094b7c6](https://github.com/cacack/waterforge/commit/094b7c62037f172bb6de40f5970859c4312e9c36))
- **ui:** re-apply share URL on same-tab paste ([#63](https://github.com/cacack/waterforge/issues/63)) ([52f7e9c](https://github.com/cacack/waterforge/commit/52f7e9c2cfe769910946a298f6feee240a264614))
- **ui:** replace internal AppSnapshot wording in Import dialog ([#65](https://github.com/cacack/waterforge/issues/65)) ([a57760c](https://github.com/cacack/waterforge/commit/a57760c2b04f197f6fbc00f4d0954610daef6496))

## [1.0.1] - 2026-05-28

### Fixed

- Salt-inventory and source-water Switch toggles now render visible tracks
  and thumb animations in both light and dark themes (previously appeared
  as floating dots or were invisible).
- Volume-unit Select, Target-water Popover, and Import-recipe Dialog now
  render their open/close styling correctly. Underlying state was
  unaffected.

### Changed

- Lint now runs `scripts/check-shadcn-data-attrs.mjs` to fail fast if the
  bits-ui `data-[state=*]:` pattern regresses in shadcn-style wrappers.
- Replaced in-tree release-asset binaries with a single `docs/hero.png` for
  the README; per-release screenshots are now attached to the GitHub
  release instead of tracked in the repo.

## [1.0] - 2026-05-28

### Added

- First public release of Waterforge — a static, client-side web app for
  cloning bottled mineral waters from distilled water and food-grade salts
  at <https://waterforge.app/>.
- Profile-driven recipe solver using non-negative least-squares with exact
  stoichiometry; ~44 seeded bottled, brewing, and coffee water targets.
- App shell with target picker, source-water input, salt-palette toggles,
  batch size and unit selector, results table, and a readouts panel
  (sulfate:chloride ratio, TDS, charge residual, saturation warnings).
- localStorage persistence, JSON import/export, and shareable recipe links
  via URL hash.
- Code licensed GPL-3.0-or-later; profile data licensed CC-BY-SA-4.0 with
  attribution to Martin Lersch (Khymos).
