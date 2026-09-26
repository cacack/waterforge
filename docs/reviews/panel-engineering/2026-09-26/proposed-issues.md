# Proposed Issues — 2026-09-26

## 1. Make the CI `check` job a required status check on `main`

**Severity:** high **Persona(s):** ops-sre **Labels:** type:chore, area:infra

**Problem.** The `main` ruleset requires only "GitGuardian Security Checks".
The `check` job in `ci.yml` (lint, typecheck, test, build) is advisory, so a PR
can merge with it red. That includes Dependabot auto-merges. This already left
`main` failing for five days after a `prettier-plugin-tailwindcss` bump
(recorded in `ci.yml`'s header and `docs/operations/ci-cd.md`).

**Approach.** Add the `check` context (GitHub Actions) to this repository's
required status checks. The ruleset is managed as code outside this repository,
so make the change there and not in the Settings UI, which the next apply would
revert. Keep the strict up-to-date policy. Then replace the "Follow-up: making
CI checks required" section of `docs/operations/ci-cd.md` with a statement that
`check` is required.

**Acceptance criteria.**

- A PR with a failing `check` cannot be merged.
- `docs/operations/ci-cd.md` no longer describes `check` as advisory.

---

## 2. Bring the architecture doc's module-boundaries diagram in line with the tree

**Severity:** medium (cross-flagged) **Persona(s):** architect, maintainability
**Labels:** type:docs, area:docs

**Problem.** `docs/architecture/overview.md` shows UI components in
`src/lib/components/`. The feature components (`TargetSection.svelte`,
`RecipePanel.svelte`, …) live in `src/components/`, and
`src/lib/components/ui/` holds only vendored shadcn-svelte primitives, which
are excluded from lint. The same doc says the engine boundary "will be linted",
but no such rule exists. A stale `src/components/.gitkeep` also remains.

**Approach.**

- Redraw the diagram with both directories and their distinct roles.
- Either add a scoped `no-restricted-imports` rule that keeps
  `src/lib/{chem,solver}/**` free of Svelte and DOM imports, or reword the doc
  to describe the guardrail that actually exists.
- Delete the `.gitkeep`.

**Acceptance criteria.**

- The diagram matches `git ls-files src`.
- The doc's enforcement claim is true.
- The `.gitkeep` is gone.

---

## 3. Alert when the release pipeline stops succeeding

**Severity:** medium **Persona(s):** ops-sre **Labels:** type:chore, area:infra

**Problem.** `RELEASE_PLEASE_TOKEN` is a fine-grained PAT with a mandatory
expiry. When it lapses, `release-please.yml` fails quietly: releases stop and
the site stays frozen at the last deploy. `docs/operations/continuity.md` names
this blind spot. `site-health.yml` already watches domain and TLS expiry with
dated thresholds and opens a de-duplicated issue when one fails, but nothing
watches the release pipeline.

**Approach.** Extend `site-health.yml`, or add a small sibling check, to open
an issue when the last scheduled run of `release-please.yml` failed. Reuse the
existing issue filing, which is de-duplicated by title.

**Acceptance criteria.**

- A failing `release-please.yml` run produces a tracked issue within a day.
- The alert links to the token-rotation steps in `docs/operations/`.
