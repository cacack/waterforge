// Render USAGE.md to HTML at build time so the in-app help works offline (#234).
//
// The header's `?` button used to link to USAGE.md on GitHub, which is dead
// exactly when the help is needed most: an installed PWA at the counter with no
// signal. Converting the guide here — rather than shipping a second, authored
// copy of the same prose — keeps USAGE.md the single authoritative home.
//
// Consumed by the `virtual:usage-guide` plugin in vite.config.ts, so the output
// lands inside the hashed JS bundle that vite-plugin-pwa already precaches.
// Kept in scripts/ (not src/) because it is build-time-only code, and so
// src/usage-guide.test.ts can import it without dragging marked into the app.
//
// The exported signature is declared by hand in usage-guide.d.mts — change both
// together, or type-checked callers keep compiling against a stale contract.

import { Marked, Renderer } from 'marked'

const SAFE_LINK_SCHEMES = ['http', 'https', 'mailto']

/**
 * Escape a value for interpolation into a double-quoted HTML attribute.
 *
 * Overriding marked's `link` renderer means opting out of the escaping it does
 * internally, so this has to be applied by hand at every attribute we build.
 * Without it a link title containing a quote — ordinary CommonMark — closes the
 * attribute early and injects markup into the `{@html}` block that renders the
 * guide.
 */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * GitHub-compatible heading slug, matching github-slugger: lowercase, drop
 * everything outside word characters / whitespace / dashes, then map each
 * remaining whitespace character to a dash.
 *
 * The per-character mapping is deliberate and load-bearing. Collapsing runs
 * instead would turn `## Step 1 — Pick a target profile` into
 * `step-1-pick-a-target-profile` while GitHub yields `step-1--pick-a-target-profile`
 * (the em dash leaves two spaces behind), so an anchor copied from the rendered
 * document on GitHub would silently fail to resolve in the app.
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s/g, '-')
}

/**
 * Reject link schemes that should never appear in the guide.
 *
 * marked's own `cleanUrl` only encodes the URL; it does not block
 * `javascript:`. Since the guide is authored in-repo, an unexpected scheme is a
 * mistake (or worse) and failing the build is both safe and loud.
 */
function assertSafeHref(href) {
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href)
  if (scheme && !SAFE_LINK_SCHEMES.includes(scheme[1].toLowerCase())) {
    throw new Error(
      `usage-guide: refusing to render link with unsupported scheme "${scheme[1]}:" — ${href}`,
    )
  }
}

/**
 * Convert the usage guide's markdown into the pieces the help dialog needs.
 *
 * @param {string} markdown Contents of USAGE.md.
 * @returns {{ title: string, html: string }} `title` is the leading `#`
 *   heading (used as the dialog title, so the body does not repeat it);
 *   `html` is the rest of the guide.
 * @throws If the markdown does not begin with a single `#` heading, or contains
 *   a link with an unsupported scheme.
 */
export function renderUsageGuide(markdown) {
  const seen = new Set()
  const renderer = new Renderer()

  // Slugged ids on every heading, so in-document anchors have a target.
  renderer.heading = function heading(token) {
    const base = slugify(token.text)
    // Walk past ids already taken rather than counting occurrences: a document
    // with two `## Notes` and one `## Notes 1` would otherwise emit `notes-1`
    // twice, and querySelector would silently scroll to the wrong one.
    let id = base
    for (let n = 1; seen.has(id); n += 1) id = `${base}-${n}`
    seen.add(id)
    const body = this.parser.parseInline(token.tokens)
    return `<h${token.depth} id="${escapeAttr(id)}">${body}</h${token.depth}>\n`
  }

  // The salt and readout tables are wider than a phone-width dialog. Wrapping
  // each one lets it scroll sideways on its own instead of stretching the
  // whole guide.
  renderer.table = function table(token) {
    const rendered = Renderer.prototype.table.call(this, token)
    return `<div class="usage-table">${rendered}</div>\n`
  }

  // In-document links become buttons carrying `data-usage-anchor`, NOT anchors
  // with an `href="#..."`. Fragment navigation from inside the dialog would
  // leave a stray fragment in the address bar — the same channel the share link
  // uses — and scroll the page behind the dialog. HelpDialog.svelte intercepts
  // these and scrolls the guide body instead. See ADR 0020.
  renderer.link = function link(token) {
    const body = this.parser.parseInline(token.tokens)
    if (token.href.startsWith('#')) {
      const target = escapeAttr(token.href.slice(1))
      return `<button type="button" data-usage-anchor="${target}">${body}</button>`
    }
    assertSafeHref(token.href)
    const titleAttr = token.title ? ` title="${escapeAttr(token.title)}"` : ''
    return `<a href="${escapeAttr(token.href)}" target="_blank" rel="noopener noreferrer"${titleAttr}>${body}</a>`
  }

  // Options live on the Marked instance so both halves of the pass see them;
  // passing an options object to parser() would replace these defaults rather
  // than merge with them.
  const marked = new Marked({ gfm: true, renderer })
  const tokens = marked.lexer(markdown)

  // Lift the leading `# Using Waterforge` out of the body — it becomes the
  // dialog's title, which keeps that string sourced from USAGE.md too.
  const firstHeading = tokens.findIndex((t) => t.type === 'heading')
  if (firstHeading === -1 || tokens[firstHeading].depth !== 1) {
    throw new Error(
      'usage-guide: the guide must open with a single `# ` heading — it becomes the help dialog title.',
    )
  }
  const title = tokens[firstHeading].text
  tokens.splice(firstHeading, 1)

  return { title, html: marked.parser(tokens) }
}
