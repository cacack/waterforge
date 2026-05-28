# ADR 0010 — Adopt release-please and gate deploys on releases

**Status:** Accepted
**Date:** 2026-05-28

## Context

Today, `deploy.yml` fires on every push to `main`, so every merge ships to
GitHub Pages. In parallel, we also cut tagged GitHub releases (`v1.0`, `v1.0.1`)
by hand. The two paths are inconsistent: a "release" carries no special meaning
because the code on Pages is already whatever last landed on `main`, and the
version tags are effectively decorative — they do not gate anything, do not
correspond to a CHANGELOG, and are not produced by tooling.

This matters for three reasons:

1. **No rollback target.** Reverting a bad deploy means reverting the commit
   and waiting for the next push to redeploy — there is no "redeploy the last
   known-good release" button.
2. **No announcement surface.** Without a real release event there is nowhere
   to attach release notes, no CHANGELOG, and no way for a downstream consumer
   to subscribe to "new versions" rather than "every commit."
3. **Semver is undefended.** Version numbers are bumped by hand and conventional
   commits (the project standard, per `CLAUDE.md`) are not converted into
   anything machine-checkable.

Two options were considered (per issue #72):

- **Option A — drop releases entirely.** Stop cutting tags, treat `main` as the
  only source of truth, and lean fully into continuous deployment. Rejected:
  this removes the rollback target, removes the announcement surface, and
  leaves the existing `v1.0` / `v1.0.1` tags as orphans with no successor
  policy. The whole point of conventional commits is to feed _something_ — if
  we are not going to feed a release tool, we should not be paying the
  discipline cost.
- **Option B — adopt release-please and gate deploys on releases.** Let
  `googleapis/release-please-action` watch `main`, accumulate conventional
  commits into an always-open "release PR" that bumps `package.json`, updates
  `CHANGELOG.md`, tags the merge commit, and publishes a GitHub release.
  `deploy.yml` then triggers on `release: published` instead of `push: main`.
  Chosen.

## Decision

Adopt `googleapis/release-please-action@v4` in **manifest mode** and re-wire
the deploy pipeline around release events:

1. **release-please owns versioning.** A new workflow,
   `.github/workflows/release-please.yml`, runs on every push to `main`. It
   reads `release-please-config.json` (manifest mode, one package at `.`,
   `release-type: node`, tags shaped `vX.Y.Z`) and `.release-please-manifest.json`
   (seeded at `1.0.1` so it picks up _new_ commits, not the project's whole
   history). The action keeps a release PR open, updating it on every push;
   merging that PR cuts the tag and publishes the GitHub release.
2. **Deploy triggers on release.** `deploy.yml` will be changed from
   `push: main` to `release: { types: [published] }` by a sibling change.
   `workflow_dispatch` stays so we can re-deploy or roll back manually.
3. **Manifest mode now, multi-package later.** We only have one package today,
   but manifest mode is the supported path for adding more (e.g. splitting the
   chem engine out as a library) without re-configuring release-please.
4. **Existing tags are preserved.** `v1.0` and `v1.0.1` stay; the seeded
   manifest tells release-please the last released version is `1.0.1`, so its
   first proposal will be `1.0.2` or higher depending on the commits between
   `v1.0.1` and the merge that lands this ADR.

The action is pinned to the `@v4` major tag (rather than a SHA) so we pick up
security fixes within the major but do not silently inherit breaking changes.

## Consequences

- **Pros**
  - Real, generated `CHANGELOG.md` driven by conventional commits — the
    discipline now feeds a visible artefact.
  - Semver is enforced by tooling: `feat:` → minor, `fix:` → patch,
    `feat!:` / `BREAKING CHANGE:` → major. No more guessing the next number.
  - **Merge ≠ ship.** `main` accumulates work; shipping is an explicit act
    (merging the release PR), which gives reviewers a natural checkpoint.
  - Rollback story: revert the bad commit on `main`, let release-please cut a
    patch release, deploy fires on the new release. Or re-run the deploy
    workflow against the previous tag via `workflow_dispatch`.
- **Cons**
  - One more workflow to understand. The always-open release PR is unusual
    for contributors who have not seen release-please before — `CONTRIBUTING.md`
    will need a short note (sibling prompt).
  - Slight delay between merge and ship: a commit lands on `main` but does not
    deploy until the release PR is merged. Acceptable — and arguably desirable
    — for a tool that benefits from a deliberate release cadence.
  - Dependency on a third-party action (`googleapis/release-please-action`).
    Mitigated by pinning to a major tag and by the action being maintained by
    Google for their own SDK releases.

## Addendum (2026-05-28) — auth + environment surprises

The first end-to-end run of this pipeline (v1.0.1 → v1.1.0) surfaced two
GitHub-Actions guardrails that the original decision did not account for.
Captured here so future readers do not re-debug them:

1. **`GITHUB_TOKEN` does not fan out.** When `release-please-action` creates
   the GitHub release using the default `GITHUB_TOKEN`, the resulting
   `release: published` event **does not trigger downstream workflows** —
   GitHub explicitly suppresses this to prevent workflow loops
   ([docs](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow)).
   Result: `deploy.yml` never fired and the live site sat at v1.0.1 after a
   v1.1.0 release was cut.

   **Fix:** pass a Personal Access Token to the action via
   `token: ${{ secrets.RELEASE_PLEASE_TOKEN }}`. Events generated by a PAT
   are treated as user-authored and propagate normally. The PAT is a
   fine-grained token scoped to this repository with **Contents: read+write**
   and **Pull requests: read+write** — the minimum release-please needs.
   This matches the pattern used in our `gedcom-go` project.

   Trade-off: one repo secret to manage (rotation responsibility on the
   maintainer). A GitHub App would avoid the rotation toil but is more
   setup for a single-maintainer project.

2. **GitHub Pages environment branch policy excludes tags by default.** The
   `github-pages` environment is created automatically by GitHub the first
   time Pages is set up via Actions, and its default deployment policy is
   "selected branches only" with just `main` in the allowlist. A
   `release: published` event fires on a tag ref (`v1.1.0`), and the deploy
   was rejected with `"Tag v1.1.0 is not allowed to deploy to github-pages
due to environment protection rules."`

   **Fix:** added a deployment policy entry of `name: v*, type: tag` to the
   `github-pages` environment so any `v`-prefixed tag may deploy. The
   existing `main` branch policy is retained so `workflow_dispatch` from
   `main` still works for ad-hoc redeploys.

Both fixes are required for the release → deploy chain to work; either
alone is insufficient. They are repo-config changes (PAT secret and
environment policy), not code changes, so they live in repository settings
rather than the workflow YAML — though the `token:` reference in
`release-please.yml` is the visible hook.
