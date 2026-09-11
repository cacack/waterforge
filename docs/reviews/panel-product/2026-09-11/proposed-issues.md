# Proposed issues — Panel Product 2026-09-11

> **Status: all 10 filed on 2026-09-11 as #216–#225.**

Drafted from findings rated HIGH by any persona, MEDIUM findings cross-flagged by
2+ personas, and unanswered Hostile Q&A / pre-mortem items from `foil.md`.

Existing open issues checked for overlap: #212 (CONTRIBUTING clone URL), #209
(alert on unactioned Dependabot vulnerability).

---

## 1. Decide and record the project's posture: artifact, product, or personal tool

**Filed:** #216

**Constitution section:** Audience / Mission
**Surfaced by:** rude-qa (foil) — the review's reframing finding
**Labels:** `strategic-risk`, `area:docs`

The constitution says who the app is _for_ but never says how the project would
know it is reaching them. Verified against the GitHub API on 2026-09-11: 0 stars,
0 forks, 0 watchers, **4 repo views / 1 unique visitor in the trailing 14 days**,
and **all 60 issues ever filed authored by `cacack`**. The profile-request and
question templates have never been used by a non-maintainer.

This is not a criticism of the work — it is an unanswered strategic question that
silently sets the priority of every other finding in this panel. The project is
written like a product and operated like a personal tool.

Decide, for one quarter, which of these it is:

- **Artifact preservation** — the 54-profile sourced compilation and a correct
  solver are worth keeping alive regardless of traffic. Maintenance is insurance,
  and that is a complete justification on its own.
- **Product with users** — then discovery is the constraint, and the carbonation
  fixes are downstream of getting anyone to the app at all.
- **Personal tool** — then most of this panel's findings can be closed as
  won't-fix, honestly.

Write the answer into `CONSTITUTION.md`. The foil's argument for
artifact-preservation is the strongest: "say artifact insurance, not serving
users," which is defensible without needing a user count.

---

## 2. Show _something_ when a sparkling profile has no carbonation target

**Filed:** #217

