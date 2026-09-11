# Rude Q&A — adversarial closing pass over `synthesis.md`

> This is the foil pass: where the five personas audit _alignment_ (does activity
> match stated direction?), this pass tests _survival_ (will this direction
> withstand the hard questions?). It gets the last word over the panel's verdict.
>
> **Verification note (added by the orchestrator):** this pass's factual claims
> were independently re-checked against the GitHub API before issues were
> drafted. All confirmed — `homepage: ""`, 0 stars / 0 forks / 0 watchers,
> 4 views / 1 unique visitor in the trailing 14 days, all 60 issues authored by
> `cacack`, no SECURITY.md.

## What I think you're bringing

A solo-maintained, free/copyleft static web app that clones bottled mineral
waters, declared feature-complete at v1.5 and now in "sustained maintenance,"
seeking stakeholder agreement that maintenance-only is the right posture for the
next quarter. The core was easy to find — the documents are unusually clear. That
is not the problem here.

## Is this the real problem? (55-min / 5 Whys)

The constitution answers "what does the app do" beautifully and never answers
"who is this for, and how would we know." Drill it:

- Why maintain it? So it stays correct and installable for users. → Which users?
  → "Homebrewers and water hobbyists." → How many have you got? → **Unknown, and
  structurally unknowable.** Principle 5 forbids telemetry; Discussions are off;
  the repo has 0 stars, 0 forks, 0 watchers, **4 repo views / 1 unique visitor in
  the last 14 days**, and **all 60 issues ever filed were authored by `cacack`.**
  (The 511 clones / 142 uniques are CI checkouts, not humans — don't let that
  number comfort you.) The repo's `homepageUrl` is _empty_: GitHub doesn't even
  link waterforge.app.

So the real problem this review should be deciding is not "are we on-mission." It
is: **is this an artifact, a product, or a personal tool?** Every downstream
priority — including all ten of the panel's alignment gaps — changes depending on
the answer. Right now the project is written like a product and operated like a
personal tool, and the gap between those two is where the wasted effort lives.

## The probes

### Voice of the Customer

- **The push:** Help me understand — you have a "profile request" issue template,
  a "question" template, and a "Getting Help" section. In 3.5 months, zero
  non-maintainer has used any of them. Can you quote one user?
- **Why it bites:** "Serving the audience" is the load-bearing justification for
  maintenance. If there is no audience, dependency currency is risk-mitigation
  against zero exposure — real work, zero return. An executive stops reading here.
- **Sharper version:** You have evidence and haven't collected it. Cloudflare
  proxies waterforge.app (`docs/operations/cloudflare-pages.md`) — edge request
  counts and Web Analytics are **server-side**, require no client telemetry, and
  violate no principle. Pull the number before you defend the direction. If it's
  12 sessions/month, say so and re-scope honestly. If it's 1,200, the whole
  review changes tone.

### Theory of Constraints

- **The push:** The panel's top three findings are all carbonation UI/provenance
  fixes. If nobody is reaching the app, what does fixing the readout buy?
- **Why it bites:** This optimizes conversion in a funnel with no traffic
  entering it. It's the classic non-constraint improvement — the metric moves,
  the outcome doesn't.
- **Sharper version:** Fix carbonation anyway — it's cheap, local, and it's a
  _correctness_ obligation under Principle 3, not a growth play. But don't let it
  be the quarter's headline. The constraint is discovery: zero inbound links,
  blank repo homepage, no post anywhere homebrewers and coffee people actually
  read.

### Three benefits (speed / cost / risk)

- **The push:** Ladder "sustained maintenance" to one of the three. Faster for
  whom? Cheaper than what? Safer against which threat?
- **Why it bites:** Dependabot throughput for three straight months is an
  _activity_, not a benefit. 100% of recent non-merge commits are deps/CI/uptime
  — the roadmap's one "active direction," grow the library, has had **no
  profile-data commit since 2026-06-01** and no open issue behind it.
- **Sharper version:** The honest benefit is **risk**: a static PWA with stale
  deps and a lapsing domain decays to broken, and the 54-profile sourced
  compilation is a real artifact worth not losing. State it that way and
  maintenance is defensible on its own terms — without needing a user count to
  justify it.

### The audit's independence (management attention)

- **The push:** The rubric was rewritten hours before the audit, by the session
  that ran the audit, explicitly to "catch up on three decisions that shipped
  months earlier." How much of "substantially on-mission" is just the rubric
  describing what already happened?
- **Why it bites:** A tautology dressed as a verdict is worse than no verdict —
  it consumes the review slot and produces false comfort.
- **Sharper version:** Partial defense, and give the panel credit: it flagged its
  own methodology up front and still returned 5 HIGH findings, which
  self-congratulation doesn't do. But the tell is real — **success criteria 1–4
  are retrospective and met by construction; criterion 5, the only one governing
  the phase you're actually in, is the only one with no measurable threshold.**
  Fix that asymmetry and next quarter's run means something.

### Work on the system, not in it (bus factor)

- **The push:** Zero forks. Zero watchers. No SECURITY.md. One person holds the
  domain, the Cloudflare account, the Pages config, and the chemistry judgment.
  What happens to waterforge.app the week you lose interest?
