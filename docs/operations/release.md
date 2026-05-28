# Releases

Releases are managed by [release-please](https://github.com/googleapis/release-please)
(see [ADR 0010](../decisions/0010-release-please.md)); this page covers the
human-facing procedure.

## Prerequisites

Before merging a release PR, confirm:

- `main` is clean (`git status` empty) and freshly pulled.
- The latest CI run on `main` is green (`gh run list --branch main --limit 1`).
- The custom domain serves the current `main` build over HTTPS — visit
  https://waterforge.app/ and confirm a valid certificate (no `*.github.io`
  fallback). If HTTPS is not provisioned, fix that **before** merging.
- The milestone for this release has no open issues
  (`gh issue list --milestone "M5 — Ship" --state open` — adjust for the active
  milestone).

## Cut the release

1. **Land work**

   Merge feature/fix PRs into `main` using conventional commits
   (`feat:`, `fix:`, `feat!:` / `BREAKING CHANGE`, etc.). This is the existing
   day-to-day flow — release-please reads these commit messages to determine
   the next version and changelog entries.

2. **Review the release PR**

   release-please opens (and keeps updated) a PR titled something like
   `chore(main): release waterforge 1.0.2`. It contains the `package.json`
   bump, the manifest bump, and the new `CHANGELOG.md` section. Inspect the
   diff:
   - Bumped version matches expectations from the commits since the previous
     release (`fix:` → patch, `feat:` → minor, `feat!:` / `BREAKING CHANGE` →
     major).
   - `CHANGELOG.md` entry reads cleanly. If a line needs rewording, edit the
     PR description — release-please re-uses the description as the changelog
     body on subsequent updates.

3. **Merge the release PR**

   Use the standard merge-commit flow (branch protection requires it). On
   merge, release-please creates the `vX.Y.Z` tag and publishes the
   corresponding GitHub release. The deploy workflow fires on the
   `release: published` event.

4. **Verify**
   - `gh release view vX.Y.Z` lists the new release.
   - The deploy workflow ran on the release event and the live app at
     https://waterforge.app/ matches the new build.
   - `CHANGELOG.md` on `main` reflects the new entry.
   - The milestone is closed (`gh api repos/cacack/waterforge/milestones/<N>
-X PATCH -f state=closed` if not auto-closed).

> Screenshots are no longer part of cutting a release. If a release deserves
> extra polish, attach images after the fact with
> `gh release upload vX.Y.Z <files>`.

## Rollback

If a release ships a broken build:

1. Open a revert PR (`gh pr create` after `git revert <merge-sha>`) and merge
   it. release-please will queue a patch release PR which, on merge, creates
   a new tag and GitHub release — triggering a deploy of the reverted build.
2. No manual tag-cutting is required.

Do **not** delete or move existing tags — once published, they're immutable
references in the wild.
