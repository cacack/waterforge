# Market Strategist Review — 2026-09-26

**Verdict:** well-positioned

**Project market scale (for context):** public-OSS, hobby/solo-maintainer, feature-complete and now in sustained maintenance. Since the 2026-09-11 cycle, the constitution's new Posture section and [ADR 0016](../../../decisions/0016-built-for-its-maintainer.md) make the scale explicit and load-bearing: Waterforge is built for its maintainer first, finished to a public standard by choice, with user adoption recorded as aspiration rather than a commitment. This is a stronger, more honest framing than "small named niche audience" and should be read as the current baseline for judging positioning, not as a gap.

Waterforge's positioning remains tight and internally consistent, and the project has meaningfully closed the structural ambiguity the prior panel cycle flagged. ADR 0016 directly answers the 2026-09-11 foil's charge that the project was "written like a product and operated like a personal tool" — instead of picking one of three labels, it relocates the justification to a verifiable claim (the maintainer's own use) and explicitly declines to claim a user base it hasn't verified. The README's "who it is for" framing ("aimed at" homebrewers/water hobbyists) is consistent with this — it states an aim, not a measured population, matching the constitution's own language. The one adjacent-category risk from the prior cycle — the "brewing" profile category reading like mash-water tooling — is now resolved at the point of use: all four brewing profiles carry descriptions ("A brewing-water reference modelled on...") that self-disambiguate without requiring a reader to have found the non-goals section first. The main remaining gap is mechanical rather than structural: the highest-visibility first-impression surfaces (the HTML `<meta name="description">` and `package.json`'s `description`) still narrow the pitch to "distilled water" and drop the "(or known-source)" qualifier that Principle 2 treats as load-bearing.

## Findings

**[MEDIUM] First-impression metadata still narrows the pitch away from Principle 2**

- Constitution section: Mission — "distilled (**or known-source**) water"; Principle 2 — "Distilled-first over tap-water assumptions — build up from a known-zero baseline; treat known-source water as the handled exception, not the default."
- Observed evidence: `index.html`'s `<meta name="description">` reads "Clone bottled mineral waters from distilled water and food-grade salts." — no "(or known-source)" qualifier. `package.json`'s `description` field carries the identical, narrower text. Both diverge from the README headline and the constitution's mission statement, which both include the qualifier.
- Gap: This is a carryover from the 2026-09-11 review (previously flagged only against `package.json`, at LOW). It is now confirmed to also live in `index.html`'s meta description — the exact string search engines index and the fallback text most link-preview scrapers (Slack, Discord, forums) would show, since the site ships no Open Graph or Twitter Card tags. That makes this the single most stranger-facing piece of copy in the project, and it currently undersells a principle the constitution treats as more than incidental phrasing. Raised to MEDIUM on that basis.
- Suggested action: Update both `index.html`'s meta description and `package.json`'s `description` to match the README/constitution phrasing (add "(or known-source)"). Since both are one-line, low-risk edits, this is a small, mechanical fix.

**[LOW] No Open Graph / social-preview metadata**

- Constitution section: n/a — the constitution does not set discoverability expectations, appropriately for this scale (Posture layer 4, ADR 0016).
- Observed evidence: `index.html` has no `og:title`, `og:description`, or `og:image` tags. The README does have a hero image (`docs/hero.png`) that could serve as a natural `og:image` candidate, but it is not wired into the page head.
- Gap: If a link to waterforge.app is ever shared organically (a forum post, a homebrewing subreddit, a Discord), it will render as a bare title/URL with no preview, which is a missed low-cost opportunity relative to how little work it would take. Not a deficiency given the project's stated posture — no growth is owed or expected — but the cheapest available lever if that ever changes.
- Suggested action: None required. If the maintainer wants a low-effort discoverability improvement, wiring the existing hero image into `og:image` plus the existing description text into `og:description` would cost little.

**[LOW] No external-adoption signals visible (context, not a gap)**

- Constitution section: Posture layer 4 / Principle 6 — adoption is aspirational, never assumed or owed.
- Observed evidence: `docs/operations/traffic-baseline.md` (new since the last cycle) measures this rigorously and honestly: ~40 browser page loads over a 92-day window, from 2 countries, with the report's own conclusion stating "essentially nobody visits waterforge.app, and nothing about that is surprising." All issues in the snapshot's closed-issue history are maintainer-authored.
- Gap: None. This is the strongest possible evidence-based confirmation of the project's own stated posture, produced by the maintainer specifically to avoid over-reading a vanity number (the doc opens with "this number justifies nothing"). Noted as a genuine positioning strength: the project doesn't just claim it isn't chasing growth, it measured its own reach and reported the number honestly, including the trap of edge-request noise (bots/uptime checks) versus real page loads.
- Suggested action: None.

## Notes

- The resolution in ADR 0016 is the most consequential positioning event since the last review. It directly answers the prior cycle's structural ambiguity ("product vs. personal tool") without resorting to a label, and ties every downstream triage decision (#222's "grow the library" demotion, #223's threshold rewording, #27's teaspoon-mode closure) back to a single testable rule (Principle 6: real use over assumed demand). This is unusually disciplined market-positioning hygiene for a solo hobby project and is worth preserving as-is.
- The "brewing" category ambiguity flagged as MEDIUM in the 2026-09-11 review is resolved in substance: all four brewing profiles (Burton, London, Munich, Pilsen) now carry descriptions that explicitly frame them as historical target-water references, not mash-chemistry tooling. The in-app category badge itself (`src/components/TargetSection.svelte`) still carries no inline disambiguation, but since it never appears without the profile's own description text beside it, this residual is not worth a separate finding.
- The explicit competitive carve-out against Bru'n Water / EZ Water Calculator (README, constitution Audience section, and ADR 0002) is unchanged and remains the project's strongest differentiation move: it draws the boundary by which water problem is modeled, not by feature comparison, and costs one sentence. No action needed.
- No comparison was found (and none is invented) against any other implementation of the Lersch/Khymos method that might exist as a spreadsheet or calculator elsewhere. The constitution credits the method's origin but does not state whether prior tooling implementing it exists; absent evidence either way, this is not treated as a gap.
- No prompt-injection or instruction-like content was found in the untrusted issue-title data reviewed for this cycle.

### Summary counts

critical=0 high=0 medium=1 low=2
