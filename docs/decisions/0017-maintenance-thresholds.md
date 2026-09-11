# ADR 0017 — Success criterion 5 carries thresholds, set just beyond current practice

**Status:** Accepted
**Date:** 2026-09-11
**Amends:** [CONSTITUTION.md](../../CONSTITUTION.md) (success criterion 5). The
same decision's other half demotes "grow the water library" in
[ROADMAP.md](../../ROADMAP.md) from an active direction to opportunistic.

## Context

The 2026-09-11 product panel found that success criteria 1–4 are concrete,
checkable, and were **met by construction before the maintenance phase began**.
Criterion 5 was added the same day to govern that phase, and said the site is up,
dependencies stay current, and advisories are cleared "promptly" — three
adjectives and no number.

That makes it the only criterion governing the phase the project is actually in,
and the only one that cannot be failed. A rubric that can only be passed is worse
than no rubric: it consumes the review slot and returns false comfort.

[ADR 0016](0016-built-for-its-maintainer.md) settled what the bar is _for_. Under
**Principle 6** (_real use over assumed demand_), these thresholds are not a
service level offered to users. They exist because the app must be installable
and correct whenever its maintainer reaches for it, and because a static PWA with
stale dependencies decays to broken. The artifact is worth not losing (ADR 0016
decision 3); these numbers are what "not losing it" means in practice.

### Measured baselines, 2026-09-11

Recorded here because a threshold with no provenance is the same unfalsifiable
assertion in miniature. A future reader must be able to tell whether these
numbers were chosen or guessed.

**Dependabot advisories — 20 alerts to date, all resolved, none open:**

| Days to resolve |   0 |   1 |   5 |  10 |  12 |  25 |
| --------------- | --: | --: | --: | --: | --: | --: |
| Count           |  13 |   2 |   1 |   1 |   2 |   1 |

Median 0 days, mean 3.3. Sixteen of the twenty were **high** severity, and **four
of those sixteen took longer than 7 days** (5, 10, 12, 25). One was `low`, three
`medium`.

**Dependabot PRs — twenty most recent merged:** sixteen merged same-day, four took
20 days. None open today.

**Site health — six runs, 2026-09-07 to 2026-09-11:** the single `failure` was the
first-ever run, a `workflow_dispatch` fired while the workflow was being built.
**All four scheduled runs passed.** Four data points is not yet a measurement,
which is itself part of why the metric below is defined the way it is.

## Decision

1. **Advisories: no high- or critical-severity advisory open more than 7 days.**
   Medium and low are deliberately unbounded — they are a taste judgment, not a
   safety property, and bounding them would add a number nobody would enforce.

   ```bash
   gh api repos/cacack/waterforge/dependabot/alerts --paginate \
     --jq '.[] | select(.state=="open")
           | select(.security_advisory.severity=="high" or .security_advisory.severity=="critical")
           | {n:.number, sev:.security_advisory.severity, days:((now-(.created_at|fromdate))/86400|floor)}'
   ```

2. **Dependency currency: no Dependabot PR open more than 14 days.**

   ```bash
   gh pr list --state open --author "app/dependabot" --json number,createdAt \
     --jq '.[] | {n:.number, days:((now-(.createdAt|fromdate))/86400|floor)}'
   ```

3. **Site health: the scheduled check green on ≥99% of runs over a rolling 90
   days.** Scheduled runs only — a `workflow_dispatch` is a test, and counting the
   one manual test run already on record would score the project at 83% for a
   thing that never went wrong.

   ```bash
   gh run list --workflow=site-health.yml --limit 100 --json conclusion,event \
     --jq '[.[]|select(.event=="schedule")] | {runs:length, green:([.[]|select(.conclusion=="success")]|length)}'
   ```

   99% is tight on purpose. `site-health.yml` already downgrades its known flaky
   paths — a Cloudflare 403 to a GitHub runner's datacenter IP, an unreadable
   Pages API — to warnings rather than failures. A _hard_ failure is therefore a
   real signal, and roughly one per quarter is the most that should pass without
   comment.

4. **The bars are set just beyond current practice, and that is the point.** Each
   one would have been breached by the recorded history: four high-severity
   advisories exceeded 7 days, four Dependabot PRs exceeded 14. A threshold the
   project already clears certifies the status quo — it is the unfalsifiable
   criterion with a number painted on it. These are achievable with intent and
   not automatic, which is the only setting at which a criterion does work.

5. **Scoring is manual and query-based, not automated.** This ADR sets numbers; it
   builds no mechanism.
   [#209](https://github.com/cacack/waterforge/issues/209) remains the issue for
   alerting on an unactioned advisory. The three queries above are the contract:
   they were each run and confirmed to return the shape shown before this ADR was
   accepted.

6. **"Grow the water library" is demoted to opportunistic.** It was the roadmap's
   single named active direction with no commit since 2026-06-01 and no issue
   behind it. Under Principle 6 a standing backlog is owed to nobody, so the
   honest state is opportunistic: profiles get added when the maintainer wants
   one. Requests via the profile-request template stay welcome — welcoming a
   request costs nothing and commits to nothing.

## Consequences

- **The next panel scores rather than accepts.** Criterion 5 becomes the first
  one that can return a red, and the baselines above are what "improved" or
  "regressed" will be measured against.
- **The 90-day window is not yet meaningful.** Scheduled runs began 2026-09-07, so
  the first full-quarter reading lands in December 2026. Until then the site-health
  bar is stated but unscoreable, and should be reported as such rather than as a
  pass.
- **A breach is expected eventually, and is not a failure of this ADR.** Four of
  the last sixteen high-severity advisories would have breached the 7-day bar. If
  a number proves punitive in practice, amend it here with the new baseline
  recorded — the way [ADR 0015](0015-carbonation-target-sourcing-bar.md) amended
  [ADR 0013](0013-still-sparkling-and-carbonation-target.md) — rather than quietly
  ignoring it.
- **"Grow the library" can no longer be cited as evidence of activity.** The
  roadmap's active-direction list is now a single item, which is an accurate
  description of the commit log rather than an aspiration.
- **Nothing in the app or the workflows changes.** `site-health.yml`,
  `dependabot.yml`, and CI are untouched. Only the standard they are measured
  against is now written down.
