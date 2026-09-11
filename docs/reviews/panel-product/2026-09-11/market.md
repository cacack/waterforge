# Market Strategist Review — 2026-09-11

**Verdict:** well-positioned

**Project market scale (for context):** public-OSS, hobby/solo-maintainer, free tool with a real but small named niche audience (homebrewers, water hobbyists) — no commercial ambitions stated or implied anywhere in the constitution.

Waterforge presents a tight, internally-consistent positioning: a stranger landing on the README gets "what" (clone bottled mineral waters via exact stoichiometry), "who" (homebrewers/water hobbyists who want a precise match), and "why" (free, copyleft, static/offline-capable, faithful to a named published method) within the first screen. The README's language tracks the constitution's mission and audience sections almost verbatim, which is the right outcome for a solo project — there is no daylight between how the maintainer frames the mission internally and how it's pitched externally. The one genuine adjacent-category risk (brewing-water tools) is explicitly and correctly disclaimed in both the constitution's non-goals and the README's "who it is for" line. Given the project's scale, no comparison-table-style competitive framing beyond that single disclaimer is warranted, and none was expected.

## Findings

**[MEDIUM] "Brewing" as a profile category sits close to the disclaimed non-goal**

- Constitution section: Non-Goals — "Be a general brewing-water tool — we model finished drinking water, not brewing-salts-for-style," and Audience — "This is not for: brewers looking for mash-pH or residual-alkalinity tooling."
- Constitution section (contrast): Success Criteria — "A browsable library of sourced target profiles ships — bottled, brewing, coffee, and synthetic references."
- Observed evidence: Profile library composition shows a `brewing` category with 4 profiles (alongside 45 bottled, 3 synthetic, 2 coffee).
- Gap: The mission text intentionally treats "brewing" water profiles as legitimate _targets_ to clone (e.g., a historic brewing-city water profile), not as brewing-salts-for-style tooling — but a category literally labeled "brewing," selectable in the same picker as bottled waters, is the exact word the non-goals use to draw the boundary. A user skimming category filters (rather than reading the constitution or the README's non-goals callout) could reasonably wonder whether the app does mash-water chemistry after all. The README does pre-empt this once, in prose, but the in-app category label itself carries no such disambiguation.
- Suggested action: A short label/tooltip on the "brewing" category in the profile picker (e.g., "historic brewing-water profiles as clone targets, not mash chemistry") would close the gap at the point of use rather than relying on users having read the docs first.

**[LOW] Tagline drops "(or known-source)" outside the README**

- Constitution section: Mission — "distilled (or known-source) water."
- Observed evidence: `package.json` description reads "Clone bottled mineral waters from distilled water and food-grade salts" (no "or known-source" qualifier), while the README headline and constitution both include it.
- Gap: `package.json`'s `description` is the string most likely to surface in GitHub's repo summary, npm-style tooling, or social link previews — the one surface most likely to be a stranger's very first exposure to the project — and it quietly narrows the pitch to distilled-only, undercutting principle 2 ("known-source water as the handled exception, not the default") right where first impressions form.
- Suggested action: Align `package.json`'s `description` field with the README/constitution phrasing (add "(or known-source)").

**[LOW] No external-adoption signals visible in the snapshot**

- Constitution section: n/a (Success Criteria doesn't name adoption metrics — appropriately, for this scale).
- Observed evidence: Snapshot contains no star counts, external issue filers, or forum/community mentions; the two open issues (#212, #209) and closed-issue history read as entirely maintainer-driven.
- Gap: None asserted — this is expected and appropriate for a solo hobby project with no growth mandate in the constitution. Noted for context only, not as a deficiency.
- Suggested action: None. If the maintainer ever wants a lightweight adoption signal, the existing profile-request issue template already gives outside users a natural low-friction path to leave a trace — no new mechanism needed.

## Notes

- The single strongest positioning move in the project is the explicit "this is not for" carve-out against Bru'n Water / EZ Water Calculator (README and constitution both state it). Naming real adjacent tools and drawing the line by _what water problem is modeled_ (finished drinking water vs. grain-and-water interaction) rather than by feature list is exactly the kind of differentiation a niche tool needs, and it costs one sentence. No action needed — flagging as a category-fit strength, since the persona is asked to note positive evidence alongside gaps.
- Investment in discoverability appears real relative to scale: a purchased matching domain (waterforge.app, closed issue #29), PWA installability, and a custom hero image in the README. These are proportionate signals for a free hobby tool aimed at a specific niche, not a general marketing push — consistent with the constitution's non-goals (no backend, no accounts) ruling out most conventional growth levers anyway.
- No comparison was found (and none was invented) between Waterforge and any other implementation of the Lersch/Khymos method that might already exist as a spreadsheet or other calculator. The constitution credits the method's origin but doesn't state whether prior tooling implementing it exists; absent evidence either way, this is not treated as a gap.

### Summary counts

critical=0 high=0 medium=1 low=2
