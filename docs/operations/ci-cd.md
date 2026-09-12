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

Runs daily on a schedule, and on `workflow_dispatch`. Four checks: the GitHub
Pages certificate state, the origin certificate's remaining lifetime, the
domain's registration expiry, and that `https://waterforge.app/` returns `200`.
On failure it opens a single issue — deduplicated by title so a sustained outage
does not file one per day — and closes that issue automatically once the checks
pass again.

No secrets required: the default `GITHUB_TOKEN` with `pages: read` and
`issues: write` covers all four checks. The job runs without
`actions/checkout`, so every `gh` call must pass `--repo` — without it `gh`
looks for a git remote and dies with "not a git repository", which silently
disables the alerting rather than failing the check.

The domain-registration check reads the expiry from RDAP via `rdap.org`, which
resolves the authoritative registry server from the IANA bootstrap — so a change
of registrar or TLD does not strand the check on a hardcoded endpoint. Its
threshold is **45 days** (`DOMAIN_EXPIRY_WARN_DAYS`), deliberately wider than the
21-day certificate window: a stuck renewal is a support ticket at a registrar,
not something a redeploy can clear. An unreadable or unparseable RDAP response
warns rather than failing — the renewal is diarised off-repo as well
([continuity.md](./continuity.md#owner-checklist)), so a flaky third-party
redirector must not file an issue every night.

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

## Archive (`archive.yml`)

Asks [Software Heritage](https://archive.softwareheritage.org) to ingest the
repository, on every published release, monthly on a schedule, and on
`workflow_dispatch`. One anonymous `POST` to the Save Code Now API with the
repository URL — no checkout, no secret, `contents: read`.

Why it exists: one account holds the repo, the Pages host and the release
history, so without a copy elsewhere, Principle 1 ("what we build on the commons
stays in the commons") is a licence promise with nothing behind it. The archive
ingests the full git history and is reachable whatever happens to this account.
[continuity.md](./continuity.md) is the wider picture.

Ingestion is asynchronous: the `POST` returns once a visit is queued, so
`save_request_status: accepted` is the success signal and the snapshot ID appears
only after a loader has run. A rejected, rate-limited or unreachable request
fails the run. The monthly trigger is there because releases can be months apart,
and an archive that lags that far behind is a snapshot rather than a mirror.

## Dependabot auto-merge (`dependabot-automerge.yml`, `dependabot-retitle.yml`)

Enables GitHub auto-merge on Dependabot PRs and approves them, so a patch or minor
bump lands on its own once CI and the required GitGuardian check pass. Majors are
left for manual review — and so is any bump Dependabot declines to classify, which
matters here: it omits `update-type` for indirect dependencies, and `dependencies`
are compiled into `dist/`, so an unreviewed transitive major would be _shipped_
rather than merely merged.

**A stub.** The logic lives in
[`cacack/workflows`](https://github.com/cacack/workflows), pinned here by SHA, so a
fix lands in one place rather than drifting per repo. That repo's README documents
the mechanism and the inputs. What stays in waterforge's stub is `merge-method:
merge`, which is a hard constraint here rather than a preference — the ruleset on
`main` allows merge commits only.

It runs on `pull_request_target`, not `pull_request`: a Dependabot-triggered
`pull_request` run cannot see this repo's Actions secrets, and the merge and approve
authenticate as the `waterforge-steward` App rather than as `GITHUB_TOKEN`. The App
needs **Contents, Pull requests and Workflows: write** for this — more than the watch
asks of the same App; see [§ One-time manual steps](#one-time-manual-steps-repo-owner).

`dependabot-retitle.yml` is separate and cosmetic. Dependabot derives its PR title
from the commit subject, so every Dependabot PR arrives in conventional format; the
rewrite keeps the PR list readable and covers majors, which are merged by hand. It is
**not** what protects the merge commit — the called workflow passes an explicit merge
subject and an empty body for that, because the title is a value Dependabot rewrites
on every rebase and cannot be relied on at merge time.

## Dependabot watch (`dependabot-watch.yml`)

Runs daily on a schedule, and on `workflow_dispatch`. Fails when a high- or
critical-severity Dependabot alert has been open longer than the grace period,
files a single issue naming severity, package, age and the alert, and closes that
issue again on the next clean run.

**A stub.** The logic lives in
[`cacack/workflows`](https://github.com/cacack/workflows), pinned here by SHA, so a
fix lands in one place rather than drifting per repo. That repo's README documents
the mechanism, the inputs, and the reasoning behind the parts that look
over-engineered but are not. What stays in waterforge's stub is the schedule (a
`workflow_call` workflow cannot declare one) and the two values that are this
repo's own rather than the shared default.

Why it exists: alert #13 (`nanoid`, high) sat open for 25 days in August 2026 with
no Dependabot PR, and nothing in the merge flow surfaced it — `ci.yml` only proves
`main` builds and site-health only proves the site is up. A fully green repo can
carry a high-severity alert indefinitely.

The threshold is [ADR 0017](../decisions/0017-maintenance-thresholds.md)'s, not the
shared workflow's: no high- or critical-severity advisory open more than **7 days**,
with medium and low deliberately unbounded. The stub passes that ADR's URL upstream
so the filed issue cites it, and change the number in the ADR rather than in either
workflow. A `grace_days` dispatch input overrides it for a one-off test run.

It needs a credential, which site-health does not. `GITHUB_TOKEN` cannot read the
Dependabot alerts API at all, so the read authenticates as the `waterforge-steward`
GitHub App — see [§ One-time manual steps](#one-time-manual-steps-repo-owner) for
provisioning and for why an App rather than a PAT.

Scheduled workflows and `workflow_dispatch` both resolve from the **default
branch**, so a change here takes effect once merged to `main` — it cannot be
exercised from a PR branch. GitHub also disables cron workflows after 60 days of
repository inactivity.

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

   **Since adopting the reusable `dependabot-automerge.yml`, the same App also needs
   Contents: Read and write, Pull requests: Read and write, and Workflows: Read and
   write.** `Workflows: write` is the load-bearing one — most Dependabot PRs here edit
   `.github/workflows/*`, and GitHub refuses to enable auto-merge on such a PR without
   it, a permission `GITHUB_TOKEN` cannot be granted through a `permissions:` block at
   all. Widen the App under **Settings → Developer settings → GitHub Apps →
   waterforge-steward → Permissions**, then accept the permission request on the
   installation. Until that is done the auto-merge job fails at the token step; the
   run goes red rather than quietly skipping.

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
