# Mission Steward Review — 2026-09-11

**Verdict:** drifting

Waterforge's core mission — precise, reproducible mineral-water clones for homebrewers and water hobbyists, built distilled-first, static/client-side, and copyleft — is genuinely being served: the solver, readouts, saturation warnings, and 54-profile library all trace directly to constitution sections, and the non-goals (no mash-pH tooling, no backend) are actively defended in both code and closed-issue history. The drift here is narrower and more interesting: the constitution itself was just extended today to ratify two features (carbonation matching, installable/offline) and a phase change (sustained maintenance) that had _already shipped_ months earlier — and one of those ratified claims (carbonation matching) is only about a quarter fulfilled by the data behind it, with the UI silently omitting the gap rather than surfacing it. This is recoverable drift, not misalignment, but it's worth treating the refresh as a checkpoint rather than a close-out.

## Findings

**[HIGH] The refreshed mission's carbonation promise is fulfilled for only ~28% of sparkling profiles, and the UI buries the gap instead of surfacing it**

- Constitution section: Mission (refreshed today) — "...and, for a sparkling target, the regulator pressure to carbonate it to match — so anyone can reproduce a named mineral water at home, precisely and reproducibly." Principle 3 — "Surface uncertainty ... rather than bury it."
- Observed evidence: Of 54 profiles, 18 carry `carbonation_style: 'sparkling'`, but only 5 carry a `carbonation_target` (checked directly against `src/lib/profiles/profiles.json`). ADR 0013 records that at the field's introduction (2026-05-31) `carbonation_target` was "left unset on every profile," and issue #132 ("Research and populate carbonation targets for all sparkling profiles," closed COMPLETED 2026-06-01) closed having sourced only 5 of 18 — leaving 13 sparkling profiles (Borsec, Ferrarelle, Farris, Dorna, Saint-Yorre, and 8 others) with no target more than three months later, with no open issue tracking the remainder. Worse, `computeCarbonation()` in `src/state.svelte.ts` returns `{kind: 'none'}` for any sparkling profile without a target, and `CarbonationReadout.svelte` only renders for `kind === 'target'` or `kind === 'still'` — for `kind === 'none'` the carbonation section simply doesn't appear. A user who picks a well-known sparkling water like Ferrarelle sees no carbonation section and no explanation that one is missing, which is the opposite of principle 3's "surface uncertainty" standard already applied elsewhere (e.g. solubility/saturation warnings).
- Gap: The mission text now makes what reads as a general capability claim ("for a sparkling target..."), but the feature is deliverable for roughly 1 in 4 sparkling profiles, and the remaining 3 in 4 fail silently rather than visibly.
- Suggested action: Either (a) add a visible "carbonation target not yet sourced" state to `CarbonationReadout.svelte` for `kind === 'none'` on sparkling profiles, closing the principle-3 gap in code, or (b) soften the mission clause to something conditional ("...where a bottled carbonation target is sourced...") until coverage is broader, and open a tracked issue to continue the #132 backfill rather than leaving it implicitly closed.

**[MEDIUM] "Grow the water library" is framed as active direction but has had zero throughput for 3+ months**

- Constitution section: Success Criteria — "A browsable library of sourced target profiles ships ... It grows opportunistically." ROADMAP.md — "Grow the water library ... is open-ended by nature" is listed under "Active direction."
- Observed evidence: The last profile-related closed issues are #126–#132 and #98, all closed 2026-05-31/06-01. Every one of the last 40 commit subjects and all issues closed since then (#210, #205, #204, #194, #192, #211, #208, #207, #206, #203, #199, #198, #200, #196, #197, #202, #195, #178) is dependency, CI, docs, or site-health work — none touch `profiles.json` or add a profile. The two currently open issues (#212, #209) are also non-library (a doc typo and a Dependabot alerting gap).
- Gap: The audience this project names — "hobbyists who want to match a specific drinking-water profile" — depends on the library growing to stay useful for new requests, but the roadmap's "active direction" label overstates momentum that has actually stopped since the maintenance phase began. This may be perfectly healthy (opportunistic growth genuinely means bursty, not steady), but as written it reads as ongoing work when it is currently idle.
- Suggested action: Either reopen/track a concrete profile-request issue to demonstrate the direction is still live, or reword ROADMAP.md's "Active direction" to acknowledge library growth is currently dormant pending requests, distinguishing it from the genuinely active maintenance work.

