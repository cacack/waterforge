# CI/CD

Waterforge's GitHub Actions workflows:

## PR checks (`ci.yml`)

Triggers on every pull request targeting `main`. One job on `ubuntu-latest`
runs the full quality gate in order:

| Step       | Command                                      |
| ---------- | -------------------------------------------- |
| Lint       | `npm run lint` (ESLint + Prettier check)     |
| Type-check | `npm run typecheck` (`svelte-check` + `tsc`) |
| Test       | `npm run test` (Vitest)                      |
| Build      | `npm run build` (Vite production build)      |

Node version: read from [`.nvmrc`](../../.nvmrc) via `setup-node`'s
`node-version-file`, so CI, deploy and local dev cannot drift apart. See
[CONTRIBUTING.md](../../CONTRIBUTING.md#requirements) for the Active-LTS policy.
Dependencies are installed with `npm ci` and cached by npm to keep runs fast.

Each step is separate so a failure points directly at the offending tool.

## Deploy (`deploy.yml`)

Triggers on a published GitHub release (`release: types: [published]`) and can
be triggered manually via `workflow_dispatch` (for re-deploys or rollback).
The release event is emitted when release-please's release PR merges (see
[Release automation](#release-automation-release-pleaseyml) below).

Flow:

1. `npm ci` + `npm run build` → produces `dist/`
2. `actions/configure-pages` — sets the correct `base` for Pages
3. `actions/upload-pages-artifact@v3` — uploads `dist/` as the Pages artifact
4. `actions/deploy-pages@v4` — deploys to the `github-pages` environment

The `concurrency` group `pages` with `cancel-in-progress: false` ensures
in-flight deployments finish before a new one starts.

## Release automation (`release-please.yml`)

Triggers on every push to `main`. Runs `googleapis/release-please-action@v4`
in manifest mode (`release-please-config.json` + `.release-please-manifest.json`)
to open or maintain a release PR derived from conventional-commit messages.
On merge of that release PR, release-please bumps `package.json`, prepends to
`CHANGELOG.md`, creates a `vX.Y.Z` tag, and publishes a GitHub release — which
in turn triggers `deploy.yml`.

`CHANGELOG.md` on `main` is the canonical "what shipped" surface; the
generated GitHub release mirrors the same notes.

See [ADR 0010](../decisions/0010-release-please.md) for the rationale and
[`release.md`](./release.md) for the operator procedure.

## Site health (`site-health.yml`)

Runs daily on a schedule, and on `workflow_dispatch`. Three checks: the GitHub
Pages certificate state, the origin certificate's remaining lifetime, and that
`https://waterforge.app/` returns `200`. On failure it opens a single issue —
deduplicated by title so a sustained outage does not file one per day — and
closes that issue automatically once the checks pass again.

No secrets required: the default `GITHUB_TOKEN` with `pages: read` and
`issues: write` covers all three checks. The job runs without
`actions/checkout`, so every `gh` call must pass `--repo` — without it `gh`
looks for a git remote and dies with "not a git repository", which silently
disables the alerting rather than failing the check.

CloudFlare's bot management returns `403` to some datacenter ranges, GitHub's
runners included, so the reachability check treats a `403` as inconclusive and
warns instead of filing an issue. `404`, `526`, `5xx` and connection failures
stay hard failures. The gatus probe in the homelab covers that same public path
from a residential IP, where the `403` does not occur.

Scheduled workflows only run from the **default branch**, so this takes effect
once merged to `main`, not on the PR branch. GitHub also disables cron
workflows after 60 days of repository inactivity.

See [CloudFlare in front of GitHub Pages](./cloudflare-pages.md#monitoring) for
what each check catches and the runbook the alert links to.

## Dependabot watch (`dependabot-watch.yml`)

Runs daily on a schedule, and on `workflow_dispatch`. Queries
`repos/{owner}/{repo}/dependabot/alerts?state=open` and fails when a **high- or
critical-severity** alert has been open longer than the grace period, filing a
single issue — deduplicated by title, same as site-health — that names severity,
package, age in days, the version the fix landed in, and a link to the alert. The
issue closes automatically on the next clean run.

The threshold lives in
[ADR 0017](../decisions/0017-maintenance-thresholds.md), not here: no high- or
critical-severity advisory open more than **7 days**, with medium and low
deliberately unbounded. The workflow reuses that ADR's own query, so the two
cannot drift. Change the number in the ADR. A `grace_days` dispatch input
overrides it for a one-off test run.

Why it exists: alert #13 (`nanoid`, high) sat open for 25 days in August 2026
with no Dependabot PR, and nothing in the merge flow surfaced it — `ci.yml` only
proves `main` builds and site-health only proves the site is up. It watches the
_symptom_, an alert that stays open, rather than the cause: why Dependabot
skipped that alert is recorded only in the update-job logs at `/network/updates`,
which no REST endpoint exposes.

Unlike site-health, this one needs a credential. `GITHUB_TOKEN` cannot read the
Dependabot alerts API at all, so the read step authenticates as the
`waterforge-steward` GitHub App — see
[§ One-time manual steps](#one-time-manual-steps-repo-owner) for provisioning and
for why an App rather than a PAT. Only that one step uses it; the issue it files
and closes still runs as `GITHUB_TOKEN`, which is why the App needs a single
read-only permission. Minting the token is `continue-on-error`, because an action
step that fails outright would end the run before anything could report it — a
missing or rotated key is surfaced through the same issue as any other fault,
rather than as a red X on a scheduled run nobody is watching.

A failed API read is a **hard failure** rather than a warning.
Site-health can degrade safely because its origin-certificate check is an
independent backstop; here the API read _is_ the check, so a warning would rebuild
the exact silent failure the workflow exists to close. The same applies to the
issue it files: an operational failure ("the watch could not complete") is
reported in its own wording rather than squeezed into the advisory table, because
a watch that cannot answer the question is worse than a stale advisory.

Both constraints that apply to site-health apply here too: dedup is by **title,
not label**, because repo labels are Terraform-managed (`git-repositories/labels.json`)
and this workflow must not depend on a label that module does not declare; and the
job runs without `actions/checkout`, so every `gh` call passes `--repo` — without
it `gh` looks for a git remote and dies with "not a git repository", silently
disabling the alerting rather than failing the check.

Scheduled workflows and `workflow_dispatch` both resolve from the **default
branch**, so this takes effect once merged to `main` — it cannot be exercised from
a PR branch. GitHub also disables cron workflows after 60 days of repository
inactivity.

## One-time manual steps (repo owner)

Several owner-only settings underpin the pipeline. These are not in any
workflow file — they live in the GitHub web UI / API and need to be set
once.

1. **Enable Pages via Actions.** GitHub cannot self-enable Pages via a
   workflow. Set **Settings → Pages → Build and deployment → Source →
   GitHub Actions**. Without this, the deploy job fails with a Pages-not-
   enabled error.

2. **Allow GitHub Actions to create pull requests.** Required so
   release-please can open its release PR. Set **Settings → Actions →
   General → Workflow permissions → ☑ Allow GitHub Actions to create and
   approve pull requests**. The default is off; without this, release-please
   gets `403` when trying to open the release PR even though its workflow
   declares `pull-requests: write`.

3. **Provision a PAT for release-please.** The default `GITHUB_TOKEN` does
   not propagate events to downstream workflows (loop prevention), so a
   release published with `GITHUB_TOKEN` never triggers `deploy.yml`. Fix:
   create a fine-grained Personal Access Token at
   [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens)
   scoped to this repo with **Contents: read+write** and **Pull requests:
   read+write**, then store it as the repo secret `RELEASE_PLEASE_TOKEN`
   (`gh secret set RELEASE_PLEASE_TOKEN`). The token reference is in
   `release-please.yml`. PAT expiration is the maintainer's responsibility.

4. **Allow `v*` tags to deploy to the `github-pages` environment.** The
   environment is created automatically by Pages and defaults to a "selected
   branches" policy with only `main` allowed; a `release: published` event
   fires on a tag ref and gets rejected. Add a tag policy via the API:

   ```bash
   gh api -X POST repos/cacack/waterforge/environments/github-pages/deployment-branch-policies \
     -F name='v*' -F type=tag
   ```

   The existing `main` branch policy is retained so `workflow_dispatch`
   redeploys from `main` still work.

5. **Provision the `waterforge-steward` GitHub App.** Required by
   `dependabot-watch.yml`. `GITHUB_TOKEN` **cannot** read the Dependabot alerts
   API — `security-events: read` looks like the permission that covers it and
   does not, and the first run after merge returned `403 Resource not accessible
by integration` ([#240](https://github.com/cacack/waterforge/issues/240)).
   Because the workflow cannot run from a PR branch, this was only discoverable
   once it landed on `main`.

   Create the App at
   [github.com/settings/apps/new](https://github.com/settings/apps/new) with
   webhooks off, installable on this account only, and exactly one repository
   permission: **Dependabot alerts: Read-only**. Generate a private key, install
   the App on this repo, then store both halves:

   ```bash
   gh secret set BOT_APP_ID --body '<app-id>'
   gh secret set BOT_PRIVATE_KEY < waterforge-steward.private-key.pem
   ```

   The workflow mints a short-lived token from these per run, so there is nothing
   to rotate and no expiry to forget. **A PAT would also work and was rejected**:
   it is a long-lived credential tied to a person, and PAT expiry is already a
   recorded silent-failure mode
   ([continuity.md](./continuity.md#silent-failure-modes)) — a watch whose purpose
   is to prevent a silent failure should not be guarded by one.

   The secret names match the convention in
   [`cacack/workflows`](https://github.com/cacack/workflows), so the same App can
   later carry the Contents / Pull requests / Workflows write permissions that
   repo's reusable `dependabot-automerge.yml` stub expects.

## Follow-up: making CI checks required

The current branch-protection ruleset only requires the "GitGuardian Security
Checks" status check. To make the `check` job from `ci.yml` a required gate,
the repo owner must edit the ruleset under **Settings → Rules → Rulesets** and
add `CI / check` to the required status checks. This is an owner-only operation
and is out of scope for this PR.

release-please needs `contents: write` and `pull-requests: write` permissions
to open release PRs and create tags/releases; these are granted in the
workflow itself (`permissions:` block in `release-please.yml`) — no ruleset
change is required.
