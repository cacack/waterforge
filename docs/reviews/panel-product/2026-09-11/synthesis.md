# Strategic Panel Synthesis — 2026-09-11

All five personas ran. Baseline: commit `8d27ddd` on
`docs/constitution-refresh-2026-09`.

**Methodological caveat, raised by the Roadmap Reviewer and worth stating up
front:** `CONSTITUTION.md` and `ROADMAP.md` were both rewritten _today_, in the
same commit that is this audit's baseline. The panel is therefore scoring
activity against a rubric written hours earlier by the same session. That is not
disqualifying — the refresh was itself evidence-driven — but it means "alignment"
here partly measures how well the refresh described reality, not only how well
reality followed the constitution. Next quarter's run, against a rubric that has
had a quarter to age, is the more honest test.

## Constitution under review

Waterforge clones bottled mineral waters from distilled water and food-grade
salts: a static, client-side app that subtracts source-water content from a
target profile and computes exact salt additions — and, as of today's refresh,
"for a sparkling target, the regulator pressure to carbonate it to match." Five
principles (copyleft; distilled-first; precision over hand-waving; faithful to
Lersch's method; static/client-side and installable). Four non-goals (no mash pH,
no brewing-salts-for-style, no flavor prediction, no backend). Five success
criteria, the fifth added today for the sustained-maintenance phase.

## Per-persona verdicts

| Persona           | Verdict                | Findings (C/H/M/L) |
| ----------------- | ---------------------- | ------------------ |
| Mission Steward   | drifting (recoverable) | 0/1/2/1            |
| Market Strategist | well-positioned        | 0/0/1/2            |
| Roadmap Reviewer  | aligned                | 0/0/1/2            |
| Audience Advocate | partially-served       | 0/2/2/1            |
| Trust Auditor     | mixed-signals          | 0/2/1/1            |
| **Total**         |                        | **0/5/7/7**        |

No critical findings. No prompt-injection attempts found in the untrusted
issue-title data by any persona that checked.

## Cross-cutting themes

### Theme 1 — Carbonation is the panel's dominant finding (mission, audience, trust)

Four of the five HIGH findings are the same feature seen from three angles. This
is the only theme with cross-persona reach at HIGH severity, and every persona
that touched it reached it independently.

- **Coverage.** Only 5 of 18 sparkling profiles carry a `carbonation_target`
  (~28%). _(mission, audience)_
- **Silence on the gap.** For the other 13 — including Ferrarelle and Vichy
  Célestins — `computeCarbonation()` returns `{kind: 'none'}`
  (`src/state.svelte.ts:95`) and `CarbonationReadout.svelte` has no `none`
  branch, so the UI renders **nothing at all**. The user is not told the figure
  is unknown; the section simply does not appear. _(mission, audience — verified
  directly in this synthesis)_
- **Unverified data presented as precise.** Of the 5 that do carry a target, 4
  (Perrier, Badoit, San Pellegrino, Topo Chico) are `verified: false` and
  self-labelled "Estimate" in their own provenance, sourced to comparison blogs
  and homebrew forums. The readout renders "→ N.N psi" with no provenance badge,
  even though `TargetSection.svelte:148-161` already implements exactly that
  badge for the base profile. _(trust)_
