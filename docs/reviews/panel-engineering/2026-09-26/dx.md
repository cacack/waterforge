# Developer Experience Review — 2026-09-26

**Verdict:** healthy

**Project contributor scope (for context):** solo-maintainer, public-OSS posture — `CONSTITUTION.md` states the project is "built for its maintainer, first," but it ships public issue templates, a full `CONTRIBUTING.md`, and an open license, so external drive-by contributions are clearly anticipated even though not solicited.

Onboarding here is about as good as it gets for a project this size. The README leads with what the app is, who it's for, and a five-command quickstart (`git clone` → `cd` → `npm install` → `npm run dev`, with Node version pinned in `.nvmrc` and called out explicitly) — a new contributor can be looking at a running dev server in a couple of minutes. `CONTRIBUTING.md` restates and extends that setup with a full npm-scripts table, the engine/UI boundary rule, commit and PR-title conventions (with the _why_ behind each), a dependency-classification rule, and a testing section that explains the three solver invariants and where to look when they fail. In-code documentation in the sampled engine files (`src/lib/index.ts`, `src/lib/solver/solve.ts`) is dense and rationale-bearing, consistently pointing at the relevant ADR. The main friction a first-time external contributor would hit is procedural rather than informational: no PR template to prompt for the `Closes #N` convention CONTRIBUTING documents, and no CODE_OF_CONDUCT for a public repo — both minor given the project's explicitly solo, not-soliciting-contribution posture.

## Findings

**[LOW] No pull request template**

- Evidence: `find .github -iname "*pull_request*"` returns nothing; no `.github/pull_request_template.md` or `.github/PULL_REQUEST_TEMPLATE/` directory.
- Why it matters: `CONTRIBUTING.md` asks that "PRs that touch a GitHub issue should include 'Closes #N' in the PR body," and the plain-English PR title rule is unusual enough (CI actively rejects conventional-commit-format titles) that a first-time contributor is likely to get it wrong on the first attempt and have to fix it after a failed check. A template surfaces both conventions at PR-creation time instead of requiring a read of CONTRIBUTING first.
- Suggested action: Add a short `.github/pull_request_template.md` with a "Closes #" line and a one-line reminder that the title must be plain English (link to the CONTRIBUTING section).

**[LOW] No CODE_OF_CONDUCT.md**

- Evidence: snapshot confirms `CODE_OF_CONDUCT.md: absent`; issue templates and CONTRIBUTING exist but no conduct policy.
- Why it matters: Minor for a project whose own constitution says it's "built for its maintainer, first" and doesn't solicit a contributor community — but the repo is public, accepts issues/PRs, and has GitHub's default community-health prompts, so its absence would surface as a "should we have one of these" question if the project ever gets outside traction.
- Suggested action: Optional given the stated posture; if desired, GitHub's one-click default CoC template is sufficient and costs nothing to add.

**[LOW] No `.editorconfig`**

- Evidence: `find . -iname ".editorconfig"` returns nothing.
- Why it matters: Very low actual cost here — Prettier (`.prettierrc.json`, committed) and ESLint (`eslint.config.js`, committed) already enforce and auto-fix formatting consistently across editors via `npm run lint`/`npm run format`, so the class of problem `.editorconfig` solves (indent-style drift before a formatter runs) is already mostly covered.
- Suggested action: None needed; noted only for completeness.

## Notes

- Quickstart, prerequisites, and stack are stated with unusual precision: Node version is pinned in one authoritative place (`.nvmrc`), and CONTRIBUTING explains _why_ (`engines.node` floor, CI/deploy both reading `node-version-file`) rather than just asserting it.
- Test ergonomics are good for the project's size: `npm run test` runs the whole Vitest suite in one command, and CONTRIBUTING explains what to check first (golden tests) when a change touches solver internals — useful triage guidance that most projects omit.
- The docs index in the README (a table of every top-level and `docs/` document with a one-line description of what it covers) is a strong pattern for a repo with 49 markdown files; it prevents the "which of these 15 docs do I read" problem that repos with a `docs/` tree of this size often have.
- `docs/decisions/` (20 ADRs) and `docs/guides/` are both cross-linked from CONTRIBUTING and the source code itself (e.g., `solve.ts` cites ADR 0009 inline), so the rationale trail from code back to decision is unusually easy to follow.
- No devcontainer, Nix flake, or setup script exists, but none is needed: the stack is npm + Vite with no system dependencies beyond Node, and the quickstart is already under five commands.

### Summary counts

critical=0 high=0 medium=0 low=3
