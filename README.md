# Waterforge

Clone bottled mineral waters from distilled (or known-source) water and
food-grade salts. Waterforge is a static, client-side web app: pick a target
profile, set your source water, toggle the salts you own, and get a precise,
batch-scaled recipe.

**Try it:** [waterforge.app](https://waterforge.app)

![Waterforge — desktop, light theme](docs/hero.png)

## What it does

Waterforge takes a named target mineral-water profile, subtracts what is already
in your source water, and computes the exact salt additions (in grams, scaled to
your batch size) needed to hit it. It also shows you the sulfate:chloride ratio,
TDS, and charge-residual readouts, and warns when any salt approaches saturation
so you know the recipe will actually dissolve.

The solver uses non-negative least-squares (NNLS) with exact stoichiometry —
not rules of thumb — so results are reproducible anywhere you can get distilled
water and food-grade salts.

**Who it is for:** homebrewers and water hobbyists who want to match a specific
drinking-water profile precisely. It is _not_ a mash-pH or brewing-salts tool;
see [CONSTITUTION.md](CONSTITUTION.md) for non-goals.

## Quickstart

Requirements: **Node 22** (check with `node -v`).

```bash
git clone https://github.com/cacack/waterforge.git
cd waterforge
npm install
npm run dev          # dev server at http://localhost:5173
```

Other useful scripts:

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Production build to `dist/`                   |
| `npm run preview`   | Serve the `dist/` build locally               |
| `npm run test`      | Run the Vitest test suite (engine unit tests) |
| `npm run typecheck` | `svelte-check` + `tsc` — full type-check      |
| `npm run lint`      | ESLint + Prettier format check                |
| `npm run format`    | Auto-format all files with Prettier           |

## Documentation

| Document                                                       | What it covers                                 |
| -------------------------------------------------------------- | ---------------------------------------------- |
| [CONSTITUTION.md](CONSTITUTION.md)                             | Mission, audience, principles, non-goals       |
| [USAGE.md](USAGE.md)                                           | How to use the app (intended user flow)        |
| [CONTRIBUTING.md](CONTRIBUTING.md)                             | Dev setup, conventions, testing, license terms |
| [docs/architecture/overview.md](docs/architecture/overview.md) | Stack, module boundaries, data flow            |
| [docs/decisions/](docs/decisions/)                             | Architecture Decision Records (ADR 0001–0009)  |
| [docs/guides/chemistry.md](docs/guides/chemistry.md)           | Chemistry background and unit conversions      |
| [docs/guides/reference-data.md](docs/guides/reference-data.md) | Reference data and profile sources             |
| [docs/operations/ci-cd.md](docs/operations/ci-cd.md)           | CI/CD pipeline and deployment                  |
| [docs/operations/release.md](docs/operations/release.md)       | Release runbook (cut, tag, publish)            |

## License

Waterforge uses a split license:

- **Code** — [GPL-3.0-or-later](LICENSE).
- **Profile data** — [CC-BY-SA-4.0](LICENSE-DATA), attributed to Martin Lersch
  (Khymos). Derived data must be shared under the same license.

This keeps the project free and copyleft, faithful to the freely published
source method it builds on.
