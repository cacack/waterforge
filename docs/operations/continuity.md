# Continuity

What has to survive for Waterforge to keep existing — and what happens to it if
the maintainer stops.

The project's founding principle is _free and copyleft over proprietary
control — what we build on the commons stays in the commons_
([CONSTITUTION.md](../../CONSTITUTION.md)). A GPLv3 licence makes that legally
true. It does not make it **practically** true: a licence does not keep a domain
renewed or put a copy of the profile compilation anywhere but one account. This
page is about the practical half.

> **Scope.** This file records _what_ the dependencies are and _how_ they fail.
> It deliberately contains no account names, account IDs, credentials, or
> renewal dates — those live in the owner's password manager and calendar, not
> in a public repository.

## Single points of failure

Each of these is held by one person, and each ends the public site if it lapses.

| Dependency                 | What it does                            | If it lapses                                                           |
| -------------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| **Domain registration**    | `waterforge.app`                        | Site stops resolving. Recoverable only until the name is re-sold.      |
| **CloudFlare account**     | DNS + proxy (CDN/WAF) in front of Pages | DNS stops resolving; see [cloudflare-pages.md](./cloudflare-pages.md). |
| **GitHub account**         | Repo, Pages hosting, Actions, releases  | Site, issues and releases go; the source survives in the archive.      |
| **`RELEASE_PLEASE_TOKEN`** | PAT that lets release-please open PRs   | Releases silently stop; the site freezes at the last deploy.           |

The PAT is the least severe and the easiest to miss — see
[ci-cd.md § One-time manual steps](./ci-cd.md#one-time-manual-steps-repo-owner)
for what it is and how it is provisioned. That page is the authoritative record
for all owner-only settings; this one does not restate them.

## Silent-failure modes

The dangerous failures are the quiet ones — the project looks fine right up
until it is gone.

- **A lapsed domain renewal produces no error until the name stops resolving.**
  Nothing degrades first: no certificate warning, no failing response, just a site
  that is gone one morning, with a registrar grace period rather than a CI fix as
  the recovery window. The daily
  [site-health check](./ci-cd.md#site-health-site-healthyml) now reads the
  registration expiry from RDAP and fails **45 days out** — wider than the 21-day
  certificate window, because a stuck renewal is a support ticket at a registrar,
  not something a redeploy can clear. That check is the early warning, not the
  guarantee: the next bullet is why it cannot be the only one, and why the renewal
  is also diarised off-repo.

- **The watchdogs stop watching when the maintainer stops.** GitHub disables
  scheduled workflows after **60 days of repository inactivity**
  ([ci-cd.md](./ci-cd.md#site-health-site-healthyml)). Both scheduled monitors —
  the site-health check and the
  [Dependabot watch](./ci-cd.md#dependabot-watch-dependabot-watchyml) — are
  therefore guaranteed to switch themselves off in exactly the scenario they exist
  to catch: a project going quiet. Treat a long silence as the point at which
  monitoring must be assumed absent, not as evidence that nothing is wrong.

- **The custom domain can be un-set without anyone touching it.** GitHub
  periodically re-verifies the custom domain, sees CloudFlare's IPs, and silently
  clears the setting. Fully documented, with the durable fix, in
  [cloudflare-pages.md](./cloudflare-pages.md).

- **Alerts need somewhere to land.** The health check opens a GitHub issue. That
  is only an alert if someone still reads notifications for this repo.

## Owner checklist

Two things make the mission durable, and neither could be done from inside this
repository. Both are now done. They stay on record because both are worth
re-checking rather than assuming.

- [x] **A copy exists outside this account.** The full git history is in
      [Software Heritage](https://archive.softwareheritage.org/browse/origin/directory/?origin_url=https://github.com/cacack/waterforge),
      a software-preservation archive run independently of this project, first
      ingested 2026-09-11. [`archive.yml`](./ci-cd.md#archive-archiveyml)
      re-requests a visit on every release and monthly in between, so the copy
      tracks the project rather than freezing at one commit. This is what turns
      Principle 1 from an intention into a fact: the code stays in the commons
      whether or not this account does.
- [x] **The domain renewal is diarised** off-repo, in a calendar that outlives any
      single machine, timed to the same 45-day window the site-health check uses.
      Deliberately duplicated with CI rather than replaced by it — the calendar is
      the half that keeps working after the workflows switch themselves off. The
      date and the registrar live there, not here.

Optional, and worth it if the project outlives its maintainer's interest:

- [ ] Note in the README that the project is unmaintained rather than letting it
      rot silently. An archived repo with a working fork path is a far better
      outcome than a dead domain.

## If the maintainer stops

Nothing here requires permission to continue. The licences are the whole
mechanism:

- **Code** — [GPL-3.0-or-later](../../LICENSE). Fork it, change it, host it.
- **Profile data** — [CC-BY-SA-4.0](../../LICENSE-DATA). The compilation is a
  single file, `src/lib/profiles/profiles.json`; each profile carries its own
  source citation. Derived data must stay CC-BY-SA-4.0.

To stand the site up elsewhere, see
[Fork and self-host](../../README.md#fork-and-self-host) in the README. The build
uses a relative base path, so the output runs from any host or subpath with no
configuration — a fork needs no access to the original domain, CloudFlare
account, or GitHub account to be fully functional.

What a fork cannot inherit is the name `waterforge.app` and the release history.
Everything that matters — the solver, the chemistry, and the sourced profile
compilation — travels with the clone.
