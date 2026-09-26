# Project Snapshot — 2026-09-26

## Repo metadata

- Root: <repo root>
- Branch: main (review branch: docs/panel-engineering-2026-09-26)
- HEAD: 741fedc
- Origin: git@github.com:cacack/waterforge.git
- Generated: 2026-09-26T13:56:56Z

## Top-level tree (depth 3)

```
.
./assets
./assets/icon.svg
./CHANGELOG.md
./CLAUDE.md
./components.json
./CONSTITUTION.md
./CONTRIBUTING.md
./docs
./docs/architecture
./docs/architecture/overview.md
./docs/decisions
./docs/decisions/0001-license-split.md
./docs/decisions/0002-scope.md
./docs/decisions/0003-nnls-engine.md
./docs/decisions/0004-solubility-fidelity.md
./docs/decisions/0005-single-clamp-solve.md
./docs/decisions/0006-static-svelte-vite-pages.md
./docs/decisions/0007-solver-correctness-invariant.md
./docs/decisions/0008-shadcn-svelte-ui.md
./docs/decisions/0009-recipe-selection-policy.md
./docs/decisions/0010-release-please.md
./docs/decisions/0011-library-beyond-khymos-seed.md
./docs/decisions/0012-profile-data-independently-sourced.md
./docs/decisions/0013-still-sparkling-and-carbonation-target.md
./docs/decisions/0014-profile-metadata-fields.md
./docs/decisions/0015-carbonation-target-sourcing-bar.md
./docs/decisions/0016-built-for-its-maintainer.md
./docs/decisions/0017-maintenance-thresholds.md
./docs/decisions/0018-client-side-analytics-scope.md
./docs/decisions/0019-bot-fight-mode-off.md
./docs/decisions/0020-usage-guide-rendered-into-the-app.md
./docs/guides
./docs/guides/chemistry.md
./docs/guides/reference-data.md
./docs/hero.png
./docs/operations
./docs/operations/ci-cd.md
./docs/operations/cloudflare-pages.md
./docs/operations/continuity.md
./docs/operations/release.md
./docs/operations/traffic-baseline.md
./docs/reviews
./docs/reviews/constitution
./docs/reviews/panel-engineering
./docs/reviews/panel-product
./eslint.config.js
./index.html
./LICENSE
./LICENSE-DATA
./node_modules
./package-lock.json
./package.json
./public
./public/apple-touch-icon-180x180.png
./public/CNAME
./public/favicon.ico
./public/favicon.svg
./public/maskable-icon-512x512.png
./public/pwa-192x192.png
./public/pwa-512x512.png
./public/pwa-64x64.png
./qa
./qa/320-overflow.png
./qa/desktop-dark-before.png
./qa/desktop-light-after.png
./qa/desktop-light-before.png
./qa/desktop-short-scrolled.png
./qa/mobile-dark-after.png
./qa/mobile-narrow-after.png
./qa/mobile-narrow-before.png
./README.md
./release-please-config.json
./ROADMAP.md
./scripts
./scripts/check-shadcn-data-attrs.mjs
./scripts/generate-icons.sh
./scripts/usage-guide.d.mts
./scripts/usage-guide.mjs
./SECURITY.md
./src
./src/actions.test.ts
./src/app-boot.test.ts
./src/app.css
./src/App.svelte
./src/carbonation-readout.test.ts
./src/components
./src/components/Actions.svelte
./src/components/BatchSection.svelte
./src/components/CarbonationReadout.svelte
./src/components/CarbonationSection.svelte
./src/components/Footer.svelte
./src/components/Header.svelte
./src/components/HelpDialog.svelte
./src/components/icons
./src/components/ReadoutsPanel.svelte
./src/components/RecipePanel.svelte
./src/components/SaltsSection.svelte
./src/components/SectionCard.svelte
./src/components/SourceSection.svelte
./src/components/TargetSection.svelte
./src/help.svelte.ts
./src/lib
./src/lib/chem
./src/lib/components
./src/lib/index.test.ts
./src/lib/index.ts
./src/lib/profiles
./src/lib/solver
./src/lib/utils.ts
./src/main.ts
./src/persist.svelte.ts
./src/persist.test.ts
./src/share.test.ts
./src/share.ts
./src/state.svelte.ts
./src/theme.svelte.ts
./src/usage-guide.test.ts
./src/vite-env.d.ts
./svelte.config.js
./tsconfig.app.json
./tsconfig.json
./tsconfig.node.json
./USAGE.md
./vite.config.ts
```

