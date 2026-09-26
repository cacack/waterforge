# Security Posture Review — 2026-09-26

**Verdict:** healthy

Waterforge is a static, client-side, backend-free web app, which collapses most of the usual server-side attack surface by design (no auth, no accounts, no server secrets, no database). Within that reduced profile the project's posture is solid: a substantive `SECURITY.md` with a real disclosure channel and explicit scope, a required GitGuardian secret-scan gate on every PR, Dependabot covering both npm and GitHub Actions with SHA-pinned actions, a committed lockfile, and the two genuine untrusted-input boundaries (share-link URL hash, JSON import) are explicitly named and go through `JSON.parse` + explicit validation (`applySnapshot`) rather than being trusted directly. No committed secrets or secret-shaped files were found. Remaining gaps are minor and proportionate to the project's small, single-maintainer scope.

## Findings

**[LOW] No CI-side SAST beyond linting and secret scanning**

- Evidence: `.github/workflows/ci.yml` runs ESLint, Prettier, `svelte-check`/`tsc`, Vitest, and a build; GitGuardian (referenced in `CONTRIBUTING.md` and `ci.yml` comments) is the only required check and covers secrets, not general static analysis. No CodeQL or semgrep workflow appears in `.github/workflows/` (`archive.yml`, `ci.yml`, `dependabot-automerge.yml`, `dependabot-retitle.yml`, `dependabot-watch.yml`, `deploy.yml`, `release-please.yml`, `site-health.yml`).
- Why it matters: For a pure client-side TS/Svelte app with no server-side execution, the marginal value of CodeQL/semgrep is lower than in a backend service, but it would still catch classes of DOM-XSS and prototype-pollution-style bugs at the two documented untrusted-input boundaries (share-hash decode, JSON import).
- Suggested action: Optionally add a CodeQL workflow scoped to `javascript-typescript`; low priority given the app's shape and existing lint/type-check coverage.

**[LOW] `{@html}` usage in `HelpDialog.svelte` is content-trusted but worth a standing note**

- Evidence: `src/components/HelpDialog.svelte:95` renders `{@html html}` where `html` comes from `virtual:usage-guide`, a build-time-rendered version of `USAGE.md` (comment at line ~6: "USAGE.md, rendered to HTML at build time"). This is not user-controlled at runtime.
- Why it matters: `{@html}` is a common XSS foot-gun; because this instance's source is a repo-controlled Markdown file compiled at build time (not runtime user input), current risk is low, but a future contributor adding another `{@html}` sink for user-supplied content could reintroduce risk without an obvious guardrail (no lint rule flags `{@html}` usage).
- Suggested action: Optional — a comment already documents the trust boundary at the call site; no code change needed now. If another `{@html}` sink is ever added for non-build-time content, it should be sanitized explicitly.

**[LOW] No `CODE_OF_CONDUCT.md`**

- Evidence: snapshot "Other top-level docs" lists `CODE_OF_CONDUCT.md: absent`.
- Why it matters: Tangential to security posture proper, but relevant to a public repo's disclosure/community-safety hygiene; not a security control itself.
- Suggested action: Out of scope for this review's focus; noting only for completeness. No action recommended given the project's stated single-maintainer, low-audience posture (CONSTITUTION.md).

## Notes

- **Secret scanning**: `git ls-files` shows no tracked `.env`, `.pem`, `.key`, credential, or similar files. Targeted `git grep` for API-key-shaped patterns (`sk-`, `AKIA`, `xox[abprs]-`, `ghp_`, PEM private-key headers, hardcoded `password =` / `api_key =` literals) across tracked files returned no hits (one incidental match on the word "mitigation" in a docs file, not a secret). `.gitignore` explicitly excludes `.env`, `.env.*` while allowlisting `.env.example` — good hygiene, though no `.env.example` currently exists in the repo (consistent with the app needing no runtime secrets).
- **CI secret handling**: `dependabot-automerge.yml` passes `BOT_APP_ID`/`BOT_PRIVATE_KEY` to a reusable workflow by explicit name rather than `secrets: inherit`, and uses `pull_request_target` deliberately (documented rationale in the workflow's header comment) so Dependabot-triggered runs authenticate as a scoped GitHub App rather than exposing repo secrets to `pull_request`-triggered code. This is a better-than-baseline pattern.
- **Actions pinning**: All third-party GitHub Actions in `ci.yml`, `deploy.yml`, and `dependabot-automerge.yml` are pinned to full commit SHAs with version comments (e.g. `actions/checkout@3d3c42e...# v7.0.1`), and Dependabot is configured to bump those SHAs (`.github/dependabot.yml` header comment) — solid supply-chain hygiene for the CI layer.
- **Dependency hygiene**: `package-lock.json` is committed; dependencies use caret ranges (normal for an npm project with a lockfile); `package.json` explicitly separates `dependencies` (ship in `dist/`) from `devDependencies` (tooling only) specifically so Dependabot bump severity maps to release cadence (documented in `CONTRIBUTING.md` and `.github/dependabot.yml`). No obviously abandoned or high-risk packages were flagged in the dependency list sampled.
- **Threat surface**: `SECURITY.md` explicitly scopes in-bounds issues (dependency vulns reaching `dist/`, XSS/injection via the share-link URL hash and JSON import dialog — "the only places the app consumes data it did not produce") and explicitly scopes out backend/account attacks (none exist) and third-party infra (GitHub Pages, Cloudflare). This is an unusually clear threat-surface statement for a project this size. Source inspection confirms the stated boundary: `src/share.ts` decodes/parses the URL hash and documents "caller validates"; `src/persist.svelte.ts` routes both share-hash and `localStorage` snapshots through `applySnapshot`, which is documented as validating before merging into app state.
- **Auth/authz**: Not applicable — no accounts, sessions, or server-side authorization exist by design (confirmed in `CONSTITUTION.md` non-goals and `SECURITY.md` scope).
- **SECURITY.md quality**: Present, specific, and non-generic — names a real reporting channel (GitHub private vulnerability reporting), sets honest expectations ("no response-time guarantee"), states a supported-versions policy (latest release only), and ties into the project's Dependabot/CI setup. No placeholder contact info.

### Summary counts

critical=0 high=0 medium=0 low=3