**Constitution section:** Principle 3 (precision over hand-waving — "surface
uncertainty rather than bury it")
**Surfaced by:** mission (HIGH), audience (HIGH) — independently
**Labels:** `type:bug`, `area:ui`

13 of 18 sparkling profiles carry no `carbonation_target` — including Ferrarelle
and Vichy Célestins. For those, `computeCarbonation()` returns `{kind: 'none'}`
(`src/state.svelte.ts:95`) and `CarbonationReadout.svelte` has no `none` branch,
so the carbonation section **renders nothing at all**. The user is not told the
figure is unknown; the UI is simply silent.

This is the project's own Principle 3 inverted at the one place it matters. The
`profiles.json` provenance strings are scrupulously honest with themselves; that
honesty does not survive the trip to the screen.

**Suggested approach:** add a `none` branch rendering something like "Sparkling —
no sourced carbonation target for this water yet," ideally linking the
profile-request template so the gap is actionable by whoever hits it.

---

## 3. Surface carbonation-target provenance in the recipe readout

**Filed:** #218

**Constitution section:** Principle 3
**Surfaced by:** trust (HIGH)
**Labels:** `type:bug`, `area:ui`

Of the 5 profiles that do carry a `carbonation_target`, **4 are
`verified: false`** and self-labelled "Estimate" in their own provenance —
Perrier, Badoit, San Pellegrino, Topo Chico — sourced to comparison blogs and
homebrew forum clone threads. `CarbonationReadout.svelte` renders a precise
"Carbonate to N g/L → N.N psi" with no provenance or verified indicator.

`TargetSection.svelte:148-161` **already implements exactly this badge** for the
base profile (verified / Unverified + source + source_date). The fix is extending
an existing pattern, not inventing one.

A user pressurising a keg to a psi figure derived from a homebrew forum estimate
should be able to see that is what it is.

---

## 4. Amend ADR 0013 to record the carbonation-target sourcing reversal

**Filed:** #219

**Constitution section:** Principle 4 (faithful to the source method —
"deviations are documented decisions, not silent reinventions")
**Surfaced by:** trust (HIGH)
**Labels:** `area:docs`, `type:chore`

ADR 0013 decision #5 states `carbonation_target` is "left **unset on every
profile** … Unset is the honest default; targets are not estimated." Issue #132
then populated five targets, four of them explicit estimates. No ADR records the
policy change.

The project has its own precedent for handling this correctly: ADR 0001 was
amended by ADR 0012 via issue #96 when the profile-data sourcing story changed.
Apply the same pattern here — either an amending ADR or a Status/Amended block on
0013 — so the decision log stays trustworthy.

---

## 5. Link USAGE.md from the app

**Filed:** #220

**Constitution section:** Audience
**Surfaced by:** audience (HIGH)
**Labels:** `type:enhancement`, `area:ui`, `good-first-issue`

`USAGE.md` answers the questions users actually hit — what scale resolution the
recipes need, what a `0.000 g` row means, what to do about a saturation warning —
and is linked from nowhere in the running app (`Header.svelte`, `Footer.svelte`).
The project's best audience-facing writing is disconnected from the audience's
point of use.

**Suggested approach:** a help link in the header or footer. The footer already
carries version and license attribution (#83), so the slot exists.

---

## 6. Disclose the scale requirement before the user invests effort

**Filed:** #221

**Constitution section:** Audience ("this is not for" boundary)
**Surfaced by:** audience (MEDIUM)
**Labels:** `type:enhancement`, `area:docs`

The 0.01 g scale requirement appears only in `USAGE.md` Step 5 — after a user has
picked a target, set a source, and toggled salts. This is precisely the boundary
that makes #27 (teaspoon mode, closed _not planned_) defensible: a user without a
precise scale is deliberately unserved, and should learn that early rather than
late. README and the app itself are both silent on it.

---

## 7. Give "grow the water library" a real backlog, or demote it

**Filed:** #222

**Constitution section:** Success criterion 3
**Surfaced by:** roadmap (MEDIUM), mission (MEDIUM) — cross-flagged
**Labels:** `area:docs`, `type:chore`

`ROADMAP.md` names this as the single **active direction**. #98 closed
2026-06-01; no open issue tracks a profile addition; no commit has touched
profile data since. A contributor reading the roadmap would find nothing to pick
up.

The foil's framing is the right one: _either file three profile-addition issues
this week, or demote it from "active direction" to "opportunistic." Both are
honest; the current state isn't._ The pre-mortem also names a stale backlog as
the "maintenance fatigue" failure mode — one genuinely interesting open thread is
what keeps a solo project alive.

---

## 8. Give success criterion 5 a measurable threshold

**Filed:** #223

**Constitution section:** Success criteria
**Surfaced by:** mission (LOW), rude-qa (foil — escalated)
**Labels:** `area:docs`
**Possibly already tracked:** #209 — "Alert when a Dependabot vulnerability sits
unactioned" reaches for the advisory half of this.

Criteria 1–4 are concrete and checkable. Criterion 5 — added today for the
maintenance phase — says "dependencies stay current, and security advisories are
cleared promptly" with no threshold, which makes it self-certifying. The foil's
point is sharp: it is the **only** criterion governing the phase the project is
actually in, and the only one that cannot be failed.

**Suggested approach:** something like "no security advisory open more than 7
days; site-health check green on ≥99% of daily runs." Then next quarter's panel
can score it rather than accept it.

---

## 9. Make the copyleft mission true rather than stated: distribution + SECURITY.md

**Filed:** #224

**Constitution section:** Principle 1 ("what we build on the commons stays in the
commons"), Success criterion 5
**Surfaced by:** rude-qa (foil — pre-mortem: infrastructure attrition), trust
(MEDIUM, SECURITY.md)
**Labels:** `strategic-risk`, `area:infra`

Zero forks, zero watchers, one domain, one Cloudflare account, one GitHub
account, no `SECURITY.md`. If the maintainer stops, nothing survives — a lapsed
domain renewal silently ends the project and takes the CC-BY-SA profile
compilation with it. The copyleft principle is currently an intention, not a
fact: nobody else has a copy.

**Suggested approach** (the foil's, and it is cheap): one archived release
tarball somewhere that is not this GitHub account, a README line on how to fork
and self-host, a `SECURITY.md` with a disclosure address, and the domain renewal
diarised outside this repo. Under an hour, and it converts the mission from
aspiration to fact.

---

## 10. Set the repository homepage URL

**Filed:** #225

**Constitution section:** Success criterion 4 (the app is live and usable)
**Surfaced by:** rude-qa (foil — "what you do Monday")
**Labels:** `good-first-issue`, `effort:low`, `area:infra`

`gh api repos/cacack/waterforge` returns `homepage: ""`. The GitHub repo — the
one place someone might encounter this project — does not link to
waterforge.app. Two minutes, and it is the single highest
effort-to-impact item in this review.

---

## Not drafted

- **`brewing` profile-category ambiguity** (market, MEDIUM) — real, but
  single-persona and low-stakes; the README's prose disclaimer plus the
  constitution's non-goals already carry the message. Worth a look if the
  category list is ever revised.
- **Health/dosage disclaimer** (trust, LOW) — judgment call for the maintainer.
  Noted rather than drafted because the right answer depends on issue #1's
  posture decision.
