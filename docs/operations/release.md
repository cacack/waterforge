# Releases

How to cut a Waterforge release. One-page, one-person procedure.

## Prerequisites

Before tagging a release, confirm:

- `main` is clean (`git status` empty) and freshly pulled.
- The latest CI run on `main` is green (`gh run list --branch main --limit 1`).
- The custom domain serves the current `main` build over HTTPS — visit
  https://waterforge.app/ and confirm a valid certificate (no `*.github.io`
  fallback). If HTTPS is not provisioned, fix that **before** tagging.
- The milestone for this release has no open issues
  (`gh issue list --milestone "M5 — Ship" --state open` — adjust for the active
  milestone).

## Cut the release

1. **Bump the version**

   Edit `package.json` (`version` field) to the new release. Run `npm install`
   so `package-lock.json` reconciles. Commit on a branch
   (`chore/v<X>-release`).

2. **Draft release notes**

   Write a short notes file (e.g. `RELEASE_NOTES_v<X>.md` or compose directly
   in the GitHub release form). Keep it audience-focused: what shipped, what
   it's for, what it isn't (see `CONSTITUTION.md` non-goals). For a major
   release, summarize the milestone breakdown.

3. **Capture screenshots**

   Build (`npm run build`) and serve (`npm run preview`). Use Playwright (or
   any browser) to capture a small set of screenshots:
   - Desktop, light + dark (1440×900 is a reasonable target viewport).
   - Mobile, light + dark (390×844 ≈ iPhone 14).

   Keep each PNG under ~500 KB. These are attached **directly to the GitHub
   release** (step 6) — do not commit them to the repo tree.

   If the UI has materially changed since the last release, also refresh
   `docs/hero.png` (the single screenshot rendered in `README.md`) in the
   release PR. Use the same 1440×900 desktop-light capture as the basis.

4. **PR and merge**

   Open a PR titled `chore(release): v<X>`, body links to the release notes
   file (if in-repo) and references the milestone close-out. Wait for the
   required `GitGuardian Security Checks` status to go green, then
   `gh pr merge <N> --merge --delete-branch`.

5. **Tag and push**

   From freshly-pulled `main`:

   ```bash
   git checkout main && git pull
   git tag v<X> <merge-sha>
   git push origin v<X>
   ```

   Tags are not branch-protected, so this works directly. Push the tag
   **after** the release PR merges so the tag includes the runbook and notes.

6. **Publish the GitHub release**

   ```bash
   gh release create v<X> \
     --title "Waterforge v<X>" \
     --notes-file RELEASE_NOTES_v<X>.md
   gh release upload v<X> <path/to/your/screenshots>/*.png
   ```

7. **Verify**
   - `gh release view v<X>` lists the release with assets attached.
   - The deploy workflow ran on the merge commit and the live app at
     https://waterforge.app/ matches the new build.
   - The milestone is closed (`gh api repos/cacack/waterforge/milestones/<N>
-X PATCH -f state=closed` if not auto-closed).

## Rollback

If a release ships a broken build:

1. Open a PR that reverts the release commit (`gh pr create` after
   `git revert <merge-sha>`).
2. Merge it through the normal flow — the deploy workflow re-deploys the
   reverted `main`.
3. Cut a new patch tag (`v<X>.<Y>+1`) pointing at the revert merge commit.

Do **not** delete or move existing tags — once published, they're immutable
references in the wild.
