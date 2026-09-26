# Strategic Panel Synthesis — 2026-09-26

## Constitution under review

Waterforge turns distilled (or known-source) water and food-grade salts into
precise recipes for named mineral waters, crediting the Lersch/Khymos method.
Since ADR 0016 (2026-09-11) its Posture is explicit: built for its maintainer
first, finished to a public standard by choice, with a wider audience of
homebrewers and water hobbyists recorded as aim, not commitment. Principle 6
("real use over assumed demand") is the test for whether effort is justified.
The project is feature-complete and in sustained maintenance. Success Criterion 5
carries numeric maintenance thresholds (ADR 0017), and library growth is
"opportunistic — no backlog is maintained" (`ROADMAP.md`).

## Per-persona verdicts

| Persona           | Verdict         | Findings (C/H/M/L) |
| ----------------- | --------------- | ------------------ |
| Mission Steward   | aligned         | 0/0/1/2            |
| Market Strategist | well-positioned | 0/0/1/2            |
| Roadmap Reviewer  | aligned         | 0/0/1/2            |
| Audience Advocate | well-served     | 0/0/0/2            |
| Trust Auditor     | trustworthy     | 0/0/1/1            |

Totals: 0 critical, 0 high, 4 medium, 9 low. All HIGH and MEDIUM findings from
the 2026-09-11 run were verified resolved in code or in ADRs, not only closed as
issues.

## Cross-cutting themes

1. **The honest posture hasn't reached stranger-facing surfaces yet**
   (mission, market, trust, audience). ADR 0016 rewrote Audience and Posture,
   but the copy a stranger actually sees still predates it:
   - The Mission sentence says "so anyone can reproduce" (mission, LOW).
   - `index.html`'s meta description and `package.json` drop "(or known-source)"
     (market, MEDIUM).
   - README "Getting help" and the issue templates invite reports without the
     best-effort caveat that `SECURITY.md` states (trust, MEDIUM).
   - There is no signposted way to register demand for Deferred items, even
     though `ROADMAP.md` waits on that signal (audience, LOW).

   The substance is right; the fix is copy.

2. **Review cadence has become the backlog's engine** (roadmap, mission). About
   half of this cycle's closed issues trace to the 2026-09-11 product panel or
   the 2026-09-26 engineering panel (roadmap, MEDIUM). Both constitution
   rewrites were triggered by reviews rather than noticed independently
   (mission, LOW). This doesn't violate Principle 6, since commissioning a
   review is the maintainer's own choice. But it isn't named as a deliberate
   input anywhere, and this run is itself an instance of the pattern.

3. **Dormant criteria can't be told apart from abandoned ones** (mission,
   roadmap, audience). There are three cases:
   - Library growth has no failure condition (mission, MEDIUM).
   - Milestones are fully retired, so the tracker shows nothing to a stranger
     who skips `ROADMAP.md` (roadmap, LOW).
   - Carbonation coverage is stuck at 5 of 18 sparkling profiles, now honestly
     disclosed (audience, LOW).

   Each is defensible on its own. Together they mean "quiet" and "stalled" look
   identical from outside.

## Alignment gaps

1. **[MEDIUM] Stranger-facing metadata narrows the pitch away from Principle 2.**
   `index.html` meta description and `package.json` omit "(or known-source)".
   Constitution: Mission and Principle 2. Flagged by: market (theme 1).
2. **[MEDIUM] Support posture is stated only in `SECURITY.md`.** README
   "Getting help" and the templates promise nothing, but they don't say so
   either. Constitution: Posture layer 4 and Principle 6. Flagged by: trust
   (theme 1).
3. **[MEDIUM] Review-driven work isn't recorded as a chosen, bounded input.**
   Constitution: Principle 6 and "How intent is recorded". Flagged by: roadmap,
   mission.
4. **[MEDIUM] The library-growth success criterion is unfalsifiable.** It is
   frozen at 54 profiles with no profile work since #98 (2026-06-01).
   Constitution: Success Criteria. Flagged by: mission, audience (demand-path
   LOW).
5. **[LOW] Mission's "anyone" wording lags Posture.** Constitution: Mission.
   Flagged by: mission.
6. **[LOW] No feature-request or demand path for Deferred items.** Constitution:
   `ROADMAP.md` Deferred triggers and Principle 6. Flagged by: audience.
7. **[LOW] Success Criterion 5 isn't gradeable until the December 2026 window
   closes.** Constitution: Success Criteria. Flagged by: roadmap.
8. **[LOW] No Open Graph or social-preview tags.** This is scale-appropriate.
   Constitution: n/a. Flagged by: market.

## Overall alignment

Waterforge is on-mission. Every direction-setting gap from the prior cycle was
closed with a documented decision (ADRs 0015–0018), and all activity since then
has been maintenance that Success Criterion 5 explicitly calls for. No non-goal
was touched. The remaining drift is not in what the project does but in how
consistently it describes itself: the constitution became candid on 2026-09-11,
and a handful of stranger-facing strings haven't caught up. The one structural
observation is that periodic panels now supply most of the backlog. That is
healthy while the app is quiet, but it should be a named choice rather than an
emergent habit. It also means this synthesis should not generate more work than
the findings warrant.

## Constitution suggestions

Refresh is **not recommended** this cycle. Two optional one-sentence edits could
ride along with any future touch:

- Give the library-growth criterion a failure condition, or explicitly declare
  that it has none by design (gap 4).
- Soften "so anyone can reproduce" in the Mission to match Posture (gap 5).

Doing a third reactive rewrite on the back of a panel would itself feed theme 2.
Prefer small amendments via ADR, or leave them.

## Notes

- The snapshot's tag list was stale because local tags hadn't been fetched.
  `v1.10.2` exists on origin and matches `package.json` and `CHANGELOG.md`
  (trust, LOW). This is a snapshot artifact, not a project gap.
- No prompt-injection content was found in the untrusted issue data (all
  personas).
