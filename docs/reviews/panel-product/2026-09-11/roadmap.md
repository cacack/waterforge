# Roadmap Reviewer — 2026-09-11

**Verdict:** aligned

Waterforge's roadmap is unusually explicit for a small project: CONSTITUTION.md's fifth success criterion ("once feature-complete, it stays that way — site up, dependencies current, advisories cleared promptly") is restated almost verbatim as ROADMAP.md's "sustained maintenance" status, and the two open issues (#212, #209) and the commit log (dependency bumps, CI hardening, Node LTS pin) both map cleanly onto that stated phase. No non-goal violations were found in open work or recent commits — closed-not-planned issues (#27, #28) are tracked with explicit re-evaluation triggers rather than silently dropped, which is good non-goal discipline. The one real gap: ROADMAP.md names "grow the water library" as **active** direction, but nothing in the open issues, closed-issue history since #98, or the last 40 commits shows any live tracking of it — the claim currently rests on prose alone.

## Findings

**[MEDIUM] "Grow the water library" is declared active but has no backlog behind it**

- Constitution section: Success criteria — "A browsable library of sourced target profiles ships... It grows opportunistically, with every new profile held to the same authoritative-sourcing standard (see ADR 0011)." ROADMAP.md "Active direction" restates this as one of only two current priorities and says growth is "tracked one issue per water" via the profile-request template.
- Observed evidence: the umbrella tracking issue for this effort, #98 ("Expand the bottled-water library beyond the Khymos seed set"), closed 2026-06-01. No open issue in the current backlog (#212, #209) references a profile addition. Scanning the 40 most-recently-closed issues back to 2026-05-27, the last profile-related work is #98 itself and the June-01 carbonation-metadata batch (#122–#132); nothing since. The last 40 commit subjects (spanning roughly June through today) are entirely dependency bumps, CI/release-please mechanics, and docs — none touch `src/data`, profiles, or the reference-data guide.
- Gap: a project of this scale relies on ROADMAP.md prose, not the issue tracker, to signal this direction — and the prose is currently unsupported by any open artifact. A prospective contributor reading "Requests are welcome... tracked one issue per water" would find zero open examples of that pattern.
- Suggested action: either open a standing tracking issue (or an `area:profiles` label swept periodically) so the open-ended growth effort has a visible home, or soften the ROADMAP language to state plainly that library growth is currently dormant and reactive (i.e., triggered only by an incoming profile-request issue) rather than "active."

**[LOW] No milestone or label stands in for the open-ended growth effort**

- Constitution section: same success criterion as above (library growth).
- Observed evidence: zero open milestones; the two open issues carry no `area:profiles`-style label pointing back to the library-growth direction.
- Gap: with milestones unused entirely, ROADMAP.md is the only discoverable plan. That's workable at this scale, but it means the one "active" direction the project claims to have has no tracker-side representation at all — not even a label — making it invisible to anyone browsing Issues/Milestones directly rather than reading the roadmap doc.
- Suggested action: low priority given the project's size; if a real profile-request issue lands, consider labeling it `area:profiles` for future discoverability rather than adding process overhead now.

**[LOW] Feature-complete declaration and its evidentiary refresh landed in the same commit as this audit**

- Constitution section: Success criteria (all five) — the "feature-complete" framing in ROADMAP.md is the basis for the entire maintenance-phase verdict.
- Observed evidence: HEAD commit `8d27ddd docs: refresh the constitution for the maintenance phase` is dated today (2026-09-11) and is the same change that updated ROADMAP.md's status section to declare feature-completeness.
- Gap: this is not a red flag by itself — the underlying evidence (v1.5.0 changelog entries #112–#132, the 54-profile library, the live site) genuinely supports the claim, and ROADMAP.md does link back to the closed issues that satisfy each criterion. But because the declaration and this review's baseline were refreshed together, a future reviewer should re-check the claim against independently-dated evidence (release tags, changelog) rather than the roadmap's own prose, to avoid the roadmap grading its own homework each cycle.
- Suggested action: none required now; worth a note for the next scheduled review to re-verify against CHANGELOG.md/release tags rather than ROADMAP.md text alone.

## Roadmap visibility

ROADMAP.md is present, short (55 lines), current (updated today), and does the job a stranger needs: it states the project's phase, links every open-ended item to context, and — notably — documents "Deferred" and "Not planned" items with explicit re-evaluation triggers (#27, #28, #13) so the backlog stays legible rather than silently growing stale. This is a strong pattern worth preserving. The one weak spot is the disconnect between that document's claimed "active direction" (library growth) and the complete absence of tracker-side evidence for it, per the findings above. Given the project's small size (2 open issues, 0 open milestones), an empty issue tracker by itself is not concerning — but a roadmap statement of active effort that no issue, label, or recent commit reflects is a real (if minor) planning-visibility gap.

### Summary counts

critical=0 high=0 medium=1 low=2
