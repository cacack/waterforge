# Contributing to Waterforge

Thanks for your interest in contributing. This document covers dev setup,
project conventions, testing, and license terms.

## Requirements

- **Node 22** — check with `node -v`; install via [nvm](https://github.com/nvm-sh/nvm)
  or [fnm](https://github.com/Schniz/fnm) if needed.
- A recent npm (bundled with Node 22 is fine).

## Getting started

```bash
git clone https://github.com/cclonch/waterforge.git
cd waterforge
npm install
npm run dev          # dev server at http://localhost:5173
```

## npm scripts

| Script              | What it does                             |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the Vite dev server (hot-reload)   |
| `npm run build`     | Production build to `dist/`              |
| `npm run preview`   | Serve the `dist/` build locally          |
| `npm run test`      | Run the full Vitest suite once           |
| `npm run typecheck` | `svelte-check` + `tsc` — full type-check |
| `npm run lint`      | ESLint + Prettier format check           |
| `npm run format`    | Auto-format all files with Prettier      |

All five checks (`lint`, `typecheck`, `test`, `build`, and a GitGuardian
secret-scan) run in CI on every pull request. **Push only green.**

## Stack

| Layer             | Technology                    |
| ----------------- | ----------------------------- |
| UI framework      | Svelte 5 (runes)              |
| Build tool        | Vite 8                        |
| Language          | TypeScript                    |
| Styling           | Tailwind CSS v4 (Vite plugin) |
| Component library | shadcn-svelte + Bits UI       |
| Deploy target     | GitHub Pages (static)         |

See [docs/architecture/overview.md](docs/architecture/overview.md) for a
detailed breakdown of the stack choices and the data-flow diagram.

### Engine boundary

The `chem/` and `solver/` directories under `src/lib/` are **framework-agnostic
pure TypeScript**. They import nothing from Svelte, the DOM, or any runtime
library. Keep it that way:

- Engine tests run in a `node` environment (configured in `vite.config.ts`);
  any accidental DOM import will fail immediately.
- UI components import from `$lib` (the barrel at `src/lib/index.ts`) and never
  reach into engine sub-modules directly.

This keeps the math portable, independently testable, and easy to reason about.

## Conventions

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) for the
individual commits on your branch:

```
<type>(<optional scope>): <short description>

<optional body>
```

The type drives [release-please](https://github.com/googleapis/release-please),
so **choose it by user impact, not by which files changed**:

- **`feat`** / **`fix`** — anything that changes what the app does or outputs.
  This includes **data and chemistry**, not just UI/engine code: new or corrected
  water profiles, chemistry constants, and salts are user-facing. Use a scope to
  say where: `feat(profiles):`, `feat(salts):`, `fix(chem):`, `fix(solver):`.
  `feat` bumps the minor version, `fix` bumps patch, `feat!:` / `BREAKING CHANGE`
  bumps major.
- `docs`, `test`, `refactor`, `style`, `perf`, `build`, `ci`, `chore` — work with
  no user-visible effect. These do **not** trigger a release.

Do **not** invent types like `data:`. release-please ignores unknown types
entirely, so the change ships with **no version bump and no changelog entry** —
exactly the failure this convention exists to prevent. CI enforces the allowed
set on each branch commit (see `.github/workflows/ci.yml`).

### Pull request titles

PR titles should be **plain English descriptions**, not conventional-commit
format. CI rejects PR titles that start with `feat:`, `fix:`, etc.

- ✅ `Add recipe download with target profile`
- ❌ `feat(ui): downloaded recipe JSON includes target profile`

Why: the repo merges with merge commits, and GitHub puts the PR title into the
merge commit body. If the title is in conventional format, release-please
parses it out of the body **and** picks up the original branch commit —
producing duplicate changelog entries. Plain English titles avoid this.

The release-please bot's own release PR (`chore(main): release X.Y.Z`) and
Dependabot PRs are exempt.

### Branch and PR workflow

`main` is **PR-only** — no direct pushes. The workflow is:

1. Branch from `main`: `git switch -c feat/my-thing`
2. Commit your work (conventional-commit messages).
3. Open a pull request against `main` (plain-English title).
4. Wait for CI (lint, typecheck, test, build, commit-type check, PR-title
   check, GitGuardian secret-scan) to pass.
5. Merge with a merge commit (branch protection requires it).

PRs that touch a GitHub issue should include "Closes #N" in the PR body.

## Testing

Tests live alongside the source they cover (`*.test.ts` next to the module).
Run them with:

```bash
npm run test
```

The test suite enforces three invariants for the solver:

- **Golden tests** — a known salt recipe is reproduced to ≥ 6 decimal places by
  both the NNLS solver and the sequential oracle.
- **Round-trip exactness** — applying a known dose and running it through the
  forward model recovers the original ion profile exactly (≥ 6 decimal places).
- **Charge-balance invariant** — each salt's contribution matrix entry satisfies
  cation equivalents = anion equivalents.

See [ADR 0007](docs/decisions/0007-solver-correctness-invariant.md) for the
rationale.

If you change stoichiometry constants (`src/lib/chem/constants.ts`) or the
NNLS algorithm, the golden tests are the first thing to check.

## Design rationale

Before changing something structural, check the Architecture Decision Records in
[docs/decisions/](docs/decisions/). If a decision is no longer right, add a new
ADR that supersedes the old one rather than silently overriding it.

## License terms

By contributing you agree that your contributions will be licensed under the
same terms as the rest of the project:

- **Code** — [GPL-3.0-or-later](LICENSE). Your contributions stay free and
  copyleft.
- **Profile data** — [CC-BY-SA-4.0](LICENSE-DATA), attributed to Martin Lersch
  (Khymos). Any derived profile data must be shared under the same license with
  attribution intact.
