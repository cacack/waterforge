# Operations / SRE Review — 2026-09-26

**Verdict:** needs-attention

**Project scale (for context):** Personal static/client-side PWA (Svelte + Vite), deployed to GitHub Pages behind a custom domain and CloudFlare proxy. No backend, no database, no server-side runtime — "operability" here means: does the site stay reachable, does the release pipeline keep working, and would an outage be caught and fixable. Judged against that bar, not against a service with a runtime to instrument.

For a project of this shape, the operational documentation is unusually mature — `docs/operations/ci-cd.md`, `release.md`, `continuity.md`, `cloudflare-pages.md`, and `traffic-baseline.md` collectively read like a small SRE handbook: SPOF inventory, silent-failure-mode catalog, a tested certificate-recovery runbook with exact `curl`/`openssl`/`gh` commands, and monitoring whose filed issues link straight to the relevant runbook section. The one substantive gap is self-documented and still open: the CI quality gate is not a required merge check, and that exact failure mode already caused a five-day silent breakage of `main`.

## Findings

**[HIGH] `main`'s quality gate (`ci.yml` / `check`) is not a required status check**

- Evidence: `docs/operations/ci-cd.md` § "Follow-up: making CI checks required" states plainly: "The current branch-protection ruleset only requires the 'GitGuardian Security Checks' status check... This is an owner-only operation and is out of scope for this PR." `ci.yml`'s own header comment confirms the historical cost: "GitGuardian is the only _required_ status check in the ruleset, so a red `check` never blocks a merge and main can go green-to-red unnoticed — it did, for five days, after a prettier-plugin-tailwindcss bump auto-merged with `check` already failing."
- Why it matters: lint/typecheck/test/build can be red on `main` for days without blocking anything, and nothing pages anyone about it except the next human who happens to look. Combined with Dependabot auto-merge (`dependabot-automerge.yml`) landing PRs on its own, a bad dependency bump can merge, break the build, and sit broken until the daily `ci.yml` schedule run or a human notices — this already happened once for 5 days.
- Suggested action: the fix is already scoped and known (add `CI / check` to the ruleset's required status checks under Settings → Rules → Rulesets); it just needs an owner with repo-admin access to click it.

**[MEDIUM] Release pipeline's SPOF (`RELEASE_PLEASE_TOKEN`) has no automated expiry/failure detection**

- Evidence: `docs/operations/continuity.md` lists the PAT as a single point of failure and calls out its own blind spot: "The PAT is the least severe and the easiest to miss... Releases silently stop; the site freezes at the last deploy." `release-please.yml` runs on a daily schedule plus every push to `main`, but nothing in `.github/workflows/` checks whether that workflow is actually succeeding or whether the token is close to expiring — unlike the TLS cert and domain-registration checks in `site-health.yml`, which do have proactive, dated thresholds (21-day / 45-day windows).
- Why it matters: if the fine-grained PAT expires (fine-grained PATs have a mandatory max lifetime), `release-please.yml` starts failing quietly — no user-facing symptom, no issue filed, and the project's own "success criterion" ("no Dependabot PR open more than 14 days," `CONSTITUTION.md`) would start silently drifting too, since fixes can no longer release.
- Suggested action: extend `site-health.yml` (or a small new check) to alert if `release-please.yml`'s last N scheduled runs failed, mirroring the pattern already used for the domain/cert checks — the alerting infrastructure (dedup-by-title issue filing) already exists and could be reused directly.

**[LOW] Client-side error handling is silent-by-design, with no breadcrumb for hard-to-repro bugs**

- Evidence: `src/persist.svelte.ts` (`save`/`loadFromStorage`) and `src/share.ts` (share-link decode) use bare `catch { /* comment */ }` with no logging of any kind — confirmed by a repo-wide grep for `console.log|warn|error` across `src/`, which returns zero hits outside test files. `src/components/Actions.svelte`'s JSON-import path is the one place an error reaches the user (`importError` state), so the pattern is deliberate rather than an oversight.
- Why it matters: this is appropriate for a no-tracking, privacy-by-default app (Principle 5 in `CONSTITUTION.md`), and the README's guidance to attach a share-link when filing a bug report covers most solver/computation bugs. It does mean a `localStorage` quota failure or a corrupted share-link never surfaces anywhere except a user noticing state silently didn't persist — there's no way to distinguish "it worked" from "it silently failed" after the fact, for either the user or the maintainer.
- Suggested action: no action needed at this scale; if bug reports about "my settings didn't save" start recurring, a `?debug` query param that runs the same code path with console output would be proportionate — full logging infrastructure would not be.

## Notes

- **Site-health monitoring is a standout for a project this size.** `.github/workflows/site-health.yml` checks Pages certificate state, origin certificate expiry, domain-registration expiry (via RDAP, registrar-agnostic), and end-to-end reachability, with a deliberate hierarchy of hard-fail vs. warn (e.g., CloudFlare's `403` to datacenter IPs is explicitly treated as inconclusive, not a false outage page) and issues that are deduplicated by title and auto-closed on recovery. The filed issue body links directly to `cloudflare-pages.md`'s runbook section — an incident responder lands on the fix, not a blank issue.
- **`docs/operations/continuity.md` is genuinely above the bar for a personal project** — it names every SPOF (domain, CloudFlare account, GitHub account, release PAT), documents which failures are silent, and records that an off-repo archival copy (Software Heritage, re-ingested on every release + monthly) and a diarised domain-renewal reminder already exist. This is bus-factor planning most small teams skip entirely.
- **Rollback story is real, not aspirational**: `docs/operations/release.md` documents a revert-PR → release-please → new tag → redeploy flow, explicitly forbids deleting/moving published tags, and `deploy.yml` supports `workflow_dispatch` for manual redeploys (used, per `cloudflare-pages.md`, to re-activate a deployment after a Pages routing hiccup).
- **No log aggregation, metrics, or tracing exists, and none is warranted** — there is no server-side runtime to instrument. The closest analogue (traffic visibility) is handled deliberately and well in `docs/operations/traffic-baseline.md`, which goes out of its way to warn against over-reading CDN edge counts as user metrics.
- Did not find any CI flakiness signals (no `.skip`/`.only`/retry-decorator patterns in test files) or TODO/FIXME density around release or deploy code.

### Summary counts

critical=0 high=1 medium=1 low=1
