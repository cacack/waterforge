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

Triggers on every push to `main` and can be triggered manually via
`workflow_dispatch`.

Flow:

1. `npm ci` + `npm run build` → produces `dist/`
2. `actions/configure-pages` — sets the correct `base` for Pages
3. `actions/upload-pages-artifact@v3` — uploads `dist/` as the Pages artifact
4. `actions/deploy-pages@v4` — deploys to the `github-pages` environment

The `concurrency` group `pages` with `cancel-in-progress: false` ensures
in-flight deployments finish before a new one starts.

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
