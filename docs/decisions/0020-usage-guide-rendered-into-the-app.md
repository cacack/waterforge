# ADR 0020 — USAGE.md is rendered into the app at build time, not duplicated in it

**Status:** Accepted
**Date:** 2026-09-11
**Closes:** [#234](https://github.com/cacack/waterforge/issues/234)

## Context

[#220](https://github.com/cacack/waterforge/issues/220) added a `?` button in the
header linking to `USAGE.md` on GitHub. That link is dead in precisely the
situation the guide is written for: an installed PWA at the counter, mid-recipe,
with no signal. Principle 5 promises the app is _"installable, so it keeps
working offline at the counter"_, and this was a real gap between that promise
and what shipped.

The single most important fact in the guide — that a recipe needs a scale reading
to 0.01 g — was already pulled into `RecipePanel.svelte` as plain text by
[#221](https://github.com/cacack/waterforge/issues/221), so the critical warning
survived offline. Everything else in the guide did not.

Three options were weighed in #234:

1. **Pre-render `USAGE.md` to HTML at build time**, precached with the rest of the
   app.
2. **Ship `USAGE.md` as a raw static asset.** No dependency, but browsers render
   `.md` as unstyled plain text, and the copy in `public/` forks from the source
   unless copying is automated.
3. **An in-app help panel with the key content written into a Svelte component.**
   Fully offline and the most "app-like", but it restates prose that `USAGE.md`
   already owns, so the two drift apart.

## Decision

**Option 1.** `USAGE.md` is converted to HTML during the Vite build and served to
the app as the virtual module `virtual:usage-guide`; `HelpDialog.svelte` renders
it in a dialog opened from the header's `?` and from the recipe panel.

The deciding argument is **one authoritative home**, not offline capability —
options 1 and 3 are equally offline. Option 3 would have created a second copy of
the same explanations, in a different format, with nothing keeping them in step;
the guide would have been correct on GitHub and quietly stale in the app, or the
reverse. Rendering the file we already maintain makes drift structurally
impossible: there is one source, and the app cannot disagree with it.

Consequences of that choice, recorded so they are not re-litigated as defects:

- **The prose ships in `dist/`.** The guide's HTML rides inside the hashed JS
  bundle, which `vite-plugin-pwa` already precaches via its existing
  `globPatterns`. No precache configuration was added, and the guide is present
  on the _first_ offline load rather than only after a prior online visit. The
  bundle grew by roughly 8 kB raw.
- **`marked` is a `devDependency`.** It runs only in `vite.config.ts`; no library
  code reaches `dist/`, only its output. This follows `CLAUDE.md`'s rule that the
  dependency split tracks what lands in `dist/`, not when the package runs.
- **`USAGE.md` is now read by two audiences.** It is still a GitHub document, but
  it is also app UI. Edits should read sensibly in both places.
- **In-document links may not be real `#` anchors.** `location.hash` is the
  share-link channel: `App.svelte` decodes a recipe snapshot from it at boot and
  on `hashchange`. A stray fragment does **not** corrupt state — `decodeHash`
  returns `null` for anything that is not a snapshot and the handler returns
  early — but it does dirty that channel, leaving a fragment sitting in the
  address bar of a URL the user may then share, and fragment navigation would
  scroll the page behind the dialog. The build therefore rewrites in-document
  links to buttons carrying `data-usage-anchor`, which the dialog intercepts and
  scrolls. `src/usage-guide.test.ts` guards this.
- **Headings are a public interface.** Heading text determines the slug, and the
  slug is what `RecipePanel.svelte` and the guide's own cross-links target, so
  renaming a heading can break a link. `slugify` matches github-slugger exactly
  so an anchor copied from the rendered document on GitHub resolves in the app;
  a test asserts every emitted anchor resolves to a heading the build emits.
- **Overriding marked's renderer means owning its escaping.** The custom `link`
  renderer opts out of the escaping marked does internally, so it escapes every
  attribute it builds by hand and rejects link schemes outside http/https/mailto
  at build time. Without that, a link title containing a quote — ordinary
  CommonMark — injects markup into the `{@html}` block that renders the guide.

## Alternatives not taken

**A separate pre-rendered `public/usage.html` page** was the other shape the
build-time option could take. It would work offline equally well, but it needs
its own theme, typography and font shell duplicated outside the app, and it
navigates the user away from the recipe they are standing over. The dialog
inherits the app's tokens and keeps the recipe on screen behind it.

**`@tailwindcss/typography`** for the prose styling was rejected: it ships CSS
into `dist/` (so it would be a runtime `dependencies` entry) and needs
`prose-invert` wiring for dark mode, in exchange for styling exactly one dialog.
About 25 lines of scoped rules against the existing brand tokens in `app.css`
cover it and are correct in both themes by construction.

## Consequences

- The header `?` and the recipe panel's "Weighing the salts" link both open the
  in-app guide; neither leaves the app. A "View on GitHub" link in the dialog
  footer preserves the old affordance.
- Anyone editing `USAGE.md` changes the app's help with no further step. Adding a
  heading adds a linkable section automatically.
- If the guide grows much larger, the cost of bundling it should be revisited —
  at ~8 kB against a ~420 kB bundle it is not worth splitting today.
