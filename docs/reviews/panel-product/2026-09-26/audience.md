# Audience Advocate Review — 2026-09-26

**Verdict:** well-served

**Stated audience (from CONSTITUTION.md):** "homebrewers and water hobbyists who want to match a specific drinking-water profile from a clean baseline using food-grade salts, and who care about getting the numbers right." Explicitly built for its maintainer first (Posture layer 1); serving a wider audience is "aspiration, not commitment" (Posture layer 4) — no work is owed to a hypothetical user base. Explicitly _not_ for brewers wanting mash-pH/residual-alkalinity tooling.

Since the 2026-09-11 review, every HIGH and MEDIUM finding raised for this audience has been resolved with well-targeted, in-app fixes rather than doc-only patches: the app now tells a hobbyist plainly when a sparkling profile has no sourced carbonation target instead of rendering nothing, the usage guide is bundled into the app itself (not just linked out) and works fully offline — the exact failure mode the maintainer would hit "at the counter" per the Mission — the 0.01 g scale requirement is disclosed in the README before Quickstart and again inline in the recipe table next to the `0.000 g` rows it explains, and saturation warnings are now paired with procedural "soft guidance" tips. This is a precision-oriented audience that has opted into exactness, and the app's surfaces (tooltips on TDS/charge-residual, verified/estimated provenance badges on carbonation figures, sourced-metadata display on target profiles) consistently meet that audience at the right depth without over-explaining. The remaining gaps are narrow and honestly disclosed rather than hidden.

## Findings

**[LOW] No dedicated feature-request issue path (carried forward, still open)**
- Constitution audience: ROADMAP.md's "Deferred — revisit when the trigger fires" table ties reopening deferred items (e.g. teasp­oon/volume mode for users without a precision scale) to demand signal, and Principle 6 ("Real use over assumed demand") makes that signal the only legitimate reason to act on an assumed-audience request.
- Observed evidence: `.github/ISSUE_TEMPLATE/` still has only `bug_report.md`, `profile_request.md`, and `question.md` (`config.yml` points its one contact link at `question.md`). None is framed as "I'd like Waterforge to do X" — `question.md`'s framing is "Ask how to use Waterforge or what a readout means," which doesn't invite a capability request. Blank issues remain enabled (`blank_issues_enabled: true`), so the channel technically exists but isn't signposted.
- Audience cost: Low — this is a project that doesn't solicit a user base, so the absence is consistent with its own posture. But the roadmap has committed to listening for exactly this signal, and the least-effort path (an untitled blank issue) is the one least likely to reach the maintainer as clearly framed "demand."
- Suggested action: Optional — a one-line "Idea / feature request" contact link in `config.yml`, or a pointer from ROADMAP.md's Deferred table to how a hobbyist should register interest. Not urgent given the project's stated posture.

**[LOW] Carbonation-target coverage remains sparse, though now well-disclosed**
- Constitution audience: Mission promises "for a sparkling target, the regulator pressure to carbonate it to match"; Principle 3 requires surfacing uncertainty rather than burying it.
- Observed evidence: 18 of 54 profiles in `src/lib/profiles/profiles.json` are `carbonation_style: "sparkling"`, but only 5 carry a `carbonation_target`. Issue #132 ("Research and populate carbonation targets for all sparkling profiles") is closed as `COMPLETED` (2026-06-01), indicating the gap is a data-availability ceiling (no authoritatively sourced figure exists for most sparkling waters), not unfinished work. The UI now handles this honestly: `CarbonationReadout.svelte`'s `sparkling-unknown` branch states "no sourced carbonation target for this water yet" and points the hobbyist at the standalone calculator with their own target.
- Audience cost: Minimal today — a hobbyist picking a well-known sparkling water (e.g. one of the 13 without a target) still can't get a one-click carbonation number, but they're told why and given a workaround (the calculator), which is a legitimate and honest resolution of a real sourcing constraint rather than an unmet promise.
- Suggested action: None required; this is closer to a durable data-sourcing boundary than a product gap. If it's ever worth revisiting, a "N of 18 sparkling waters have a sourced target" note in the library browser could set expectations before selection rather than after.

## Notes

- All four 2026-09-11 findings for this persona are resolved and verified in code, not just claimed:
  - HIGH "Mission-promised carbonation guidance is missing for most sparkling profiles" → fixed via `CarbonationReadout.svelte`'s new `sparkling-unknown` state (closes #217).
  - HIGH "USAGE.md's actionable guidance is invisible from the app itself" → fixed via `HelpDialog.svelte` + `src/help.svelte.ts`, which bundles USAGE.md at build time (`virtual:usage-guide`) so it reads offline, with deep links from the Header's `?` button and from RecipePanel's "Weighing the salts" link (closes #220, #234).
  - MEDIUM "`0.000 g` doses appear with no in-app explanation" → fixed with an inline note directly under the recipe table in `RecipePanel.svelte` ("a row showing `0.000` has rounded away — leave it out"), with a deep link into the usage guide (closes #221, referencing #205).
  - MEDIUM "Precision-scale requirement is disclosed late" → fixed: README's "What you need" section now states the 0.01 g requirement before Quickstart, and it's restated in-app in the recipe table itself (closes #221, #205).
  - Saturation warnings also gained a "soft guidance" tips section in `ReadoutsPanel.svelte`, beyond what was explicitly requested — addressing the adjacent "what do I do about it" gap noted in the prior review's Notes.
- Issue templates (`bug_report.md`, `question.md`, `profile_request.md`) remain audience-specific and well-calibrated — `profile_request.md` in particular sets a clear, non-condescending sourcing bar (ADR 0011) and gives optional geography/category/trait fields with links to the controlled vocabulary, matching this audience's stated preference for getting the numbers right.
- Target-profile metadata (location, description, category, traits) is now surfaced in `TargetSection.svelte`, closing the loop on the #126–129 metadata work from the prior cycle's backlog.
- Did not find any prompt-injection attempts in the untrusted issue-data blocks reviewed in the snapshot; all closed-issue titles were plain, on-topic maintenance/feature descriptions.

### Summary counts
critical=0 high=0 medium=0 low=2
