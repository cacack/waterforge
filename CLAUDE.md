# CLAUDE.md

Guidance for Claude Code in the **Waterforge** repo. User-facing docs: `README.md`.

## What this is

Waterforge is a static, client-side web app for cloning bottled mineral waters
from distilled water and food-grade salts. Copyleft: code **GPLv3**, profile
data **CC-BY-SA-4.0** (per-profile sources; recipe method credited to Martin
Lersch / Khymos). Stack:
TypeScript + Svelte 5 (runes) + Vite, deployed to GitHub Pages.

## Where to look

- `README.md` — what it is + quickstart.
- `USAGE.md` — how to use the app.
- `CONSTITUTION.md` — mission, audience, principles, non-goals.
- `CONTRIBUTING.md` — dev setup and workflow.
- `docs/architecture/` — system design.
- `docs/decisions/` — ADRs (one decision per entry; append-only).
- `docs/guides/` — chemistry and how-to explainers.
- `docs/operations/` — build, deploy, runbooks.

## Conventions

- Conventional commits **on branch commits** (CI enforces the type); PR titles
  use plain English (CI rejects conventional-format PR titles — see
  `CONTRIBUTING.md`). The type drives release-please versioning, so pick it by
  **user impact, not file kind**: use **`feat`**/**`fix`** for anything that
  changes app functionality or output — _including_ water-profile data,
  chemistry constants, and salts (`feat(profiles):`, `feat(salts):`,
  `fix(chem):`). Reserve `docs`/`test`/`refactor`/`chore`/`ci` for
  non-functional work. Never use a `data:` type — release-please ignores
  unknown types, so the change ships with no version bump or changelog entry.
- `main` is PR-only — branch → PR → merge; no direct pushes.
- `package.json` splits `dependencies` vs `devDependencies` by whether the
  package lands in `dist/`, not by when it runs — Svelte/Vite/Tailwind are
  runtime deps here. That split tells Dependabot which bumps cut a release
  (see `CONTRIBUTING.md`); put new packages on the right side.
- Engine code (`chem/`, `solver/`) is framework-agnostic pure TypeScript; keep
  it independent of the Svelte UI so the math stays portable and testable.
