# Maintainability Review — 2026-09-26

**Verdict:** healthy

Waterforge carries unusually little accidental debt for a repo this size: zero TODO/FIXME/XXX/HACK markers anywhere in the tree, a deliberately-scoped test suite whose gaps are documented rather than accidental, an ADR/decision log that is actually kept current, and a ROADMAP that tracks deferred work with explicit re-evaluation triggers instead of letting a backlog rot. The one real finding is a small, bounded doc/code divergence in the architecture overview's module map. Long-term carrying cost here looks low and the debt that does exist is acknowledged in the project's own documents (see CONSTITUTION.md's maintenance-threshold framing), which is itself a maintainability asset.

## Findings

**[LOW] Architecture doc's module-boundary diagram doesn't match the actual component split**

- Evidence: `docs/architecture/overview.md` "Module Boundaries" section shows a tree with `src/lib/components/ — Svelte UI components (consume engine via $lib)`. In the actual tree, `src/lib/components/` contains only the 60 shadcn-svelte/Bits UI primitive files (`ui/alert`, `ui/dialog`, `ui/select`, etc.), while the app's own 13 feature components (`Actions.svelte`, `BatchSection.svelte`, `RecipePanel.svelte`, etc.) live in a top-level `src/components/` directory not mentioned anywhere in the diagram. `git log` shows both the doc and `src/components/` were introduced within a day of each other on 2026-05-27/28 and neither has been touched to reconcile the other since (~4 months, confirmed via `git log -3` on the doc).
- Why it matters: this is the one document meant to orient a new contributor (or future-you) to where UI code lives; a reader following the diagram literally would look in the wrong place. Small today, but every month it goes uncorrected is a month a newcomer's first mental model is wrong.
- Suggested action: update the tree in `docs/architecture/overview.md` to show both `src/components/` (feature UI) and `src/lib/components/ui/` (shadcn primitives) as distinct, named layers.

**[LOW] Stale placeholder file in `src/components/`**

- Evidence: `src/components/.gitkeep` (0 bytes, dated 2026-05-27) sits alongside 13 real `.svelte` files and an `icons/` subdirectory that have existed since the day after the placeholder was added. `.gitkeep` files exist only to keep empty directories in git; this directory has not been empty since its second commit.
- Why it matters: negligible on its own, but placeholder cruft like this is exactly the kind of thing that erodes signal — a contributor grepping the directory has one extra file to explain to themselves for no reason.
- Suggested action: delete `src/components/.gitkeep` in a routine cleanup pass.

## Notes

- **Test coverage shape is intentional, not accidental.** `src/lib/chem/`, `src/lib/solver/`, and `src/lib/profiles/` (the "engine") each have test files roughly matching their source files (chem: 3 tests / 4 source files; solver: 5/7; profiles: 2/6, with `library.test.ts` and `profiles.test.ts` covering the data-driven surface). The 13 top-level Svelte components and the 60 shadcn-svelte UI primitives under `src/lib/components/ui/` have zero test files, and `CONTRIBUTING.md`'s Testing section only discusses solver invariants (golden tests, round-trip exactness, charge-balance) — it doesn't claim UI coverage. `src/actions.test.ts` and `src/app-boot.test.ts` explicitly document _why_ they test only the pure-logic paths ("component-level UI … is not tested here because it requires a DOM environment"). This is a defensible, bounded split for a single-maintainer static app (CONSTITUTION.md's "built for its maintainer" posture) rather than drift — flagging it as a note rather than a finding, but it's worth revisiting if the UI component surface grows non-trivial conditional logic beyond what it has today.
- **TODO/FIXME hygiene is essentially perfect.** A repo-wide grep for `TODO|FIXME|XXX|HACK` across `src/`, `docs/`, and top-level markdown returned zero matches. Deferred work is instead tracked as GitHub issues with explicit re-evaluation triggers in `ROADMAP.md` (e.g., issues #27, #28, #13, each with a named trigger condition) rather than as inline comments — a healthier pattern than the norm.
- **No parallel old/new code paths found.** Grepping for `deprecated`/`legacy` across `src/` and `docs/` turns up exactly one substantive hit (`src/persist.svelte.ts:271`, a comment describing tolerant reading of an additive schema field), which is a normal, single-purpose backward-compatibility note, not a half-finished migration.
- **Comment density is high but not stale-code camouflage.** A broad grep for multi-word comment lines returned 664 matches; spot-checking a sample (`src/lib/solver/matrix.ts`, `src/lib/solver/oracle.ts`) shows these are explanatory unit/derivation comments consistent with the codebase's established documentation style, not commented-out code.

### Summary counts

critical=0 high=0 medium=0 low=2
