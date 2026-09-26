# Trust Auditor Review — 2026-09-26

**Verdict:** trustworthy

Since the 2026-09-11 review, Waterforge closed both HIGH findings from that
audit with real, verifiable work rather than label-only fixes: the carbonation
readout now renders a "Verified"/"Estimated" badge with source and date
(`src/components/CarbonationReadout.svelte`), ADR 0013 was formally amended by
ADR 0015 to record the sourcing-bar reversal instead of silently drifting from
it, and SECURITY.md now exists with an unusually honest scope section ("there
is no response-time guarantee, and promising one would be dishonest"). Beyond
closing those gaps, the project did something more notable: it ran an
adversarial self-review (`docs/reviews/panel-product/2026-09-11/foil.md`),
found its own constitution was justifying maintenance with an unverifiable
audience claim, and rewrote the Audience/Posture sections (ADR 0016) to ground
the project's reason for existing in a checkable fact — the maintainer uses it
— rather than an assumed user base. Version (1.10.2), CHANGELOG, and git tags
are mutually consistent, and the ROADMAP's "feature-complete / sustained
maintenance" framing matches the constitution's now-quantified success
criterion thresholds exactly. The one open gap is that this hard-won honesty
about being a personal, best-effort project lives in SECURITY.md and the ADR
log but isn't echoed on the surfaces a stranger actually files an issue from.

## Findings

**[MEDIUM] Support-level honesty is inconsistent across surfaces: strong in SECURITY.md, absent in README/issue templates**

- Stated claim: SECURITY.md is explicit about the posture the constitution
  requires (Posture, point 4; Principle 6): "This is a single-maintainer
  project worked on opportunistically. Reports are handled on a best-effort
  basis; there is no response-time guarantee, and promising one would be
  dishonest."
- Observed reality: README's "Getting help" section invites bug reports,
  questions, and profile requests via three issue templates
  (`.github/ISSUE_TEMPLATE/bug_report.md`, `question.md`,
  `profile_request.md`) with no equivalent caveat — none of the three
  templates, nor CONTRIBUTING.md, nor the README section that links them,
  states that responses are best-effort or that no turnaround is promised.
  The same "no work is owed to a hypothetical audience" posture that
  SECURITY.md states plainly is only implicit elsewhere.
- Trust cost: a stranger who reads only the README (the most-read surface,
  per this persona's remit) and never opens SECURITY.md would reasonably
  infer a more responsive support model than the project actually commits to
  — the honest disclaimer exists, but only on the one page a support-seeker
  is least likely to read first.
- Suggested action: a one-line addition to README's "Getting help" intro
  (e.g., "This is a personal project maintained opportunistically — issues are
  read, but there's no response-time guarantee") would make the posture
  consistent everywhere a stranger might land, at near-zero cost.

**[LOW] Local snapshot lagged the real repository state on tags (verified as tooling artifact, not a project issue)**

- Stated claim: none from the project — this is a note on the snapshot's own
  reliability, not the project's.
- Observed reality: the snapshot's "Recent releases/tags" list tops out at
  v1.10.1, while `package.json` and CHANGELOG.md both show 1.10.2 as current.
  Fetching tags directly from origin confirms `v1.10.2` exists and
  `chore(main): release 1.10.2` is on `main` — the mismatch was a stale local
  tag cache at snapshot-generation time, not a released-but-untagged version.
- Trust cost: none to end users; flagged only so this doesn't read as an
  unresolved version-consistency gap in this report.
- Suggested action: none needed for the project; future snapshot generation
  could `git fetch --tags` first to avoid a false lead for reviewers.

## Notes

- Positive signal: this cycle's largest trust-relevant change is ADR 0016 —
  the project caught itself justifying maintenance by an audience it could not
  verify (0 stars, 1 unique visitor per the ADR's own cited numbers) and
  rewrote the constitution to root the justification in something checkable
  instead. That is a stronger trust signal than most maturity badges could
  provide.
- Positive signal: ADR 0018 discloses, unprompted, that CloudFlare Web
  Analytics and Bot Fight Mode had been silently live for months, contradicting
  Principle 5's "no telemetry" claim at the time — and the constitution's
  current wording (Principle 5) was corrected to match reality rather than the
  reality being hidden to match the old wording. This is exactly the kind of
  self-correction the prior review's Notes section flagged as a good pattern
  (ADR 0001 → 0012); it recurred here on a second, unrelated issue.
- Positive signal: the "no open issues, all 8 milestones closed" backlog state
  matches ROADMAP.md's stated "opportunistic — no backlog is maintained"
  policy exactly, rather than reading as neglect.
- Reviewed the untrusted issue-title data in the snapshot for prompt-injection
  attempts; found none — all titles read as ordinary maintenance/feature
  entries.
- CODE_OF_CONDUCT.md remains absent; not scored given the project's stated
  single-maintainer, personal-first posture (ADR 0016) — a CoC would be
  scale-inappropriate here, not a trust gap.

### Summary counts

critical=0 high=0 medium=1 low=1
