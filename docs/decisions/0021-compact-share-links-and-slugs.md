# ADR 0021 — Compact share links and stable profile slugs

**Status:** Accepted
**Date:** 2026-10-24

## Context

The Share link encodes the full app state so a recipe can be reopened later —
in a static, account-less app it is how users "save" a recipe. The original
form (`#v1:` + base64url JSON) runs 415–523 characters. That is too dense for a
QR code on small printed or e-ink labels, which is where a link to a water is
most useful (#302).

Two needs follow:

- **A full-state link short enough for a small QR code.** The budget is
  **≤ 78 characters for the whole URL** on `https://waterforge.app/`. At that
  length a QR code stays at a low version with large modules, so it still scans
  when printed a couple of centimetres wide or shown on a low-resolution panel.
- **A readable target-only link** (`#evian`) that picks a water without
  overwriting the visitor's own source water, salts, batch, or carbonation.

Compressing the existing JSON was measured and rejected: deflate brought the
payload from 415 to 283 and from 523 to 367 characters — still several times
over budget. JSON field names and decimal text are the bulk of the size; only a
fixed binary layout removes them.

Both links need a durable key for the target profile. Display names are
editorial and do change; they are not safe to print on a label.

## Decision

1. **One hash grammar, classified by its first character.** A single parser
   reads `location.hash` (without the `#`):
   - `v1:…` — legacy JSON snapshot. Still decoded so existing links keep
     working; no longer produced.
   - leading digit `N…` — binary snapshot in format version `N`; the rest is
     base64url. Only `2` is defined.
   - matches the slug pattern — target permalink.
   - anything else — ignored. Unknown versions, malformed payloads, and
     unknown `#<slug>` target links change nothing and raise no error. A
     snapshot link whose embedded slug is unknown (e.g. made by a newer build)
     still applies the rest of the recipe, with no target.

2. **The format version is a 1-character prefix, not a payload byte.** This
   deviates from the issue's proposal. A prefix costs one character instead of
   the ~1.3 a base64url-encoded byte costs, and it is unambiguous against slugs,
   which must start with a letter.

3. **v2 byte layout** (big-endian, after the `2` prefix):

   | Field            | Size                | Encoding                                                                                                                                                                                      |
   | ---------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | flags            | 2 B                 | bits 0–8: salt enabled, by position in `SALT_ORDER`; bit 9: source mode is known; bit 10: unit is US gallon; bit 11: temperature unit is °F; bits 12–15 reserved (written 0, ignored on read) |
   | batch volume     | 3 B                 | uint24, thousandths (the input minimum is 0.001) — max 16777.215                                                                                                                              |
   | carbonation temp | 2 B                 | int16, tenths of a degree                                                                                                                                                                     |
   | slug length      | 1 B                 | 0 = no target                                                                                                                                                                                 |
   | slug             | 0–16 B              | ASCII                                                                                                                                                                                         |
   | source ions      | 14 B, only if known | seven uint16 in `ION_ORDER`, tenths of mg/L                                                                                                                                                   |

   Values round to field precision (source ions to 0.1 mg/L) and out-of-range
   values clamp — volume to at least 0.001 so the receiver never rejects it.
   An empty salt set is a real state and is applied. Decoded zero ions are omitted (the solver treats a
   missing ion as zero). Worst case is 24 (`https://waterforge.app/#`) + 1
   (prefix) + ⌈38 · 4/3⌉ (a 38-byte payload) = **76 characters**. The payload
   decodes into the same snapshot shape the app already validates,
   so there is still one validator for every link format.

4. **Slugs are the single stable profile key.** Each slug matches
   `^[a-z][a-z0-9-]{0,15}$` (starts with a letter, at most 16 characters) and is
   unique across the library. Slugs are **required for bundled profiles** —
   loading the library fails on a missing, duplicate, or malformed slug — and
   **optional for imported ones**, which have none and so cannot be the target
   of a permalink.

## Consequences

- A full recipe fits on a small label as a QR code, and a target-only link is
  short and human-readable.
- **The v2 layout is frozen.** Any change — a new field, a new salt beyond the
  flag bits, a different precision — ships as a new format version (`3…`)
  alongside v2, never as an edit to it. Old links decode forever. Because salt
  bits and the ion block are positional, `SALT_ORDER` (≤ 9 entries) and
  `ION_ORDER` are frozen with it; `src/share.test.ts` pins both, and
  `src/lib/profiles/library.test.ts` pins the published slugs.
- **`location.hash` now carries target links too.** This amends
  [ADR 0020](0020-usage-guide-rendered-into-the-app.md): a stray fragment shaped
  like a slug is read as a target link, which is another reason USAGE.md's
  in-document links must not be real `#` anchors.
- **Slugs are frozen.** Once published, a slug is never renamed and never
  reused for a different water, because it may already be printed on a label.
- **Display names stay free to change.** Nothing printed depends on them.
- `v1:` decoding is kept for compatibility; the v1 encoder is removed.