**[MEDIUM] The constitution is being refreshed reactively, months after the decisions it now ratifies — worth asking whether refresh replaced review**

- Constitution section: Preamble — "When in conflict with this document, future decisions should align here or explicitly update it."
- Observed evidence: Per `docs/reviews/constitution/2026-09-11-drift.md`, the constitution's prior refresh was 2026-05-31 — the same window in which carbonation modelling (#121–#132) began shipping, meaning the document was already stale within days of its own refresh. Today's refresh (commit 8d27ddd) then caught up on three separate already-shipped items at once: the carbonation axis (shipped ~2026-05-31 to 06-01), installable/offline delivery via `vite-plugin-pwa` (shipped per #26, closed 2026-05-31), and the maintenance-phase framing (true since ROADMAP.md's v1.5.0 feature-complete declaration, itself dated before today). In each case the document is being updated to describe what already happened, not consulted beforehand to decide whether it should happen.
- Gap: The preamble's "align here or explicitly update it" is technically satisfied (the document was explicitly updated), but a 3+ month lag across three simultaneous catch-up edits suggests the constitution functions as an after-the-fact record rather than a decision gate. That's a lower-stakes failure mode when the shipped decisions turn out to be sound (as these do — see "Sections still accurate" in the drift report), but it means the constitution isn't doing the job its own preamble claims for it.
- Suggested action: No content change needed here — this is a process observation, not a content one. Consider a lighter-weight, more frequent refresh cadence (e.g., alongside minor version bumps) so extensions to mission/principles are proposed closer to the decision rather than batched quarterly.

**[LOW] Success criterion 5 ("sustained maintenance") has no way to fail — it's a description, not a test**

- Constitution section: Success Criteria #5 (new) — "Once feature-complete, it stays that way: the site is up, dependencies stay current, and security advisories are cleared promptly — a released version is always installable and correct."
- Observed evidence: There's no stated threshold (how promptly is "promptly"? what counts as "current"?) and no linkage to a metric — contrast with criterion 1's concrete "≥6 decimal places (golden-test verified)." The daily site-health workflow and Dependabot automerge give this criterion real teeth in practice, but the text itself can't be scored against, only vibes-checked.
- Gap: This is a constitution-health note more than a mission-alignment failure — the underlying behavior (site-health.yml, dependabot-automerge.yml, #209 tracking unactioned-vulnerability alerts) is genuinely present and working. The criterion just doesn't name a number the way its sibling criteria do.
- Suggested action: Optional — if this criterion is to carry real weight in future reviews, consider adding a concrete bound (e.g., "security advisories addressed within N days of disclosure").

## Constitution health

- The refreshed document is otherwise well-specified and testable — Mission, Audience, Principles, and Non-Goals all cite concrete, checkable claims, which is not always true of constitutions of this kind. Success Criteria #5 is the one exception (see LOW finding above): it's the only criterion without a measurable threshold.
- No internal contradictions found between the five principles or between principles and non-goals; the carbonation extension (mission) and the installable/offline extension (principle 5) are consistent with each other and with the non-goals (carbonation math stays physics, not flavor prediction — ADR 0013 is explicit about this).
- Scanned all open and recently-closed issue titles in the snapshot for embedded instructions or prompt-injection attempts (issue titles are attacker-controllable); found none. All titles read as ordinary, human-authored issue/PR summaries.

### Summary counts

critical=0 high=1 medium=2 low=1