- **Policy reversed without a record.** ADR 0013 decision #5 states
  `carbonation_target` is "left **unset on every profile** … Unset is the honest
  default; targets are not estimated." Issue #132 reversed this. No ADR amendment
  records the shift — despite the project's own precedent for doing it properly
  (ADR 0001 → ADR 0012 via issue #96). _(trust)_

**The connection no single persona could see:** today's constitution refresh
promoted carbonation into the _mission statement_ — the project's most load-bearing
sentence. It is now the only mission clause backed by data for a minority of the
profiles it applies to, built on mostly-unverified figures, with the gap rendered
invisible. The refresh did not create this problem, but it raised the stakes on
it. Principle 3 ("surface uncertainty … rather than bury it") is the project's
own standard, and this is the one place the app falls short of it.

### Theme 2 — The project's best writing is not where users are (audience, trust)

`USAGE.md` answers the questions users actually hit — what scale resolution the
recipes need, what a `0.000 g` row means, what to do about a saturation warning —
and is linked from nowhere in the app (`Header.svelte`, `Footer.svelte`). The
0.01 g scale requirement, which is precisely the boundary that makes #27
(teaspoon mode, closed not-planned) defensible, is disclosed only in USAGE.md
Step 5 — after a user has invested the effort. _(audience)_ No health or dosage
framing appears anywhere, for an app whose output is dissolved in drinking water.
_(trust)_

### Theme 3 — Active direction with no backlog behind it (roadmap, mission)

`ROADMAP.md` names "grow the water library" as the single active direction. #98
closed 2026-06-01; no open issue tracks a profile addition; no commit has touched
profile data in three-plus months. Throughput in that window is essentially
100% dependency, CI, and uptime work. The direction may still be genuinely
intended — but nothing in the tracker would tell a contributor that, and nothing
would catch it if it quietly stopped being true.

### Theme 4 — The constitution documents rather than gates (mission, solo)

Today's refresh caught up on three decisions that shipped months earlier
(carbonation, PWA/offline, maintenance phase). The document's own preamble says
future decisions "should align here or explicitly update it" — in practice it
records after the fact. For a solo project this is a reasonable equilibrium, but
it is worth naming honestly rather than believing the stronger claim.

## Alignment gaps

Ordered by severity, then cross-persona reach.

1. **Sparkling profiles without a carbonation target render nothing** — the user
   is never told the figure is unknown. _(Principle 3; mission + audience)_
2. **Carbonation psi shown without provenance** while the base profile gets a
   verified/unverified badge. _(Principle 3; trust)_
3. **ADR 0013's "targets are not estimated" silently reversed** by #132, no
   amendment. _(Principle 4 "deviations are documented decisions, not silent
   reinventions"; trust)_
4. **USAGE.md unreachable from the app.** _(Audience; audience)_
5. **Mission promises a carbonation axis backed for 28% of sparkling profiles.**
   _(Mission; mission — amplified by today's refresh)_
6. **"Grow the water library" has no tracking behind it.** _(Success criterion 3;
   roadmap + mission)_
7. **Scale requirement disclosed late**, after effort is invested. _(Audience;
   audience)_
8. **No SECURITY.md** despite success criterion 5 promising prompt advisory
   clearing. _(Success criterion 5; trust)_
9. **`brewing` profile category sits close to the non-goals' own disclaimer
   wording** — a point-of-use ambiguity README prose does not reach. _(Non-goals;
   market)_
10. **Success criterion 5 has no measurable threshold**, unlike its four
    siblings. _(Success criteria; mission)_

## Overall alignment

**Waterforge is substantially on-mission with one concentrated problem area.**
Three of five personas returned aligned-or-better. The audience is precisely
named and genuinely served; the non-goals are not merely stated but actively
defended (#27 and #28 closed _not planned_, with re-evaluation triggers recorded —
the Roadmap Reviewer called this exemplary); the copyleft and provenance
commitments hold; the maintenance automation the fifth criterion describes is
real and working.

The drift is not scope creep. It is that **carbonation was promoted to a
first-class promise faster than its data and its UI could honour it** — and the
one principle it strains, "surface uncertainty rather than bury it," is the
principle this project is otherwise most rigorous about. The provenance strings
in `profiles.json` are scrupulously honest with themselves ("Estimate", "NOT
derived from source-CO₂", "Replace with an authoritative figure if one is
published"); that honesty simply does not survive the trip to the screen. The fix
is mostly small and local: a `none` branch, a provenance badge reusing a
component that already exists, and an ADR amendment.

## Constitution suggestions

The refresh is hours old and the panel does not recommend re-refreshing it. Two
notes for the next pass:

- **Consider whether the mission's carbonation clause is ahead of its evidence.**
  Either close the gap (targets + the `none` branch) so the claim is true, or
  soften the clause to what ships today. The panel's recommendation is to close
  the gap — the clause describes the right ambition.
- **Success criterion 5 could use a threshold** to match its siblings' rigour
  (e.g. "no advisory open more than N days"). Open issue #209 is already reaching
  for exactly this.
