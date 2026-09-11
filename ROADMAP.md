# Roadmap

A lightweight statement of where Waterforge is headed. For the _why_ behind the
project, see [CONSTITUTION.md](CONSTITUTION.md); for what shipped, see
[CHANGELOG.md](CHANGELOG.md).

## Status

**Waterforge is feature-complete against its [mission](CONSTITUTION.md).** As of
v1.5.0 the build-out criteria are met: an exact (golden-test-verified) solver,
the unbroken target → recipe flow with readouts and saturation warnings, a
browsable sourced library (54 profiles across 14 countries — bottled, brewing,
coffee, and synthetic references), and the live app at
[waterforge.app](https://waterforge.app) (installable + offline).

The project is now in **sustained maintenance**, which the constitution's fifth
success criterion names explicitly: keep the site up, keep dependencies current,
and clear security advisories promptly.

There is no fixed release schedule. Work happens opportunistically, one PR at a
time, and versions are cut automatically by release-please from the commit log.

## Active direction

- **Grow the water library.** The expand-beyond-the-Khymos-seed push
  ([#98](https://github.com/cacack/waterforge/issues/98)) is closed, but the
  effort is open-ended by nature: add notable bottled and reference waters that
  fill geographic and chemistry gaps, each held to the authoritative-sourcing
  standard in [ADR 0011](docs/decisions). Requests are welcome via the
  [profile-request issue template](.github/ISSUE_TEMPLATE/profile_request.md)
  and are tracked one issue per water.
- **Keep it healthy.** Dependency currency, advisory response, and uptime — the
  daily site-health check and CI-on-main runs exist for this. See
  [docs/operations/](docs/operations/).

## Deferred — revisit when the trigger fires

These are closed as **not planned** rather than left open, so the backlog stays
honest. Each would be reopened only if its trigger condition appears; until then
they stay out of scope.

| Issue                                                 | Idea                                | Re-evaluation trigger                                                    |
| ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| [#27](https://github.com/cacack/waterforge/issues/27) | Teaspoon / volume salt-measure mode | Enough demand from users without a precise scale                         |
| [#28](https://github.com/cacack/waterforge/issues/28) | Coupled-Ksp solubility fidelity     | A real need for coupled-solubility accuracy (likely needs a WASM solver) |
| [#13](https://github.com/cacack/waterforge/issues/13) | Dev-only SciPy validation oracle    | The golden tests stop being sufficient confidence                        |

Done since the last refresh: [#30](https://github.com/cacack/waterforge/issues/30)
— the `matrix` dependency is vendored away and gone from `package.json`.

## Not planned

See the [non-goals](CONSTITUTION.md#non-goals): no mash-pH or residual-alkalinity
modeling, no general brewing-salts-for-style tool, no flavor prediction, and no
backend (the app stays static and client-side).
