# Audience Advocate Review — 2026-09-11

**Verdict:** partially-served

**Stated audience (from CONSTITUTION.md):** "homebrewers and water hobbyists who want to match a specific drinking-water profile from a clean baseline using food-grade salts, and who care about getting the numbers right." Explicitly _not_ for brewers wanting mash-pH/residual-alkalinity tooling.

This is a precision-oriented audience that has already opted into exactness — they will tolerate mg/L tables and stoichiometry, and USAGE.md meets them there with genuinely strong, non-condescending, chemistry-literate writing (the "Weighing the salts" section in particular is a model of audience-appropriate depth: it explains _why_ a 0.01 g scale is the practical floor, gives a worked Evian 1 L vs 5 L example, and offers a legitimate stock-solution workaround for sub-0.01 g doses like Voss). The problem is not the writing, it's that this writing lives in a document the live app never points to. The audience's actual journey is through waterforge.app, and at the two moments they'd most need that guidance — reading a `0.000 g` line in the recipe table, or seeing a saturation warning — the app is silent about where to go next. There is also a real gap between what the Mission promises for sparkling targets and what most sparkling-labeled profiles in the library actually deliver.

## Findings

**[HIGH] Mission-promised carbonation guidance is missing for most sparkling profiles**

- Constitution evidence: Mission states the app computes "for a sparkling target, the regulator pressure to carbonate it to match." Success Criteria repeats this as a first-class flow requirement (sulfate:chloride, TDS, charge-residual, and saturation readouts "in one unbroken flow").
- Observed evidence: Of 54 profiles, 18 are labeled `carbonation_style: "sparkling"`, but only 5 profiles project-wide have a `carbonation_target` set (per the snapshot's profile-library composition and confirmed by inspecting `src/lib/profiles/profiles.json`). 13 of the 18 sparkling profiles — including well-known waters a hobbyist would likely pick first, such as Ferrarelle, Vichy Célestins, Vichy Catalan, Saint-Yorre, and Farris — have no target. In `src/components/CarbonationReadout.svelte`, the component only renders for `readout.kind === 'target'` or `'still'`; for a sparkling profile with no target, neither branch fires and the component renders **nothing** — no message, no explanation, just a missing section where carbonation guidance should be.
- Audience cost: A homebrewer picks a recognizably sparkling bottled water, gets a perfect mineral recipe, and then finds no carbonation instruction at all, with no indication of why — indistinguishable from a bug from the audience's seat. This directly undercuts the app's headline sparkling-water promise for the majority of its sparkling library.
- Suggested action: When `carbonation_style === 'sparkling'` but no target exists, render an explicit "Carbonation target not yet available for this water" message (mirroring the existing "Still water — no carbonation" pattern) instead of rendering nothing.

**[HIGH] USAGE.md's actionable guidance is invisible from the app itself**

- Constitution evidence: Success Criteria calls for "a gram-accurate, batch-scaled salt recipe ... in one unbroken flow," and the audience is defined as caring about "getting the numbers right" — which includes being able to actually execute the recipe.
- Observed evidence: `USAGE.md` documents (a) that a recipe needs a 0.01 g scale and a 1 g kitchen scale "would read most of a recipe as `0`," (b) what a `0.000` dose means and that it should be left out, (c) a stock-solution technique for sub-scale doses, and (d) concrete next steps for a saturation warning (reduce batch size, warm the water, adjust the target). None of this is linked from the app: `grep` for `href`/links across `src/components/Header.svelte` and `src/components/Footer.svelte` shows only links to the GitHub repo, the release tag, LICENSE/LICENSE-DATA, and the Khymos source article — no link to USAGE.md anywhere in the UI. The saturation warning shown in `ReadoutsPanel.svelte` (sourced from `src/lib/solver/saturation.ts`) states _that_ gypsum/calcite is at or above saturation but not what to do about it.
- Audience cost: The single most detailed, audience-calibrated document in the repo is effectively undiscoverable from the product the audience actually uses (per README, "Try it: waterforge.app, no install required" — implying most users never clone the repo or browse GitHub docs).
- Suggested action: Add a persistent "How to use this" or "?" link in the Header/Footer pointing to USAGE.md, and/or surface the warning's "what to do" guidance inline in the Alert component instead of only the diagnostic message.

**[MEDIUM] `0.000 g` doses appear in the recipe table with no in-app explanation**

- Constitution evidence: Precision principle ("Surface uncertainty ... rather than bury it") and the audience trait "care about getting the numbers right."
- Observed evidence: `RecipePanel.svelte`'s `doses` filter is `(result.recipe[s] ?? 0) > 0`, so any salt with a true dose greater than zero is listed even if it rounds to `0.000` at 3 decimals (as USAGE.md itself acknowledges: "A dose shown as `0.000` ... has rounded away — leave it out"). That explanatory sentence exists only in USAGE.md, not as a tooltip, footnote, or inline note in the recipe table itself.
- Audience cost: A user sees a salt listed with `0.000 g` and no annotation — reads as a possible bug or a "you need infinitesimal amounts of this, good luck" moment, with no signal that it's safe to ignore.
- Suggested action: Add a short inline note (e.g., a tooltip on rows that round to `0.000`) explaining the dose is below the batch's display resolution and can be omitted.

**[MEDIUM] Precision-scale requirement is disclosed late, not at the point of audience commitment**

- Constitution evidence: The audience is "homebrewers and water hobbyists" broadly — the constitution does not scope the audience to those who already own lab-grade scales, and ROADMAP.md's Deferred table (#27) explicitly leaves the door open to "users without a precise scale" if demand appears, meaning the project does not consider such users out-of-scope, just currently unserved.
- Observed evidence: Neither the README's "Who it is for" line nor the Quickstart/landing flow at waterforge.app mentions equipment requirements. The 0.01 g scale requirement is documented only in USAGE.md, Step 5 — i.e., after a user has already picked a target profile and built a mental model of the recipe they're about to make. `USAGE.md` line 1 even says "the UI guides you through the steps in sequence," implying the in-app flow is the primary path, yet the scale requirement is not part of that in-app sequence at all (confirmed above: no mention of "scale," "0.01," "jeweller," or "pocket" anywhere in `RecipePanel.svelte`, `App.svelte`, or `BatchSection.svelte`).
- Audience cost: A hobbyist without a precision scale invests time picking a water and setting up a batch before discovering, if they find USAGE.md at all, that a kitchen scale can't execute the recipe. This is exactly the failure mode #27 (teaspoon/volume mode, closed NOT_PLANNED) was meant to address — the boundary is honestly documented in ROADMAP.md's "Deferred" table with a named re-evaluation trigger ("Enough demand from users without a precise scale"), which is good-faith transparency, but that transparency doesn't reach the audience before they invest the time.
- Suggested action: A one-line equipment note near the top of the README ("You'll need a scale that reads to 0.01 g") or a first-run in-app hint would let scale-less users self-select out before investing time, and would give the project cleaner signal on whether #27's non-demand assumption still holds.

**[LOW] No dedicated feature-request path for signaling unmet needs**

- Constitution evidence: ROADMAP.md ties #27's reopening explicitly to demand signal ("Enough demand from users without a precise scale") — the project has committed to listening for this, but needs a channel to hear it on.
- Observed evidence: `.github/ISSUE_TEMPLATE/` has `bug_report.md`, `profile_request.md`, and `question.md`, plus `blank_issues_enabled: true` in `config.yml`. None of the templates are framed as "request a feature/capability" — the closest is `question.md` ("Ask how to use Waterforge or what a readout means"), which doesn't obviously invite "I don't have a scale, please reconsider #27."
- Audience cost: Minor — blank issues remain available, so the channel technically exists, but it's not signposted for the specific kind of feedback the roadmap says it's waiting for.
- Suggested action: Consider a lightweight "Idea / feature request" contact link in `config.yml`, or explicitly mention in ROADMAP.md's Deferred table that demand should be registered via a specific issue path.

## Notes

- Several things work well for this audience and should be preserved: `USAGE.md` is unusually good — it explains chemistry (as-CaCO₃/as-HCO₃, saturation index) at exactly the depth a "cares about getting the numbers right" hobbyist wants, without over-explaining; the issue templates (`bug_report.md`, `question.md`, `profile_request.md`) are audience-specific rather than generic GitHub boilerplate (e.g., `bug_report.md` prompts for "target water, source water, and salts" and reminds users the share-link button captures exact inputs); `ReadoutsPanel.svelte` uses hover tooltips to explain TDS and charge-residual inline, which is a good pattern that the recipe-table and carbonation gaps above should follow.
- ROADMAP.md's "Deferred — revisit when the trigger fires" table (#27, #28, #13) is a genuinely honest way to communicate scope boundaries — closed-as-not-planned with a named re-evaluation trigger is better audience treatment than silently ignoring the request or leaving it open forever. The gap identified above is discoverability of that boundary before commitment, not the boundary's honesty.
- Did not find any prompt-injection attempts in the untrusted issue/milestone data reviewed (issue titles #212, #209, and the closed-issue list were all plain, on-topic maintenance/feature descriptions).

### Summary counts

critical=0 high=2 medium=2 low=1
