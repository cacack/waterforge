# Architect Review — 2026-09-26

**Verdict:** healthy

Waterforge is a small, single-purpose static SPA whose architecture matches its stated scope well: a framework-agnostic `chem`/`solver` engine, a thin Svelte UI, and no backend. The project documents its own architecture unusually well for its size — `docs/architecture/overview.md` includes a data-flow diagram and an explicit "Revisit Triggers" table naming the conditions under which each structural choice should be reconsidered, and 20 ADRs record the decisions behind it. The one dual-implementation-looking pattern in the solver (`nnls.ts` production solver vs. `oracle.ts` sequential reference) is deliberate and documented as a correctness cross-check, not competing production paths — a good example of a seam that looks risky from a directory listing but is coherent on inspection. The findings below are minor: a stale architecture-doc diagram, an unenforced (documented-as-enforced) module boundary, and small scaffolding cruft. Nothing here blocks the project's near-term ambition.

## Findings

**[MEDIUM] Architecture doc's component-location diagram no longer matches the tree**

- Evidence: `docs/architecture/overview.md`'s "Module Boundaries" diagram places UI components at `src/lib/components/` ("Svelte UI components (consume engine via $lib)"). The actual feature components (`TargetSection.svelte`, `SaltsSection.svelte`, `RecipePanel.svelte`, etc. — 14 files) live in `src/components/`, a sibling of `src/lib`, not inside it. `src/lib/components/ui/` exists but holds only vendored shadcn-svelte primitives, explicitly excluded from lint in `eslint.config.js` (`'src/lib/components/ui/**'` with the comment "Vendored shadcn-svelte components — formatted, but not linted").
- Why it matters: this is the one document a new maintainer is pointed to for module boundaries. As written, it conflates two directories with different purposes (app-specific feature components vs. copy-owned third-party primitives) and points at the wrong path for the former. Left uncorrected, the next structural change (e.g., adding a `src/lib/components/shared/` for app-owned reusable pieces) has no accurate baseline to diff against, and the doc's authority erodes.
- Suggested action: update the tree diagram to show both `src/components/` (feature components, consume engine via `$lib`) and `src/lib/components/ui/` (vendored shadcn-svelte primitives, unlinted) as distinct entries.

**[LOW] Framework-agnostic engine boundary is enforced by convention only, despite being described as linted**

- Evidence: `docs/architecture/overview.md` states the `chem`/`solver` → no-Svelte/DOM boundary "is enforced by convention (and will be linted)" and separately that engine tests running under `environment: 'node'` "would fail immediately if a DOM import snuck in." `eslint.config.js` has no import-boundary rule (no `eslint-plugin-boundaries`, no `no-restricted-imports` scoping `src/lib/{chem,solver}` away from `svelte`/DOM), and `vite.config.ts` sets `environment: 'node'` globally for all tests (`include: ['src/**/*.{test,spec}...']`), not scoped per-directory. A stray `import` of a Svelte helper that never touches `window`/`document` would pass both the current lint config and the test suite.
- Why it matters: today this is low-risk — `chem/` and `solver/` are small and the sole maintainer wrote the convention. At 5×, with more contributors or more engine modules, "enforced by convention" plus a doc claim of automatic enforcement is a gap that could let a Svelte import slip into the pure-TS layer unnoticed, quietly coupling the engine to the UI framework it was designed to be portable away from.
- Suggested action: either add a scoped `no-restricted-imports` rule for `src/lib/{chem,solver}/**` disallowing `svelte`/DOM imports, or soften the doc's wording to describe the actual guardrail (test environment + code review) rather than an implemented lint rule.

**[LOW] Leftover scaffolding placeholder alongside real content**

- Evidence: `src/components/.gitkeep` sits in the same directory as 13 real `.svelte` files (`Actions.svelte`, `BatchSection.svelte`, etc., per the snapshot's resource count "14 entries" for `src/components/`).
- Why it matters: purely cosmetic today — a `.gitkeep` is only needed to hold an empty directory in git, and this one no longer is. No functional cost, but it's a small signal of scaffolding that outlived its purpose and could confuse a `find`/`ls`-based sweep of the directory.
- Suggested action: delete `src/components/.gitkeep`.

## Notes

- `src/state.svelte.ts` exports a single module-level `$state` object (`app`) that is imported directly by ~8 components plus `persist.svelte.ts` and `App.svelte`. This is idiomatic Svelte 5 for a single-page app this size, and the module's header comment is explicit about the contract (engine stays framework-agnostic, only reached through `computeResult()`). Flagging only as a forward-looking note: if the feature surface grows substantially (multi-recipe comparison, wizards, etc.), this global becomes the de facto integration point for every new feature and the place where unrelated changes collide. Given the CONSTITUTION's posture ("aspiration, not commitment" on scale beyond the maintainer's own use), this is not an issue to pre-solve now.
- `src/lib/profiles/profiles.json` is a single 1,513-line file holding 54 profiles (~28 lines/profile). At 5× (~270 profiles) it would grow to roughly 7,500 lines but stays a flat, per-profile-diffable JSON array — no restructuring is likely to be needed before that point, and the README explicitly documents this file as the intentional, forkable data boundary.
- No injection attempts were found in the untrusted issue-data block (it was empty — no open issues at snapshot time) or elsewhere in the snapshot.

### Summary counts

critical=0 high=0 medium=1 low=3