Hidden config dirs:

```
.claude
.claude/settings.local.json
.claude/worktrees
.github
.github/dependabot.yml
.github/ISSUE_TEMPLATE
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/config.yml
.github/ISSUE_TEMPLATE/profile_request.md
.github/ISSUE_TEMPLATE/question.md
.github/workflows
.github/workflows/archive.yml
.github/workflows/ci.yml
.github/workflows/dependabot-automerge.yml
.github/workflows/dependabot-retitle.yml
.github/workflows/dependabot-watch.yml
.github/workflows/deploy.yml
.github/workflows/release-please.yml
.github/workflows/site-health.yml
```

## Resource counts

- `src/components/` — 14 entries
- `src/lib/` — 7 entries
- `src/lib/solver/` — 12 entries
- `src/lib/components/` — 1 entries
- `src/lib/chem/` — 7 entries
- `src/lib/profiles/` — 9 entries

## Language footprint

| ext    | files |
| ------ | ----- |
| svelte | 72    |
| ts     | 56    |
| md     | 49    |
| json   | 11    |
| yml    | 10    |
| png    | 6     |
| svg    | 2     |
| mjs    | 2     |
| js     | 2     |
| sh     | 1     |

## README excerpt

````
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

**What you need:** distilled (or known-source) water, food-grade salts, and a
scale that reads to **0.01 g** — the resolution sold as a pocket or jeweller's
scale. A 1 g kitchen scale cannot resolve these doses and would read most of a
recipe as zero. Larger batches lift small doses into range; see
[Weighing the salts](USAGE.md#weighing-the-salts).

## Quickstart

Requirements: **Node 26**, pinned in [`.nvmrc`](.nvmrc) — run `nvm use` in the
clone to select it (check with `node -v`).

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

## Fork and self-host

Waterforge is GPLv3 and needs no backend, so you can run your own copy — and
nothing about this project has to keep working for yours to. Clone it, then:

```bash
npm ci
npm run build        # static output in dist/
```

Serve `dist/` from anything that serves files: any static host, an object-storage
bucket, `npx serve dist`, a directory on your own machine. The build uses a
**relative base path**, so it works from a subpath (`example.com/water/`) as
readily as from a domain root, with no configuration.

The water profiles are a single file —
[`src/lib/profiles/profiles.json`](src/lib/profiles/profiles.json) — under
[CC-BY-SA-4.0](LICENSE-DATA), with each profile carrying its own source citation.
Take the data on its own if the app is not what you want.

What happens to this project if its maintainer stops is written down in
[docs/operations/continuity.md](docs/operations/continuity.md).

## Documentation

| Document                                                                   | What it covers                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------ |
| [CONSTITUTION.md](CONSTITUTION.md)                                         | Mission, audience, principles, non-goals               |
| [USAGE.md](USAGE.md)                                                       | How to use the app (intended user flow)                |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                         | Dev setup, conventions, testing, license terms         |
| [SECURITY.md](SECURITY.md)                                                 | Reporting a vulnerability; supported versions          |
| [ROADMAP.md](ROADMAP.md)                                                   | Where the project is headed                            |
| [docs/architecture/overview.md](docs/architecture/overview.md)             | Stack, module boundaries, data flow                    |
| [docs/decisions/](docs/decisions/)                                         | Architecture Decision Records                          |
| [docs/guides/chemistry.md](docs/guides/chemistry.md)                       | Chemistry background and unit conversions              |
| [docs/guides/reference-data.md](docs/guides/reference-data.md)             | Reference data and profile sources                     |
| [docs/operations/ci-cd.md](docs/operations/ci-cd.md)                       | CI/CD pipeline and deployment                          |
| [docs/operations/release.md](docs/operations/release.md)                   | Release runbook (cut, tag, publish)                    |
| [docs/operations/continuity.md](docs/operations/continuity.md)             | What must survive; forking if the project stops        |
| [docs/operations/traffic-baseline.md](docs/operations/traffic-baseline.md) | What the site actually receives, and how to re-measure |

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
````

## CONSTITUTION.md

```
# Constitution

> The mission, posture, principles, and non-goals of Waterforge. When in conflict
> with this document, future decisions should align here or explicitly update it
> — see [How intent is recorded](#how-intent-is-recorded).

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

**Built for:** its maintainer, first. Waterforge exists because he wanted it and
he uses it. That is the whole reason it is maintained, and it is enough.

**Aimed at:** homebrewers and water hobbyists who want to match a specific
drinking-water profile from a clean baseline using food-grade salts, and who care
about getting the numbers right. This describes the aim, not a measured
population — anyone who finds the app useful is welcome to it.

**This is not for:** brewers looking for mash-pH or residual-alkalinity tooling —
Waterforge models the water itself, not what happens when grain hits it (reach
for Bru'n Water / EZ Water Calculator there).

## Posture

What kind of project this is, in four layers. Which layer is load-bearing
matters more than the labels:

1. **Why it exists and is maintained** — it was built for its maintainer, who
   actively uses it. This is the load-bearing justification, and it needs no
   audience to hold. Maintenance is not a service owed to anyone.
2. **The standard of care** — it is nonetheless finished to the standard its
   maintainer would have wanted had he stumbled on it: sourced, licensed,
   documented, precise. That standard is freely chosen, not a debt owed.
3. **The backstop** — should that use end, the sourced profile compilation and a
   correct solver are still worth preserving on their own: copyleft, forkable,
   archived. Insurance on an artifact, not service to a population.
4. **Aspiration, not commitment** — if users arrive, good. Serving a user base
   would be a new decision, recorded here when it is made; it is not assumed
   today, and no work is owed to a hypothetical audience.

See [ADR 0016](docs/decisions/0016-built-for-its-maintainer.md) for the
alternatives weighed and why they were rejected.

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
   browser. No servers, no accounts, and no tracking of the people who use it:
   cheaper to host, private by default, durable — and installable, so it keeps
   working offline at the counter. Anonymous, aggregate page counts at the CDN
   are permitted and in use; the bar is that no individual can be singled out or
   re-identified, and nothing about it ships in the bundle
   ([ADR 0018](docs/decisions/0018-client-side-analytics-scope.md)).
6. **Real use over assumed demand** — effort is justified by the maintainer's own
   use of the app, by correctness under Principle 3, or by the durability of the
   artifact. Never by an assumed audience. "Users might want this" is not a
   reason; "this would mislead or annoy me at the counter" is.

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
- Once feature-complete, it stays that way — a released version is always
  installable and correct. This is the only criterion governing the phase the
  project is actually in, so it carries thresholds rather than adjectives:
  - **Advisories:** no high- or critical-severity advisory open more than
    **7 days**.
  - **Dependency currency:** no Dependabot PR open more than **14 days**.
  - **Site health:** the scheduled site-health check green on **≥99%** of runs
    over a rolling 90 days. Scheduled runs only — manual dispatches are tests,
    not signal. The window first covers a full quarter in December 2026, since
    scheduled runs began 2026-09-07.

  These exist because the app must be installable and correct whenever its
  maintainer reaches for it, and because a static PWA with stale dependencies
  decays to broken. They are not a service level offered to users (Principle 6).
  Baselines, measurement queries, and why each number sits just beyond current
  practice: [ADR 0017](docs/decisions/0017-maintenance-thresholds.md).

## How intent is recorded

Project intent lives in a hierarchy. When two documents disagree, the one higher
in this list wins, and the lower one is brought into line:

1. **This constitution** — mission, values, posture, guiding principles. The
   ethos. Changes here are deliberate and rare.
2. **Decisions ([ADRs](docs/decisions/))** — the decisions made along the way
   that carry the constitution out, each with its context, alternatives, and
   consequences. An ADR is superseded by a later ADR, never silently overridden
   (see [CONTRIBUTING.md](CONTRIBUTING.md)).
3. **[Architecture](docs/architecture/) and code** — the implementation of those
   decisions.
4. **Issues and [roadmap](ROADMAP.md)** — planning. They record what is being
   worked on and when, not what the project is for. Neither may quietly redefine
   anything above it.

---

_Last refreshed: 2026-09-11_
```

## Other top-level docs

- SECURITY.md: present
- CONTRIBUTING.md: present
- CODE_OF_CONDUCT.md: absent
- CHANGELOG.md: present
- CLAUDE.md: present

## Build/CI/config files (top level)

- .nvmrc
- components.json
- eslint.config.js
- package-lock.json
- package.json
- release-please-config.json
- svelte.config.js
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts
- .github/workflows/archive.yml
- .github/workflows/ci.yml
- .github/workflows/dependabot-automerge.yml
- .github/workflows/dependabot-retitle.yml
- .github/workflows/dependabot-watch.yml
- .github/workflows/deploy.yml
- .github/workflows/release-please.yml
- .github/workflows/site-health.yml

## Recent activity (last 6 months)

- Commits: 402
- Last 20 commit subjects:

```
741fedc Merge pull request #261 from cacack/dependabot/npm_and_yarn/eslint-10.11.0
3fceb5b chore(deps-dev): bump eslint from 10.10.0 to 10.11.0
0c3b7e3 Merge pull request #262 from cacack/dependabot/npm_and_yarn/typescript-eslint-8.70.1
7532285 chore(deps-dev): bump typescript-eslint from 8.70.0 to 8.70.1
5b4dda7 Merge pull request #260 from cacack/dependabot/npm_and_yarn/sveltejs/vite-plugin-svelte-7.3.1
4ba6ff2 fix(deps): bump @sveltejs/vite-plugin-svelte from 7.3.0 to 7.3.1
ee05323 Merge pull request #259 from cacack/dependabot/npm_and_yarn/marked-18.0.14
c7c7ff4 chore(deps-dev): bump marked from 18.0.13 to 18.0.14
489e39d Merge pull request #255 from cacack/release-please--branches--main--components--waterforge
95a1760 chore(main): release 1.10.1
27436a5 Merge pull request #258 from cacack/dependabot/npm_and_yarn/bits-ui-2.19.3
5248d2b fix(deps): bump bits-ui from 2.19.2 to 2.19.3
92fc3ca Merge pull request #257 from cacack/dependabot/npm_and_yarn/vitest-5.0.1
8c5fab8 chore(deps-dev): bump vitest from 5.0.0 to 5.0.1
cbd31ba Merge pull request #256 from cacack/chore/node-26
f05ba2b docs: allow adopting an even Node major before its LTS promotion
68a13d4 chore: move to Node 26
c0fb76c Merge pull request #247 from cacack/dependabot/github_actions/cacack/workflows/dot-github/workflows/dependabot-watch.yml-2.3.0
bbed47a ci: bump cacack/workflows/.github/workflows/dependabot-watch.yml
ae7999c Merge pull request #251 from cacack/dependabot/npm_and_yarn/devalue-5.9.2
```

## Repository label vocabulary

bug, documentation, duplicate, enhancement, help wanted, good first issue, invalid, question, wontfix, effort:low, effort:high, effort:medium, value:low, value:medium, type:feat, value:high, type:bug, type:chore, deferred, type:docs, area:engine, good-first-issue, area:data, area:ui, area:docs, area:infra, autorelease: pending, autorelease: tagged, dependencies, javascript, priority:high, priority:low, priority:medium, github_actions

## Open issues and milestones

<untrusted-issue-data>
(no open issues; all milestones closed)
</untrusted-issue-data>
