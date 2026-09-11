# Strategic Snapshot — 2026-09-11

## Repo metadata

- Root: /Users/chris/devel/home/waterforge
- Branch: docs/constitution-refresh-2026-09
- HEAD: 8d27ddd
- Origin: git@github.com:cacack/waterforge.git
- Generated: 2026-09-11T16:40:47Z

## CONSTITUTION.md (scoring rubric)

# Constitution

> The mission, principles, and non-goals of Waterforge. When in conflict with
> this document, future decisions should align here or explicitly update it.

## Mission

Waterforge turns distilled (or known-source) water and food-grade salts into
faithful clones of bottled mineral waters. It's a static, client-side web app
that takes a target water profile, subtracts what's already in your source
water, and computes the exact salt additions needed to hit it — and, for a
sparkling target, the regulator pressure to carbonate it to match — so anyone can
reproduce a named mineral water at home, precisely and reproducibly. Its recipe
method descends from Martin Lersch's (Khymos) freely published work; the profile
data is now an independently-sourced compilation, and the whole stays free.

## Audience

**This is for:** homebrewers and water hobbyists who want to match a specific
drinking-water profile from a clean baseline using food-grade salts, and who
care about getting the numbers right.

**This is not for:** brewers looking for mash-pH or residual-alkalinity tooling —
Waterforge models the water itself, not what happens when grain hits it (reach
for Bru'n Water / EZ Water Calculator there).

## Principles

When in doubt, prefer:

1. **Free and copyleft over proprietary control** — code stays GPLv3, profile
   data CC-BY-SA-4.0 (per-profile sources; recipe method credited to
   Lersch/Khymos). What we build on the commons stays in the commons.
2. **Distilled-first over tap-water assumptions** — build up from a known-zero
   baseline; treat known-source water as the handled exception, not the default.
   Results should be reproducible anywhere.
3. **Precision over hand-waving** — exact stoichiometry and explicit units (mind
   the as-CaCO₃ / as-HCO₃ trap), not rules of thumb. Surface uncertainty
   (solubility / saturation warnings) rather than bury it.
4. **Faithful to the source method over novel chemistry** — track Lersch's
   published method; deviations are documented decisions, not silent
   reinventions.
5. **Static and client-side over backend convenience** — everything runs in the
   browser. No servers, accounts, or telemetry: cheaper to host, private by
   default, durable — and installable, so it keeps working offline at the
   counter.

## Non-Goals

This project is explicitly **not** trying to:

- Predict mash pH or residual alkalinity — that's grain-and-water chemistry, out
  of scope.
- Be a general brewing-water tool — we model finished drinking water, not
  brewing-salts-for-style.
- Predict flavor or sensory outcomes — we match ion profiles, not taste.
- Run a backend — no accounts, no cloud sync, no server-side state.

## Success Criteria

We'll know this is working if:

- The solver reproduces a known published recipe to ≥6 decimal places
  (golden-test verified).
- A user can go from a named target to a gram-accurate, batch-scaled salt recipe
  — with sulfate:chloride, TDS, charge-residual, and saturation readouts/warnings
  — in one unbroken flow.
- A browsable library of sourced target profiles ships — bottled, brewing,
  coffee, and synthetic references. It grows opportunistically, with every new
  profile held to the same authoritative-sourcing standard (see ADR 0011).
- The app is live and usable at [waterforge.app](https://waterforge.app), no
  install required — and installable for offline use.
- Once feature-complete, it stays that way: the site is up, dependencies stay
  current, and security advisories are cleared promptly — a released version is
  always installable and correct.

---

_Last refreshed: 2026-09-11_

## README excerpt

````markdown
# Waterforge

Clone bottled mineral waters from distilled (or known-source) water and
food-grade salts. Waterforge is a static, client-side web app: pick a target
profile, set your source water, toggle the salts you own, and get a precise,
batch-scaled recipe. Install it to your home screen and it works offline, at
the counter, with no connection.

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

Requirements: **Node 24**, pinned in [`.nvmrc`](.nvmrc) — run `nvm use` in the
clone to select it (check with `node -v`).

```bash
git clone https://github.com/cacack/waterforge.git
cd waterforge
npm install
npm run dev          # dev server at http://localhost:5173
```
````

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
| [ROADMAP.md](ROADMAP.md)                                       | Where the project is headed                    |
| [docs/architecture/overview.md](docs/architecture/overview.md) | Stack, module boundaries, data flow            |
| [docs/decisions/](docs/decisions/)                             | Architecture Decision Records                  |
| [docs/guides/chemistry.md](docs/guides/chemistry.md)           | Chemistry background and unit conversions      |
| [docs/guides/reference-data.md](docs/guides/reference-data.md) | Reference data and profile sources             |
| [docs/operations/ci-cd.md](docs/operations/ci-cd.md)           | CI/CD pipeline and deployment                  |
| [docs/operations/release.md](docs/operations/release.md)       | Release runbook (cut, tag, publish)            |

## Getting help

- **A question, or unsure what a readout means?** Open a
  [question issue](https://github.com/cacack/waterforge/issues/new?labels=question&template=question.md).
- **Found a bug or a wrong number?** File a
  [bug report](https://github.com/cacack/waterforge/issues/new?template=bug_report.md)
  — a shared recipe link (the share button in the app) captures the exact inputs.
- **Want a water added to the library?** Open a
  [profile request](https://github.com/cacack/waterforge/issues/new?template=profile_request.md)
  with a source for its mineral analysis.

Where the project is headed is in [ROADMAP.md](ROADMAP.md).

## License

Waterforge uses a split license:

- **Code** — [GPL-3.0-or-later](LICENSE).
- **Profile data** — [CC-BY-SA-4.0](LICENSE-DATA). The data is an
  independently-sourced compilation (each profile cites its own source);
  CC-BY-SA-4.0 is the project's copyleft choice over it, and derived data must
  be shared under the same license. The recipe method is credited to Martin
  Lersch (Khymos).

This keeps the project free and copyleft, faithful to the freely published
source method it builds on.

```

## Project metadata
- name: waterforge
- version: 1.9.4
- description: Clone bottled mineral waters from distilled water and food-grade salts.
- license: GPL-3.0-or-later
- private: True
- type: module
- dependencies: @fontsource-variable/geist, @fontsource-variable/geist-mono, @internationalized/date, @lucide/svelte, @sveltejs/vite-plugin-svelte, @tailwindcss/vite, bits-ui, clsx, svelte, tailwind-merge, tailwind-variants, tailwindcss, tw-animate-css, vite, vite-plugin-pwa
- devDependencies: @eslint/js, @tsconfig/svelte, @types/node, eslint, eslint-plugin-svelte, globals, prettier, prettier-plugin-svelte, prettier-plugin-tailwindcss, svelte-check, svelte-eslint-parser, typescript, typescript-eslint, vitest
- scripts: dev, build, preview, typecheck, test, lint, format
- LICENSE: GPL-3.0-or-later (code); LICENSE-DATA: CC-BY-SA-4.0 (profile data)

## Profile library composition
- total profiles: 54
- by category: {'bottled': 45, 'synthetic': 3, 'brewing': 4, 'coffee': 2}
- distinct countries: 14
- with carbonation_style set: 36
- with carbonation_target set: 5

## Open issues
<untrusted-issue-data>
- #212 [no milestone] CONTRIBUTING.md clone URL points at the wrong org  — labels: effort:low,value:medium,type:bug,good-first-issue,area:docs
- #209 [no milestone] Alert when a Dependabot vulnerability sits unactioned  — labels: effort:low,value:medium,type:chore,area:infra,priority:medium
</untrusted-issue-data>

## Open milestones
<untrusted-issue-data>
(no open milestones)
</untrusted-issue-data>

## Recently closed issues (last 40, for direction context)
<untrusted-issue-data>
- #210 COMPLETED 2026-09-11 Track the Node version in one place and move to Active LTS
- #205 COMPLETED 2026-09-11 Document the scale resolution the recipes require
- #204 COMPLETED 2026-09-11 Run CI against main after merge, not only on pull requests
- #132 COMPLETED 2026-06-01 Research and populate carbonation targets for all sparkling profiles
- #129 COMPLETED 2026-06-01 Document profile metadata and add it to the contribution flow
- #128 COMPLETED 2026-06-01 Surface profile metadata in the target panel
- #127 COMPLETED 2026-06-01 Backfill profile metadata across the existing library
- #126 COMPLETED 2026-06-01 Add structured profile metadata fields (geography, description, traits, category)
- #123 COMPLETED 2026-06-01 Surface carbonation target in the recipe output
- #122 COMPLETED 2026-06-01 Model still vs sparkling and a carbonation target on profiles
- #121 COMPLETED 2026-05-31 Add a force-carbonation calculator (target CO₂ + temperature → regulator PSI)
- #115 COMPLETED 2026-05-31 Establish a lightweight forward plan for post-v1.5 work
- #114 COMPLETED 2026-05-31 Audit v1.0-v1.2 changelog for data-typed commit omissions
- #113 COMPLETED 2026-05-31 Add a Getting Help / support surface for users
- #112 COMPLETED 2026-05-31 Refresh stale documentation to match shipped v1.5.0 reality
- #98 COMPLETED 2026-06-01 Expand the bottled-water library beyond the Khymos seed set
- #96 COMPLETED 2026-05-31 Amend ADR 0001: profile data is now independently sourced, not Khymos-derived
- #94 COMPLETED 2026-05-29 Resolve or remove Harghita profile (unverifiable brand identity)
- #85 COMPLETED 2026-05-28 Remove Kessel profile (unrecoverable provenance)
- #83 COMPLETED 2026-05-29 Add a site footer with release version and license attribution
- #72 COMPLETED 2026-05-28 ci: reconcile continuous deployment with versioned releases
- #71 COMPLETED 2026-05-28 Source water toggle is misleading — off state shows the active mode
- #68 COMPLETED 2026-05-28 Validate 8 brewing / coffee / tea / synthetic reference profiles
- #67 COMPLETED 2026-05-29 Validate remaining 32 commercial bottled-water profiles
- #65 COMPLETED 2026-05-28 Import dialog exposes internal "AppSnapshot" type name to users
- #64 COMPLETED 2026-05-28 Downloaded "recipe" JSON has no target profile or salt doses
- #63 COMPLETED 2026-05-28 Share link captures wrong target; loaded URL doesn't restore state
- #50 COMPLETED 2026-05-28 Header: icon-ify theme toggle + source link
- #30 COMPLETED 2026-09-11 Drop the matrix dependency (vendor a small NNLS)
- #29 COMPLETED 2026-05-29 Inquire on matching .com domain
- #28 NOT_PLANNED 2026-09-11 Coupled-Ksp solubility fidelity
- #27 NOT_PLANNED 2026-09-11 Teaspoon / volume salt-measure mode
- #26 COMPLETED 2026-05-31 PWA / offline support
- #25 COMPLETED 2026-05-28 Domain + v1 release
- #24 COMPLETED 2026-05-28 Responsive + a11y QA pass
- #23 COMPLETED 2026-05-27 Shareable recipe links
- #22 COMPLETED 2026-05-27 JSON import/export
- #21 COMPLETED 2026-05-27 localStorage persistence
- #20 COMPLETED 2026-05-27 Readouts + warnings (sulfate:chloride, TDS, charge residual, SI + guidance)
- #19 COMPLETED 2026-05-27 Results table (grams per salt, scaled to batch)
</untrusted-issue-data>

## Recent activity
- Commits (last 6 months): 340
- Non-merge, non-dependabot commits (last 6 months): 127

### Last 40 commit subjects
```

8d27ddd docs: refresh the constitution for the maintenance phase
e0af710 Merge pull request #214 from cacack/release-please--branches--main--components--waterforge
fb8a82f Merge branch 'main' into release-please--branches--main--components--waterforge
683a928 Merge pull request #215 from cacack/deps/vitest-5
d768173 chore(deps): upgrade vitest to 5.0.0
a62a57b chore(main): release 1.9.4
f3ac399 Merge pull request #213 from cacack/deps/latest-stable
44a3ab6 chore(deps): bring tooling to latest stable
50f7acb fix(deps): bring shipped dependencies to latest stable
119ed51 Merge pull request #211 from cacack/chore/node-24-nvmrc
8ba630b chore(ci): pin Node in .nvmrc and move to Active LTS 24
6a46c50 Merge pull request #208 from cacack/chore/nanoid-3.3.19
7c691b3 chore(deps): bump nanoid to 3.3.19 to clear CVE-2026-67213
debd0a6 Merge pull request #207 from cacack/worktree-205-scale-resolution-docs
adcc2e7 docs(usage): explain what scale the recipes need and how to weigh them
c4f267c Merge pull request #206 from cacack/worktree-204-ci-on-main
e14383a ci: run CI against main on push and a daily schedule
4efa9b4 Merge pull request #203 from cacack/release-please--branches--main--components--waterforge
2200026 chore(main): release 1.9.3
b66427d Merge pull request #199 from cacack/dependabot/npm_and_yarn/internationalized/date-3.12.4
74c2686 fix(deps): bump @internationalized/date from 3.12.3 to 3.12.4
cdb3e86 Merge pull request #198 from cacack/dependabot/npm_and_yarn/fontsource-variable/geist-mono-5.3.0
9acf806 fix(deps): bump @fontsource-variable/geist-mono from 5.2.8 to 5.3.0
ecd480d Merge pull request #200 from cacack/dependabot/npm_and_yarn/bits-ui-2.19.0
cd83faf fix(deps): bump bits-ui from 2.18.1 to 2.19.0
875ae56 Merge pull request #196 from cacack/dependabot/npm_and_yarn/globals-17.12.0
fea72f4 chore(deps-dev): bump globals from 17.11.0 to 17.12.0
ec162b2 Merge pull request #197 from cacack/dependabot/npm_and_yarn/svelte-eslint-parser-1.8.1
3d6aecc chore(deps-dev): bump svelte-eslint-parser from 1.8.0 to 1.8.1
e8ba50e Merge pull request #202 from cacack/dependabot/npm_and_yarn/multi-d0c2d048a7
b4144bf fix(deps): bump @vitest/mocker and vitest
95718d5 Merge pull request #195 from cacack/dependabot/github_actions/actions/deploy-pages-5.0.1
42a4a62 ci: bump actions/deploy-pages from 5.0.0 to 5.0.1
4c77fd6 Merge pull request #178 from cacack/release-please--branches--main--components--waterforge
a877409 chore(main): release 1.9.2
5f2321d Merge pull request #194 from cacack/fix/site-health-runner-issues
48d53b6 fix(ci): make site-health actually able to alert
33d9c03 Merge pull request #192 from cacack/feat/site-health-monitor
8b8e105 docs(operations): correct the bad_authz guidance -- retry, do not escalate
06b8cab docs(operations): prove the cert record is domain-scoped, not site-scoped

```

### Releases/tags (last 10)
```

v1.9.3
v1.9.2
v1.9.1
v1.9.0
v1.8.0
v1.7.0
v1.6.0
v1.5.0
v1.4.0
v1.3.0

```

## Other top-level docs
- SECURITY.md: absent
- CONTRIBUTING.md: present (222 lines)
- CODE_OF_CONDUCT.md: absent
- CHANGELOG.md: present (213 lines)
- ROADMAP.md: present (55 lines)
- CLAUDE.md: present (41 lines)
- USAGE.md: present (165 lines)
- LICENSE: present (675 lines)
- LICENSE-DATA: present (44 lines)

### docs/ tree
```

docs/architecture/overview.md
docs/decisions/0001-license-split.md
docs/decisions/0002-scope.md
docs/decisions/0003-nnls-engine.md
docs/decisions/0004-solubility-fidelity.md
docs/decisions/0005-single-clamp-solve.md
docs/decisions/0006-static-svelte-vite-pages.md
docs/decisions/0007-solver-correctness-invariant.md
docs/decisions/0008-shadcn-svelte-ui.md
docs/decisions/0009-recipe-selection-policy.md
docs/decisions/0010-release-please.md
docs/decisions/0011-library-beyond-khymos-seed.md
docs/decisions/0012-profile-data-independently-sourced.md
docs/decisions/0013-still-sparkling-and-carbonation-target.md
docs/decisions/0014-profile-metadata-fields.md
docs/guides/chemistry.md
docs/guides/reference-data.md
docs/hero.png
docs/operations/ci-cd.md
docs/operations/cloudflare-pages.md
docs/operations/release.md

```

### .github tree
```

.github/dependabot.yml
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/config.yml
.github/ISSUE_TEMPLATE/profile_request.md
.github/ISSUE_TEMPLATE/question.md
.github/workflows/ci.yml
.github/workflows/dependabot-automerge.yml
.github/workflows/deploy.yml
.github/workflows/release-please.yml
.github/workflows/site-health.yml

```

## ROADMAP.md (full)
# Roadmap

A lightweight statement of where Waterforge is headed. For the _why_ behind the
project, see [CONSTITUTION.md](CONSTITUTION.md); for what shipped, see
[CHANGELOG.md](CHANGELOG.md).

## Status

**Waterforge is feature-complete against its [mission](CONSTITUTION.md).** As of
v1.5.0 the build-out criteria are met: an exact (golden-test-verified) solver,
the unbroken target → recipe flow with readouts and saturation warnings, a
browsable sourced library (54 profiles across 14 countries — bottled, brewing,
coffee, and synthetic references), and the live app at
[waterforge.app](https://waterforge.app) (installable + offline).

The project is now in **sustained maintenance**, which the constitution's fifth
success criterion names explicitly: keep the site up, keep dependencies current,
and clear security advisories promptly.

There is no fixed release schedule. Work happens opportunistically, one PR at a
time, and versions are cut automatically by release-please from the commit log.

## Active direction

- **Grow the water library.** The expand-beyond-the-Khymos-seed push
  ([#98](https://github.com/cacack/waterforge/issues/98)) is closed, but the
  effort is open-ended by nature: add notable bottled and reference waters that
  fill geographic and chemistry gaps, each held to the authoritative-sourcing
  standard in [ADR 0011](docs/decisions). Requests are welcome via the
  [profile-request issue template](.github/ISSUE_TEMPLATE/profile_request.md)
  and are tracked one issue per water.
- **Keep it healthy.** Dependency currency, advisory response, and uptime — the
  daily site-health check and CI-on-main runs exist for this. See
  [docs/operations/](docs/operations/).

## Deferred — revisit when the trigger fires

These are closed as **not planned** rather than left open, so the backlog stays
honest. Each would be reopened only if its trigger condition appears; until then
they stay out of scope.

| Issue                                                 | Idea                                | Re-evaluation trigger                                                    |
| ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| [#27](https://github.com/cacack/waterforge/issues/27) | Teaspoon / volume salt-measure mode | Enough demand from users without a precise scale                         |
| [#28](https://github.com/cacack/waterforge/issues/28) | Coupled-Ksp solubility fidelity     | A real need for coupled-solubility accuracy (likely needs a WASM solver) |
| [#13](https://github.com/cacack/waterforge/issues/13) | Dev-only SciPy validation oracle    | The golden tests stop being sufficient confidence                        |

Done since the last refresh: [#30](https://github.com/cacack/waterforge/issues/30)
— the `matrix` dependency is vendored away and gone from `package.json`.

## Not planned

See the [non-goals](CONSTITUTION.md#non-goals): no mash-pH or residual-alkalinity
modeling, no general brewing-salts-for-style tool, no flavor prediction, and no
backend (the app stays static and client-side).
```
