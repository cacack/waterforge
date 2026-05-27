# ADR 0001 — License split: GPLv3 code + CC-BY-SA-4.0 data

**Status:** Accepted
**Date:** 2026-05-27

## Context

Waterforge ships two distinct kinds of intellectual property:

1. **Source code** — TypeScript engine, Svelte UI, build tooling.
2. **Profile data** — mineral-water target profiles and associated reference
   values that derive from work freely published by Martin Lersch (Khymos).

These have different origins and different downstream uses. Code is typically
shared under software licences; data is typically shared under content/data
licences. Applying a single licence to both either over-restricts reuse of the
data (if a software copyleft licence is used) or under-protects the code (if a
data licence is used).

The project's founding principle is: _free and copyleft over proprietary
control — what we build on the commons stays in the commons_.

## Decision

- **Source code** is licensed under **GPL-3.0-or-later** (`LICENSE`). Any
  derivative software must remain free.
- **Profile data** is licensed under **CC-BY-SA-4.0** (`LICENSE-DATA`).
  Attribution to Martin Lersch / Khymos is required; derivatives must carry the
  same licence.

The two licences apply to disjoint artefacts, so there is no licence
compatibility conflict.

## Consequences

- Consumers who want to embed the engine in proprietary software must negotiate
  a separate licence or fork under GPL terms.
- Consumers who want to publish derived data profiles must credit Martin Lersch /
  Khymos and release under CC-BY-SA-4.0.
- Keeping the data under a Creative Commons licence (rather than GPL) makes it
  usable in non-software contexts (e.g. a printed table, a spreadsheet) without
  triggering software copyleft obligations.
