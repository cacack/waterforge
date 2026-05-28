# CI/CD

Waterforge uses two GitHub Actions workflows.

## PR checks (`ci.yml`)

Triggers on every pull request targeting `main`. One job on `ubuntu-latest`
runs the full quality gate in order:

| Step       | Command                                      |
| ---------- | -------------------------------------------- |
| Lint       | `npm run lint` (ESLint + Prettier check)     |
| Type-check | `npm run typecheck` (`svelte-check` + `tsc`) |
| Test       | `npm run test` (Vitest)                      |
| Build      | `npm run build` (Vite production build)      |

Node version: **22** (LTS). Dependencies are installed with `npm ci` and
cached by npm to keep runs fast.

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

## One-time manual step (repo owner)

GitHub cannot self-enable Pages via a workflow. The repo owner must do this
once:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

Without this, the deploy job will fail with a Pages not enabled error.

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
