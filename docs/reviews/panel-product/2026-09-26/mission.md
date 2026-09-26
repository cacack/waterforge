# Mission Steward Review — 2026-09-26

**Verdict:** aligned

The two weeks since the 2026-09-11 panel are the cleanest window this review has seen: every mission-alignment gap flagged on 2026-09-11 was closed with a documented decision (not silently patched), and the only activity since then — dependency bumps, a release-pipeline health alert, a required CI check, an architecture-doc correction — is exactly the "sustained maintenance" work the constitution's Success Criterion 5 and ADR 0017's thresholds call for. No open issues, no open milestones, and no commits point at anything outside the mission. The residual findings below are forward-looking constitution-health notes rather than active drift.

## Resolved since 2026-09-11 (not re-raised)

- **[was HIGH] Carbonation promise buried its own gap.** Fixed via #217/#218 (shipped in v1.10.0, 2026-09-11): the recipe readout now shows provenance and a verified/unverified badge for every carbonation target, and [ADR 0015](docs/decisions/0015-carbonation-target-sourcing-bar.md) formally documents the reversal from "authoritative-only" to "sourced estimate with disclosed provenance." Coverage is still 5/18 sparkling profiles (unchanged — confirmed against `src/lib/profiles/profiles.json`), but the mission's Principle 3 ("surface uncertainty ... rather than bury it") is now honored in the UI rather than violated.
- **[was MEDIUM] "Grow the water library" overstated as active direction.** `ROADMAP.md` now files it under "Opportunistic — no backlog is maintained" with explicit text: "Expect no open profile issues between such requests." That matches the observed zero-growth reality instead of contradicting it.
- **[was MEDIUM] Constitution refreshed reactively, months after the decisions it ratified.** Addressed head-on by [ADR 0016](docs/decisions/0016-built-for-its-maintainer.md), which rewrote the Audience/Posture sections the same day the gap was found, with verifiable evidence (0 stars/forks/watchers, 1 unique visitor in 14 days, 100% of issues self-filed) rather than assumption.
- **[was LOW] Success Criterion 5 had no measurable threshold.** Now carries concrete numbers (7-day advisory SLA, 14-day Dependabot SLA, 99%/90-day site-health bar), recorded in [ADR 0017](docs/decisions/0017-maintenance-thresholds.md).

## Findings

**[MEDIUM] The one remaining success criterion without a falsifiable test is library growth**

- Constitution section: Success Criteria — "A browsable library of sourced target profiles ships ... It grows opportunistically, with every new profile held to the same authoritative-sourcing standard."
- Observed evidence: No profile-related commit or closed issue since #98 (closed 2026-06-01) — confirmed against the last 30 closed issues and the last 30 commit subjects in the snapshot, all of which are infra/deps/docs. `ROADMAP.md` now correctly labels this "opportunistic, no backlog," which resolves the framing gap from the last review, but the underlying criterion still has no way to distinguish healthy opportunism from quiet abandonment — unlike its sibling criteria (1: "≥6 decimal places," 5: the new 7/14/99% thresholds), there's no trigger or time bound attached to "grows."
- Gap: Twelve months from now, if the library is still frozen at 54 profiles, nothing in the constitution would flag that as a problem or confirm it's fine — it's unfalsifiable either way.
- Suggested action: Optional, low-cost fix: add one sentence naming what would make this criterion fail (e.g., "a well-formed profile-request issue sitting unaddressed past N months" — mirroring the Dependabot-PR-age pattern already used for criterion 5), or explicitly note in the constitution that this criterion has no failure condition by design, consistent with Principle 6.

**[LOW] Mission's "so anyone can reproduce" language still reads as a broad-audience claim the project's own evidence doesn't support**

- Constitution section: Mission — "...so anyone can reproduce a named mineral water at home, precisely and reproducibly." Compare Audience/Posture (added 2026-09-11) — "Built for: its maintainer, first... Aimed at ... describes the aim, not a measured population."
- Observed evidence: ADR 0016 itself supplies the counter-evidence: 0 stars, 0 forks, 0 watchers, 4 repo views / 1 unique visitor in 14 days, and 100% of the 60 issues ever filed authored by the maintainer. The Mission section's opening sentence was not touched by the 2026-09-11 rewrite — only Audience/Posture were — so the two sections now sit at different levels of candor about who the project reaches.
- Gap: This is not a contradiction (the constitution already disclaims it explicitly in Audience), but it is an inconsistency in tone: the Mission section still markets to "anyone," while the Audience/Posture sections it sits beside are unusually honest about reaching effectively no one yet. A future reader skimming only the Mission section would get the pre-ADR-0016 impression.
- Suggested action: None required now — this is a polish note, not a defect. If the constitution is touched again, consider softening "so anyone can reproduce" to something that survives a read of Posture layer 4 (e.g., "so it, or anyone who finds it, can reproduce...").

**[LOW] Constitution has now had two substantial rewrites in under four months, both reactive**

- Constitution section: "How intent is recorded" implies the constitution layer changes are "deliberate and rare."
- Observed evidence: Refresh #1 (2026-05-31, per `docs/reviews/constitution/2026-09-11-drift.md`) caught up on carbonation/PWA/maintenance-phase decisions already shipped. Refresh #2 (2026-09-11, ADR 0016) rewrote Audience, added Posture, Principle 6, and "How intent is recorded" itself — triggered directly by the prior product panel's foil.md. Both were deliberate and well-reasoned (this is a legitimate use of the ADR mechanism, not sloppiness), but both were also externally triggered by a review rather than by the maintainer noticing drift independently.
- Gap: None currently — flagging only as a pattern to watch. If a third rewrite follows the next panel review, it's worth asking whether the review cadence itself has become the constitution's de facto revision trigger, which would be a process dependency worth naming explicitly rather than leaving implicit.
- Suggested action: No action needed this cycle; revisit if the pattern repeats a third time.

## Constitution health

- The document is unusually well-instrumented for a project of this size: Mission, Audience/Posture, Principles, Non-Goals, and Success Criteria all cite concrete, checkable claims, and two of this review's own MEDIUM/LOW findings from 2026-09-11 were closed by adding numeric thresholds (ADR 0017) rather than vaguer language — a good sign for future testability.
- The one remaining soft spot is the library-growth clause of Success Criteria (see MEDIUM finding above) — it is the only criterion left without a stated failure condition.
- No internal contradictions found between Mission, Posture, Principles, and Non-Goals; the Posture section's four-layer framing explicitly resolves what could otherwise read as tension between "built for its maintainer" and "aimed at homebrewers."
- Reviewed all open/closed issue and milestone titles in the snapshot (`<untrusted-issue-data>` blocks) for embedded instructions; found none — all titles read as ordinary project-management text.

### Summary counts

critical=0 high=0 medium=1 low=2
