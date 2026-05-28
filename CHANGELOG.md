# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

From version 1.0.2 onward, this changelog is maintained automatically by
[release-please](https://github.com/googleapis/release-please) from
conventional-commit messages on `main`.

## [1.1.0](https://github.com/cacack/waterforge/compare/waterforge-v1.0.1...waterforge-v1.1.0) (2026-05-28)


### Features

* **engine:** land chem + solver engine with tests ([9027fcc](https://github.com/cacack/waterforge/commit/9027fcc8aaa69c490b9851fff4c636d4483641ac))
* **engine:** land chem + solver engine with tests ([9b3b1d3](https://github.com/cacack/waterforge/commit/9b3b1d3b06a34a951cfdf6810dbc2392459467c2))
* **persist:** add versioned snapshot API and localStorage persistence ([18cf844](https://github.com/cacack/waterforge/commit/18cf84452db47c86550f22010b191269a8a46608))
* **persist:** versioned snapshot API + localStorage persistence ([#21](https://github.com/cacack/waterforge/issues/21)) ([ccc03f5](https://github.com/cacack/waterforge/commit/ccc03f564951ab80dac0d17c4de7053268fd42a1))
* **profiles:** lock profile JSON schema + types ([cb13c72](https://github.com/cacack/waterforge/commit/cb13c7238d880a00096604277faa83d1c059fdb0))
* **profiles:** lock profile JSON schema + types ([f307693](https://github.com/cacack/waterforge/commit/f30769341cba96fed2f7064a84911e0697f01dd1)), closes [#9](https://github.com/cacack/waterforge/issues/9)
* **profiles:** seed profile library from Khymos source data ([46d0b32](https://github.com/cacack/waterforge/commit/46d0b32b92383fc055a2c8d1b85fe32530fccd78))
* **profiles:** seed profile library from Khymos source data (45 profiles) ([5b56ae7](https://github.com/cacack/waterforge/commit/5b56ae7c32bc4d524e2e8ef69d72c2ae8631d6ef))
* shareable recipe links via URL hash ([#23](https://github.com/cacack/waterforge/issues/23)) ([640319b](https://github.com/cacack/waterforge/commit/640319ba1e713b6eb8fcd81058f60bfe08ff6db7))
* shareable recipe links via URL hash ([#23](https://github.com/cacack/waterforge/issues/23)) ([17d6306](https://github.com/cacack/waterforge/commit/17d63061a7be784146a265f4b635c959b7a40cc1))
* **solver:** deterministic priority-minimal recipe selection ([72cde2f](https://github.com/cacack/waterforge/commit/72cde2f65130ecf379ae38bb5dd82a5b95437c75))
* **solver:** deterministic priority-minimal recipe selection ([b5443c3](https://github.com/cacack/waterforge/commit/b5443c3a66ec846a176822c09b86f0a11fd55a09)), closes [#12](https://github.com/cacack/waterforge/issues/12)
* **ui:** add JSON import/export actions toolbar ([#22](https://github.com/cacack/waterforge/issues/22)) ([34c2535](https://github.com/cacack/waterforge/commit/34c2535421a637002e0f360e61d491217550d347))
* **ui:** app shell with responsive two-pane layout and theme ([6eb9403](https://github.com/cacack/waterforge/commit/6eb9403f6d4f191e4430dac149971c52d5fe57b1))
* **ui:** app shell with responsive two-pane layout and theme ([f7330e2](https://github.com/cacack/waterforge/commit/f7330e29c58e7fc6c47b0e507bed0b7792e03419)), closes [#14](https://github.com/cacack/waterforge/issues/14)
* **ui:** batch size + volume unit selector ([#18](https://github.com/cacack/waterforge/issues/18)) ([6b17651](https://github.com/cacack/waterforge/commit/6b176519f0b28b5901a000b460622ba2201e071f))
* **ui:** batch size + volume unit selector ([#18](https://github.com/cacack/waterforge/issues/18)) ([9c3c67b](https://github.com/cacack/waterforge/commit/9c3c67b79809f84dd58935a28a507e486b105138))
* **ui:** downloaded recipe JSON now includes target profile and doses ([#64](https://github.com/cacack/waterforge/issues/64)) ([e4907a1](https://github.com/cacack/waterforge/commit/e4907a1bb3d990ce44520e8ddab7ba3ee7fc241e))
* **ui:** downloaded recipe JSON now includes target profile and doses ([#64](https://github.com/cacack/waterforge/issues/64)) ([084d97e](https://github.com/cacack/waterforge/commit/084d97effc51df060eee178b178551e35311bd38))
* **ui:** JSON import/export actions toolbar ([29e596e](https://github.com/cacack/waterforge/commit/29e596ed34d60f82d78d4e736b1a84b476aa6030))
* **ui:** readouts, saturation warnings, and procedural guidance ([66b5f1c](https://github.com/cacack/waterforge/commit/66b5f1c8de5e00cd38f9620aa8857399f312f2fc))
* **ui:** readouts, saturation warnings, and procedural guidance ([#20](https://github.com/cacack/waterforge/issues/20)) ([5a75455](https://github.com/cacack/waterforge/commit/5a7545529b528a52b3c6f0d42f8dfb592c4fdcf6))
* **ui:** results table — grams per salt, achieved-vs-target ions ([fb2072e](https://github.com/cacack/waterforge/commit/fb2072e1204a7728cee564c8a2f3d3697e1a397b))
* **ui:** results table — grams per salt, achieved-vs-target ions ([#19](https://github.com/cacack/waterforge/issues/19)) ([5f44a0c](https://github.com/cacack/waterforge/commit/5f44a0c07cdc9332b121aa8b4e08c737f0714406))
* **ui:** salt-palette toggles — switch each salt on/off ([#17](https://github.com/cacack/waterforge/issues/17)) ([ee0830a](https://github.com/cacack/waterforge/commit/ee0830a49a250af88f9bc07687127f365f6cf2c5))
* **ui:** salt-palette toggles — use what you own ([#17](https://github.com/cacack/waterforge/issues/17)) ([80abe3b](https://github.com/cacack/waterforge/commit/80abe3b13c9d584876493a2557236acc651168ea))
* **ui:** searchable combobox target picker ([#15](https://github.com/cacack/waterforge/issues/15)) ([6aa96c2](https://github.com/cacack/waterforge/commit/6aa96c2d4bf94499f5472a74dead7b73dbed9be8))
* **ui:** searchable combobox target picker ([#15](https://github.com/cacack/waterforge/issues/15)) ([2723d45](https://github.com/cacack/waterforge/commit/2723d45b186b03964c090c9fc44249b66bbc7a8d))
* **ui:** source-water input — distilled default + known-source ([2f69ced](https://github.com/cacack/waterforge/commit/2f69ced6892ea65fa599ef6da7ad8cf2d3e1402a))
* **ui:** source-water input — distilled default + known-source ([#16](https://github.com/cacack/waterforge/issues/16)) ([16fe2d9](https://github.com/cacack/waterforge/commit/16fe2d9487f65a0ffb0ed0f87f76789cd939e3c2))


### Bug Fixes

* **data:** cite authoritative source for Perrier + note variance ([3646eab](https://github.com/cacack/waterforge/commit/3646eab3d96fa96f2155c57734bf61023bbca1f3))
* **data:** re-source five flagged seed profiles ([#11](https://github.com/cacack/waterforge/issues/11)) ([0436b4e](https://github.com/cacack/waterforge/commit/0436b4ebfc3d2963d55b33b8b1932def6c823ed2))
* **data:** re-source five flagged seed profiles ([#11](https://github.com/cacack/waterforge/issues/11)) ([99b673b](https://github.com/cacack/waterforge/commit/99b673b6cf6de449bc649224248e88dd1b72f94f))
* **engine:** model chalk as Ca + 2 HCO3 for charge balance ([f8f9424](https://github.com/cacack/waterforge/commit/f8f9424b49f5308b20d5880fe1bb9b7e0075eebb))
* **ui:** re-apply share URL on same-tab paste ([#63](https://github.com/cacack/waterforge/issues/63)) ([f5833b0](https://github.com/cacack/waterforge/commit/f5833b02bbcefbae591df9a311e515fdbea5094e))
* **ui:** re-apply share URL on same-tab paste ([#63](https://github.com/cacack/waterforge/issues/63)) ([52f7e9c](https://github.com/cacack/waterforge/commit/52f7e9c2cfe769910946a298f6feee240a264614))
* **ui:** reflect external state changes in batch & source inputs ([8fe96a0](https://github.com/cacack/waterforge/commit/8fe96a02880e4abadc3dd39873e83d4c9e3e5b57))
* **ui:** reflect external state changes in batch & source inputs ([f533569](https://github.com/cacack/waterforge/commit/f5335696cbe42267c3e151133e750d1ac6efe80d))
* **ui:** render shadcn primitives with correct bits-ui data-state variants ([a215f9e](https://github.com/cacack/waterforge/commit/a215f9ec3f54abc7b500675baaa9aa57e7e266aa))
* **ui:** render shadcn primitives with correct bits-ui data-state variants ([bcd701f](https://github.com/cacack/waterforge/commit/bcd701fca5a6a1f3f3467589ec2bd5767a0f36ca))
* **ui:** replace internal AppSnapshot wording in Import dialog ([#65](https://github.com/cacack/waterforge/issues/65)) ([b3fc0e2](https://github.com/cacack/waterforge/commit/b3fc0e27ac27afee5c78fedb5c32104bb9db31dd))
* **ui:** replace internal AppSnapshot wording in Import dialog ([#65](https://github.com/cacack/waterforge/issues/65)) ([a57760c](https://github.com/cacack/waterforge/commit/a57760c2b04f197f6fbc00f4d0954610daef6496))

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
