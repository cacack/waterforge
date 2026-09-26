# Engineering Panel Synthesis — 2026-09-26

## Per-persona verdicts

| Persona         | Verdict         | Findings (C/H/M/L) |
| --------------- | --------------- | ------------------ |
| Architect       | healthy         | 0/0/1/3            |
| Security        | healthy         | 0/0/0/3            |
| Ops/SRE         | needs-attention | 0/1/1/1            |
| DX              | healthy         | 0/0/0/3            |
| Maintainability | healthy         | 0/0/0/2            |

## Cross-cutting themes

1. **The architecture doc has drifted from the tree** (Architect MEDIUM,
   Maintainability LOW). `docs/architecture/overview.md`'s module-boundaries
   diagram places feature components under `src/lib/components/`; they live in
   `src/components/`, and `src/lib/components/ui/` holds only vendored
   shadcn-svelte primitives. The same doc says the engine boundary "will be
   linted", but no lint rule exists (Architect LOW).
2. **Scaffolding cruft** (Architect LOW, Maintainability LOW). A leftover
   `src/components/.gitkeep` sits beside 14 real components.
3. **Community-health files** (Security LOW, DX LOW). There is no
   `CODE_OF_CONDUCT.md`. DX also notes there is no PR template, even though the
   plain-English PR-title rule is easy to miss.
4. **Silent failure modes in automation** (Ops/SRE HIGH and MEDIUM). A red
   `check` does not block merges, and a failing `release-please.yml` (an
   expired PAT) raises no alert. `site-health.yml` already monitors the domain
   and TLS expiry, but not the release pipeline.

## Prioritized findings

1. **[HIGH] `check` is not a required status check** (Ops/SRE). The live
   ruleset requires only "GitGuardian Security Checks" (verified via the API
   on 2026-09-26). This has already caused a five-day red `main`. The ruleset is
   managed as code outside this repo, so the fix belongs there. A UI edit, as
   `docs/operations/ci-cd.md` currently suggests, would be reverted on the next
   apply.
2. **[MEDIUM] The architecture diagram is stale** (Architect, Maintainability;
   cross-flagged).
3. **[MEDIUM] Nothing detects `RELEASE_PLEASE_TOKEN` expiry or release-pipeline
   failure** (Ops/SRE). `docs/operations/continuity.md` already names this
   blind spot.
4. **[LOW] The engine boundary is not actually linted** (Architect). Either add
   a scoped `no-restricted-imports` rule or correct the doc.
5. **[LOW] No `CODE_OF_CONDUCT.md` or PR template** (Security, DX).
6. **[LOW] Stale `.gitkeep`** (Architect, Maintainability).
7. **[LOW] No SAST, and a build-time `{@html}` sink** (Security). Both are
   informational at this app's scale.
8. **[LOW] Silent client-side `catch {}`** (Ops/SRE). This is deliberate under
   the no-tracking principle. No action is needed unless bug reports call for it.

## Overall assessment

The project is healthy for its scale. The architecture is small and coherent,
with 20 ADRs. There are no committed secrets, actions are SHA-pinned, and the
operations docs and runbooks are unusually complete. There are no TODO or
FIXME markers, and the test coverage asymmetry is a documented choice. The one
real risk is process, not code: CI's `check` job is advisory, so a bad
auto-merged dependency bump can leave `main` red. Close that gap first. Then
add a release-pipeline health check alongside the existing site-health
monitors, and refresh the architecture doc.
