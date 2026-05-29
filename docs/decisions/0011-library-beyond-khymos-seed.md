# ADR 0011 — The profile library may grow beyond the Lersch/Khymos seed

**Status:** Accepted
**Date:** 2026-05-28

## Context

The bundled profile library was bootstrapped from Martin Lersch's _Mineral
Water Calculator v6_ (Khymos, 2015). #67 re-sourced the commercial profiles
against current authoritative sources and #68 validated the non-commercial
reference profiles, so the seed set is now well-provenanced — but it is also
**closed at the Khymos set**. That set is Euro-heavy (French/German/Italian/
Romanian) with only scattered NZ/US/Mexico coverage, and entire regions (e.g.
the UK) are absent.

CONSTITUTION.md describes the library as descending from Lersch/Khymos and lists
shipping "a seed library of the planned … target profiles" as a success
criterion. Growing past that seed is a small but real scope evolution. The
constitution's own amendment rule ("when in conflict … explicitly update it")
requires that the first deliberate expansion be recorded.

## Decision

The profile library **may grow beyond the Lersch/Khymos seed** to fill chemistry
and geographic gaps. The seed remains the historical origin and keeps its
CC-BY-SA-4.0 attribution; new profiles are additions to it, not replacements of
it.

Every new profile is held to the **#67 authoritative-sourcing standard**:

- Sourced to a primary authority, in rough order of preference: the bottler's
  current published water-analysis sheet / quality page; a current product
  label; a regulatory / national-water-board analysis; or a peer-reviewed /
  trade-press analysis when the bottler publishes nothing. Aggregator sites and
  uncited infoboxes do not qualify.
- Shipped `verified: true` with full provenance (`source`, `source_date`,
  primary-source `url`); only ions the source reports are populated, and
  `alkalinity_unit` matches the source's convention.
- **Candidates that cannot be sourced to this standard are dropped, not seeded.**
  We do not add new unverified rows; the seed's remaining unverified entries are
  a legacy to be re-sourced or retired, not a precedent to extend.

The first application is issue #98 Batch 1: the verified **Calistoga Spring
Water**, **Perla Harghitei**, **Perla Harghitei Plată**, and **Tiva Harghita**
rows land, and three superseded unverified rows retire — `Calistoga` (Sparkling,
discontinued), `Calistoga Premium` (discontinued), and the historical `Harghita`
(PERK Atlas 2012, no current match, superseded by the branded Sâncrăieni waters).

## Consequences

- The library can close geographic and chemistry gaps over time (issue #98
  tracks staged batches) instead of being frozen at the 2015 Khymos snapshot.
- Provenance quality only ratchets up: every _new_ row is verified, and the
  retirements remove unverifiable rows rather than carrying them indefinitely.
- Retiring a profile is an accepted move when a verified successor lands or no
  authoritative source exists (precedent: Kessel removal in #67/#85). Removals
  are reflected in the profile-count assertion and `KNOWN_IMBALANCED` set in
  `library.test.ts`.
- The seed's attribution obligation is unchanged; new profiles carry their own
  source citations.
