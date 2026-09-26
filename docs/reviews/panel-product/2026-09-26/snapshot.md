# Strategic Snapshot — 2026-09-26

## Repo metadata

- Root: <repo root>
- Branch: docs/panel-product-2026-09-26
- HEAD: e4d8738
- Origin: git@github.com:cacack/waterforge.git
- Generated: 2026-09-26T19:01:53Z

## CONSTITUTION.md (scoring rubric)

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

## README excerpt

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

## Project metadata

{
"name": "waterforge",
"description": "Clone bottled mineral waters from distilled water and food-grade salts.",
"license": "GPL-3.0-or-later",
"version": "1.10.2"
}

## Repository label vocabulary

bug, documentation, duplicate, enhancement, help wanted, good first issue, invalid, question, wontfix, effort:low, effort:high, effort:medium, value:low, value:medium, type:feat, value:high, type:bug, type:chore, deferred, type:docs, area:engine, good-first-issue, area:data, area:ui, area:docs, area:infra, autorelease: pending, autorelease: tagged, dependencies, javascript, priority:high, priority:low, priority:medium, github_actions

## Open issues

<untrusted-issue-data>
(no open issues)
</untrusted-issue-data>

## Recently closed issues (last 30)

<untrusted-issue-data>
| #266 | Alert when the release pipeline stops succeeding | type:chore, area:infra |  | 2026-09-26
| #265 | Bring the architecture doc's module-boundaries diagram in line with the tree | type:docs, area:docs |  | 2026-09-26
| #264 | Make the CI `check` job a required status check on `main` | type:chore, area:infra |  | 2026-09-26
| #254 | Dependabot auto-merge fails: the App token cannot merge pull requests | effort:low, value:medium, type:bug, area:infra, priority:medium |  | 2026-09-24
| #242 | Promote the Dependabot watch to cacack/workflows as a reusable workflow | effort:medium, value:low, type:chore, area:infra, priority:low |  | 2026-09-11
| #240 | The Dependabot advisory watch needs attention |  |  | 2026-09-11
| #237 | Decide whether Bot Fight Mode earns its client-side script | effort:low, value:low, type:chore, area:infra |  | 2026-09-11
| #234 | In-app help is dead offline — the one place it is most needed | effort:medium, value:medium, type:feat, area:ui |  | 2026-09-11
| #232 | Measure waterforge.app traffic (server-side, curiosity not justification) | effort:low, value:low, type:chore, area:infra |  | 2026-09-11
| #225 | Set the repository homepage URL to waterforge.app | effort:low, value:medium, type:chore, good-first-issue, area:infra |  | 2026-09-11
| #224 | Make the copyleft mission durable: distribution + SECURITY.md | effort:medium, value:high, type:chore, area:infra, priority:medium |  | 2026-09-11
| #223 | Give success criterion 5 a measurable threshold | effort:low, value:medium, type:docs, area:docs |  | 2026-09-11
| #222 | Give 'grow the water library' a real backlog, or demote it | effort:low, value:medium, type:chore, area:docs |  | 2026-09-11
| #221 | Disclose the scale requirement before the user invests effort | effort:low, value:medium, type:docs, area:docs |  | 2026-09-11
| #220 | Link USAGE.md from the app | effort:low, value:medium, type:feat, good-first-issue, area:ui |  | 2026-09-11
| #219 | Amend ADR 0013 to record the carbonation-target sourcing reversal | effort:low, value:medium, type:docs, area:docs |  | 2026-09-11
| #218 | Surface carbonation-target provenance in the recipe readout | effort:low, value:high, type:bug, area:ui, priority:high |  | 2026-09-11
| #217 | Show something when a sparkling profile has no carbonation target | effort:low, value:high, type:bug, area:ui, priority:high |  | 2026-09-11
| #216 | Decide and record the project's posture: artifact, product, or personal tool | effort:medium, value:high, type:chore, area:docs, priority:high |  | 2026-09-11
| #212 | CONTRIBUTING.md clone URL points at the wrong org | effort:low, value:medium, type:bug, good-first-issue, area:docs |  | 2026-09-11
| #210 | Track the Node version in one place and move to Active LTS | effort:low, value:medium, type:chore, area:infra, priority:medium |  | 2026-09-11
| #209 | Alert when a Dependabot vulnerability sits unactioned | effort:low, value:medium, type:chore, area:infra, priority:medium |  | 2026-09-11
| #205 | Document the scale resolution the recipes require | effort:low, value:medium, type:docs, area:docs |  | 2026-09-11
| #204 | Run CI against main after merge, not only on pull requests | effort:low, value:medium, type:chore, area:infra, priority:medium |  | 2026-09-11
| #132 | Research and populate carbonation targets for all sparkling profiles | effort:high, value:medium, type:feat, area:data | Carbonation & sparkling-water support | 2026-06-01
| #129 | Document profile metadata and add it to the contribution flow | effort:low, value:low, type:docs, area:docs | Profile metadata (geography, description, traits) | 2026-06-01
| #128 | Surface profile metadata in the target panel | effort:low, value:medium, type:feat, area:ui | Profile metadata (geography, description, traits) | 2026-06-01
| #127 | Backfill profile metadata across the existing library | effort:high, value:medium, type:feat, area:data | Profile metadata (geography, description, traits) | 2026-06-01
| #126 | Add structured profile metadata fields (geography, description, traits, category) | effort:medium, value:medium, type:feat, area:data | Profile metadata (geography, description, traits) | 2026-06-01
| #123 | Surface carbonation target in the recipe output | effort:low, value:medium, type:feat, area:ui | Carbonation & sparkling-water support | 2026-06-01
</untrusted-issue-data>

