# Roadmap

A lightweight statement of where Waterforge is headed. For the _why_ behind the
project, see [CONSTITUTION.md](CONSTITUTION.md); for what shipped, see
[CHANGELOG.md](CHANGELOG.md).

## Status

**Waterforge is feature-complete against its [mission](CONSTITUTION.md).** As of
v1.5.0 all four success criteria are met: an exact (golden-test-verified) solver,
the unbroken target → recipe flow with readouts and saturation warnings, a
browsable sourced library of bottled / brewing / coffee profiles, and the live
app at [waterforge.app](https://waterforge.app) (installable + offline).

There is no fixed release schedule. Work happens opportunistically, one PR at a
time, and versions are cut automatically by release-please from the commit log.

## Active direction

- **Grow the water library** — [#98](https://github.com/cacack/waterforge/issues/98).
  An ongoing, open-ended effort: add notable bottled and reference waters that
  fill geographic and chemistry gaps, each held to the authoritative-sourcing
  standard in [ADR 0011](docs/decisions). This issue does not "finish" — it has
  coverage goals rather than a hard endpoint. Profile requests are welcome via
  the [profile-request issue template](.github/ISSUE_TEMPLATE/profile_request.md).

## Deferred — revisit when the trigger fires

These are intentionally parked. Each will be picked up only if its trigger
condition appears; until then they stay out of scope.

| Issue                                                 | Idea                                       | Re-evaluation trigger                                                    |
| ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| [#27](https://github.com/cacack/waterforge/issues/27) | Teaspoon / volume salt-measure mode        | Enough demand from users without a precise scale                         |
| [#28](https://github.com/cacack/waterforge/issues/28) | Coupled-Ksp solubility fidelity            | A real need for coupled-solubility accuracy (likely needs a WASM solver) |
| [#30](https://github.com/cacack/waterforge/issues/30) | Vendor a small NNLS, drop the `matrix` dep | Bundle size becomes a real constraint                                    |
| [#13](https://github.com/cacack/waterforge/issues/13) | Dev-only SciPy validation oracle           | The golden tests stop being sufficient confidence                        |

## Not planned

See the [non-goals](CONSTITUTION.md#non-goals): no mash-pH or residual-alkalinity
modeling, no general brewing-salts-for-style tool, no flavor prediction, and no
backend (the app stays static and client-side).
