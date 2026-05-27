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

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>

<optional body>
```

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

### Branch and PR workflow

`main` is **PR-only** — no direct pushes. The workflow is:

1. Branch from `main`: `git switch -c feat/my-thing`
2. Commit your work.
3. Open a pull request against `main`.
4. Wait for CI (lint, typecheck, test, build, GitGuardian secret-scan) to pass.
5. Merge (squash or merge commit — keep the history readable).

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