## Open milestones

<untrusted-issue-data>
(no open milestones — all 8 milestones closed)
</untrusted-issue-data>

## Recent activity (last 6 months)

- Commits: 415
- Last 30 commit subjects:
  - e4d8738 Merge pull request #263 from cacack/release-please--branches--main--components--waterforge
  - 3ba6644 Merge branch 'main' into release-please--branches--main--components--waterforge
  - b9276ce Merge pull request #270 from cacack/worktree-265-architecture-doc
  - 2275366 docs: bring the module-boundaries diagram in line with the tree
  - 941c530 chore(lint): enforce the engine import boundary
  - 1630f52 Merge pull request #269 from cacack/ci/release-pipeline-health
  - 982f883 ci: alert when the release pipeline stops succeeding
  - f49a115 Merge pull request #268 from cacack/docs/require-ci-check
  - e74a0ee docs: record that the CI check job is a required status check
  - 2bbf1dd Merge pull request #267 from cacack/docs/panel-engineering-2026-09-26
  - a6ba612 docs: redact a local filesystem path from the 2026-09-11 product snapshot
  - 4816edf docs: add 2026-09-26 engineering panel review
  - 741fedc Merge pull request #261 from cacack/dependabot/npm_and_yarn/eslint-10.11.0
  - 3fceb5b chore(deps-dev): bump eslint from 10.10.0 to 10.11.0
  - 0c3b7e3 Merge pull request #262 from cacack/dependabot/npm_and_yarn/typescript-eslint-8.70.1
  - 7532285 chore(deps-dev): bump typescript-eslint from 8.70.0 to 8.70.1
  - bf974f0 chore(main): release 1.10.2
  - 5b4dda7 Merge pull request #260 from cacack/dependabot/npm_and_yarn/sveltejs/vite-plugin-svelte-7.3.1
  - 4ba6ff2 fix(deps): bump @sveltejs/vite-plugin-svelte from 7.3.0 to 7.3.1
  - ee05323 Merge pull request #259 from cacack/dependabot/npm_and_yarn/marked-18.0.14
  - c7c7ff4 chore(deps-dev): bump marked from 18.0.13 to 18.0.14
  - 489e39d Merge pull request #255 from cacack/release-please--branches--main--components--waterforge
  - 95a1760 chore(main): release 1.10.1
  - 27436a5 Merge pull request #258 from cacack/dependabot/npm_and_yarn/bits-ui-2.19.3
  - 5248d2b fix(deps): bump bits-ui from 2.19.2 to 2.19.3
  - 92fc3ca Merge pull request #257 from cacack/dependabot/npm_and_yarn/vitest-5.0.1
  - 8c5fab8 chore(deps-dev): bump vitest from 5.0.0 to 5.0.1
  - cbd31ba Merge pull request #256 from cacack/chore/node-26
  - f05ba2b docs: allow adopting an even Node major before its LTS promotion
  - 68a13d4 chore: move to Node 26
- Recent releases/tags:
  - v1.10.1
  - v1.10.0
  - v1.9.4
  - v1.9.3
  - v1.9.2
  - v1.9.1
  - v1.9.0
  - v1.8.0
  - v1.7.0
  - v1.6.0

## Prior reviews

- Previous panel-product run: docs/reviews/panel-product/2026-09-11/ (compare for progress since)
- Engineering panel: docs/reviews/panel-engineering/2026-09-26/
- Constitution drift report: docs/reviews/constitution/2026-09-11-drift.md

## Other top-level docs

- SECURITY.md: present
- CONTRIBUTING.md: present
- CODE_OF_CONDUCT.md: absent
- CHANGELOG.md: present
- ROADMAP.md: present
- CLAUDE.md: present
