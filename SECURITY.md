# Security Policy

Waterforge is a static, client-side web app. It has no backend, no accounts, no
server-side state, and no telemetry — everything runs in your browser, and
nothing you enter leaves it. That shape rules out whole categories of
vulnerability, and it also means the ones that remain are worth taking
seriously.

## Reporting a vulnerability

Please report privately, not as a public issue.

Use GitHub's private vulnerability reporting:

**[Security tab → Report a vulnerability](https://github.com/cacack/waterforge/security/advisories/new)**

That opens a private advisory visible only to you and the maintainer, with a
place to attach details and a proposed fix. You do not need an email address or
any prior contact.

If you believe a published water profile is wrong in a way that could harm
someone — a mis-stated ion figure producing an implausible salt dose, say — that
is not a security issue in the usual sense, but report it the same private way
and it will be treated with the same urgency.

### What to expect

This is a single-maintainer project worked on opportunistically. Reports are
handled on a best-effort basis; there is no response-time guarantee, and
promising one would be dishonest. You will get an acknowledgement when the
report is read, and you will be credited in the advisory unless you ask not to
be.

## Supported versions

Only the **latest release** is supported. Fixes ship forward in a new release
rather than being backported — there is no long-term support branch, and
claiming otherwise would be a promise this project cannot keep.

The live site at [waterforge.app](https://waterforge.app) always serves the
latest release.

## Scope

**In scope:**

- Dependency vulnerabilities that reach the shipped bundle in `dist/`.
- Cross-site scripting or injection via the parsing of untrusted input —
  principally the shareable-recipe URL hash and the JSON import dialog, which
  are the only places the app consumes data it did not produce.
- Anything that causes the app to silently produce a wrong recipe, wrong
  regulator pressure, or wrong salt dose. The output of this app is dissolved in
  water people drink; a silent correctness failure is a safety issue, not just a
  bug.
- Integrity of the profile data and its provenance — a profile whose recorded
  source does not support its numbers.

**Out of scope:**

- Attacks requiring a backend, user account, session, or stored credential.
  None of these exist.
- Self-hosted forks and the infrastructure they run on. You are free to fork and
  self-host (see the [README](README.md#fork-and-self-host)), but the operator of
  a fork owns its security.
- Findings against the GitHub Pages or CloudFlare infrastructure in front of the
  site — report those to the respective vendor.
- Denial of service against a static site with no server-side compute.

## Dependencies

Dependency updates are automated via Dependabot, and shipped dependencies are
separated from build-only tooling in `package.json` so that a bump reaching
users cuts a release (see [CONTRIBUTING.md](CONTRIBUTING.md#dependencies)). A
daily CI run checks the live site and the build.
