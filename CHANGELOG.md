# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

From the next release onward, this changelog is maintained automatically by
[release-please](https://github.com/googleapis/release-please) from
conventional-commit messages on `main`.

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