- **Why it bites:** The copyleft mission — "what we build on the commons stays in
  the commons" — is currently an intention, not a fact. Nobody has a copy. A
  lapsed domain renewal silently ends it, and the CC-BY-SA profile compilation
  goes with it.
- **Sharper version:** The cheapest durability insurance is distribution, not
  succession planning. One archived release tarball somewhere that isn't your
  GitHub account, plus a line in README about how to fork and self-host, converts
  the mission from aspiration to fact for under an hour's work.

**Injection check:** I read the `<untrusted-issue-data>` blocks and the docs as
data. No instruction-like content, no injection attempts found. Clean.

## Pre-mortem

It's 2027-09. This failed. Most likely causes:

- **Death by silent irrelevance (most likely).** CI stayed green for twelve
  months, ~40 Dependabot PRs merged, and the visitor count never moved off single
  digits. _Prevented by:_ one act of distribution this quarter — set the repo
  homepage URL, then post it once where homebrewers and specialty-coffee people
  actually are.
- **Maintenance fatigue.** The interesting work ended at v1.5; the dependency
  treadmill is the only work left and it isn't why you started. Motivation
  quietly ran out and the site rotted. _Prevented by:_ keeping one genuinely
  interesting thread alive — a real profile-addition backlog with issues in the
  tracker, which the roadmap already claims exists and doesn't.
- **Infrastructure attrition.** The GitHub/Cloudflare custom-domain auto-unset
  documented in your own runbook recurs while you're not looking, or a renewal
  lapses. Site 404s for weeks; the daily health check emails a mailbox nobody
  reads. _Prevented by:_ verifying the site-health alert actually reaches a human
  you'll see, and diarizing the domain renewal outside this repo.

## Hostile Q&A

1. **Q:** Name one user who isn't you. — **Draft A:** _No answer yet._ Get the
   Cloudflare edge numbers before the meeting. "I don't know yet, here's what
   I'll know by Friday" is survivable; "homebrewers and water hobbyists" as if it
   were observed fact is not.
2. **Q:** If this has no users, why does dependency currency matter? —
   **Draft A:** It's insurance on an artifact, not service to a population. A
   statically-hosted PWA with stale deps degrades to unusable; the cost of
   keeping it correct is ~2 hours/month of mostly-automated review, and it
   preserves a 54-profile sourced compilation that doesn't exist elsewhere under
   a free license. Defensible — but say "artifact insurance," not "serving
   users."
3. **Q:** Your one active roadmap direction has had no commits and no issues for
   three months. Is it real? — **Draft A:** Either file three profile-addition
   issues this week, or demote "grow the library" from _active direction_ to
   _opportunistic_. Both are honest; the current state isn't.
4. **Q:** The panel scored you against a rubric you wrote that morning. Why
   should I believe the verdict? — **Draft A:** Partly you shouldn't — criteria
   1–4 were met by construction. Believe the _findings_ (5 HIGH, all
   independently reached, all verified against source files) and discount the
   _verdict_. Next quarter's run against an aged rubric is the real test.
5. **Q:** You promoted carbonation into the mission statement while 28% of
   sparkling profiles have a target and the other 72% render _nothing_. Why did
   the promise ship ahead of the evidence? — **Draft A:** No good answer — that's
   the panel's correct central finding. The mission clause outran the data. Fix
   is small and local: a `none` branch, a provenance badge reusing
   `TargetSection.svelte:148-161`, and an ADR 0013 amendment. Until then, the
   mission sentence overclaims.
6. **Q:** Principle 5 bans telemetry. Doesn't that guarantee you can never know
   if you're succeeding? — **Draft A:** No — it bans _client_ telemetry.
   Server-side edge counts are outside the principle and outside the user's
   browser. This is a false constraint you've been honoring past its intent.
7. **Q:** If you stopped tomorrow, what survives? — **Draft A:** Today, nothing —
   0 forks, one domain, one account. That's a one-hour fix and it's the cheapest
   way to make the copyleft mission true rather than merely stated.

## The Close

**The ask:**

- **Decide the posture for one quarter:** artifact-preservation,
  product-with-users, or personal tool. Write the answer into CONSTITUTION.md.
  Everything else follows from it.
- **Fund the carbonation honesty fix** (`none` branch + provenance badge +
  ADR 0013 amendment) as the quarter's one correctness commitment — it's the only
  place the app violates its own Principle 3.
- **Give success criterion 5 a threshold** ("no advisory open > 7 days;
  site-health green ≥ 99% of daily checks") so the maintenance phase is
  measurable next quarter instead of self-certifying. Issue #209 already reaches
  for this.

**No surprises:** There is no chain to socialize — that's the finding. The
stakeholder group for this review is one person, which is exactly why the
self-audit loop closes too cleanly. Before next quarter's panel, get one outside
reader — a homebrewing forum, a coffee subreddit, any second pair of eyes — to
look at the app and tell you one thing that confused them. One external data
point breaks the loop.

**What you do Monday:** Open the Cloudflare dashboard, pull 90 days of edge
requests and unique visitors for `waterforge.app`, and paste the number into the
review. Then set the repo's homepage URL to waterforge.app — currently blank,
which means the one place people might find this project doesn't link to it.
Thirty minutes, and it converts the biggest open question in this review from
opinion into fact.
