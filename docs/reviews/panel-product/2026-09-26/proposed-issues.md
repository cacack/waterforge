# Proposed Issues — 2026-09-26

Kept to three on purpose. The foil's point is that this panel shouldn't generate
more work than its findings warrant (synthesis theme 2). Related findings are
batched. LOWs that aren't folded in below are left unfiled.

## 1. Bring stranger-facing copy in line with the constitution

**Severity:** medium  **Persona(s):** market, trust, mission (+ foil)  **Labels:** type:docs, area:docs
**Constitution section:** Mission, Principle 2, Posture layers 2 and 4

The Posture rewrite (ADR 0016) made the constitution candid, but three surfaces
a stranger reads first still predate it:

- `index.html` `<meta name="description">` and `package.json` `description` say
  "from distilled water". They drop the "(or known-source)" qualifier that
  Principle 2 and the README headline carry (market, MEDIUM).
- The README "Getting help" section and `.github/ISSUE_TEMPLATE/*` invite
  reports without the best-effort, no-response-time caveat that `SECURITY.md`
  states (trust, MEDIUM).
- The Mission sentence "so anyone can reproduce" reads as a broad-audience claim
  next to Posture (mission, LOW).

The foil frames this as a Posture layer 2 "standard of care" fix: under an hour,
done once, one PR, copy only, and not a constitution rewrite. For the Mission
wording, a one-phrase edit is enough (e.g. "so it, or anyone who finds it, can
reproduce…").

**Acceptance criteria**
- [ ] Meta description and `package.json` description include "(or known-source)"
- [ ] README "Getting help" (and optionally `config.yml` / the templates) carries a one-line best-effort caveat consistent with `SECURITY.md`
- [ ] Mission wording is consistent with Posture, or is explicitly left as-is with a reason

---

## 2. Record panel reviews as a bounded, chosen input to the backlog

**Severity:** medium  **Persona(s):** roadmap, mission (+ foil)  **Labels:** type:docs, area:docs
**Constitution section:** Principle 6, "How intent is recorded"

About half of this cycle's closed issues trace to the 2026-09-11 product panel
or the 2026-09-26 engineering panel. Both constitution rewrites were
review-triggered, and three panels ran in 15 days (roadmap, MEDIUM; mission,
LOW). The foil calls review-driven work a Principle 6 loophole: "assumed demand
pointed inward." It lists governance fatigue as a likely cause of death.

Suggested approach: add a short ADR or a `ROADMAP.md` note that does three
things:

- Names periodic self-review as a deliberate input.
- Bounds it: at most one product panel and one engineering panel per quarter.
  The next product panel runs after the December 2026 Criterion 5 window closes.
- Requires a panel finding to pass the Principle 6 test (the maintainer's use,
  correctness, or durability) before it becomes an issue.

**Acceptance criteria**
- [ ] Cadence and findings bar recorded in one authoritative place (ADR or `ROADMAP.md`)
- [ ] Next panel date tied to the Criterion 5 window

---

## 3. Make the dormant criteria falsifiable: a use signal, a use-lapse trigger, and the library-growth criterion

**Severity:** medium  **Persona(s):** mission (+ foil, surfaced by rude-qa)  **Labels:** type:docs, area:docs
**Constitution section:** Posture layers 1 and 3, Success Criteria

This issue covers three gaps:

- **Use signal.** ADR 0016 rests maintenance on the maintainer's own use, which
  it calls "verifiable". Nothing verifies it. `docs/operations/traffic-baseline.md`
  shows about 40 page loads on 4 desktop days in 92 (foil Hostile Q1; this is
  the foil's "Monday" action).
- **Use-lapse trigger.** There is no written trigger for switching from layer 1
  (built for the maintainer) to layer 3 (archived artifact). Its absence is the
  foil's top pre-mortem cause, "the maintainer stopped using it, and nothing
  noticed" (Hostile Q3).
- **Library growth.** The library-growth success criterion has no failure
  condition. The library has been frozen at 54 profiles since #98 (mission,
  MEDIUM; Hostile Q5).

Suggested approach, all small:

1. Choose one use signal. Either keep a private dated use log, or add a
   paragraph to `traffic-baseline.md` explaining why the beacon misses the
   maintainer (blocked beacon, offline PWA). Do not add telemetry; Principle 5
   still holds.
2. Record a lapse trigger via ADR, e.g. "no personal use in 2 quarters →
   declare artifact mode; maintenance drops to advisories + Dependabot".
3. Add one sentence to the library-growth criterion that either states a failure
   condition or says it has none by design.

**Acceptance criteria**
- [ ] A use signal exists that doesn't add telemetry
- [ ] The layer 1 → layer 3 trigger is written down
- [ ] The library-growth criterion states its failure condition, or its absence by design

---

Not filed (LOW, scale-appropriate or no action):

- Open Graph tags (market)
- A feature-request path (audience; revisit if a demand signal ever arrives)
- Carbonation coverage (audience; a data ceiling)
- Criterion 5 track record (roadmap; grade in December 2026)
- Retired milestones (roadmap)
- Stale snapshot tags (trust; snapshot artifact)
