# CLAUDE.md

Guidance for Claude Code in the **Waterforge** repo. User-facing docs: `README.md`.

## What this is

Waterforge is a static, client-side web app for cloning bottled mineral waters
from distilled water and food-grade salts. Copyleft: code **GPLv3**, profile
data **CC-BY-SA-4.0** (attribution to Martin Lersch / Khymos). Stack:
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

- Conventional commits.
- `main` is PR-only — branch → PR → merge; no direct pushes.
- Engine code (`chem/`, `solver/`) is framework-agnostic pure TypeScript; keep
  it independent of the Svelte UI so the math stays portable and testable.
