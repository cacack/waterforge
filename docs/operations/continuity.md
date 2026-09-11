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
| **GitHub account**         | Repo, Pages hosting, Actions, releases  | Site and source both disappear at once.                                |
| **`RELEASE_PLEASE_TOKEN`** | PAT that lets release-please open PRs   | Releases silently stop; the site freezes at the last deploy.           |

The PAT is the least severe and the easiest to miss — see
[ci-cd.md § One-time manual steps](./ci-cd.md#one-time-manual-steps-repo-owner)
for what it is and how it is provisioned. That page is the authoritative record
for all owner-only settings; this one does not restate them.

## Silent-failure modes

The dangerous failures are the quiet ones — the project looks fine right up
until it is gone.

- **A lapsed domain renewal is not monitored.** The daily
  [site-health check](./ci-cd.md#site-health-site-healthyml) covers the Pages
  certificate state, the origin certificate's remaining lifetime, and that the
  site returns `200`. **It does not check domain registration expiry.** A
  renewal that fails will not raise an alert until the site is already down, and
  by then the recovery window is a registrar grace period, not a CI fix.

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

Two things make the mission durable, and neither can be done from inside this
repository. They are recorded here so they are not forgotten.

- [ ] **Put a copy somewhere that is not this GitHub account.** The cheapest
      durability insurance is distribution, not succession planning. Options
      include a software-preservation archive
      ([Software Heritage](https://archive.softwareheritage.org) accepts a public
      repository URL and archives the full history), a mirror on a second forge,
      or a release tarball kept in personal backups. One copy elsewhere converts
      Principle 1 from an intention into a fact.
- [ ] **Diarise the domain renewal** outside this repo, in a calendar that
      outlives any single machine — with a reminder early enough to act on, given
      that nothing in CI will warn first.

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
