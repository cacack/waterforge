// Tests for the build-time USAGE.md → HTML transform behind the offline help
// dialog (#234).
//
// The dialog component itself is not tested here because it requires a DOM
// environment (same constraint documented in actions.test.ts). What is tested
// is the pure transform, including the real USAGE.md — so a future edit to the
// guide that breaks a deep-linked anchor fails here rather than in the app.

import { describe, it, expect } from 'vitest'
import { renderUsageGuide } from '../scripts/usage-guide.mjs'
// Vite's `?raw` rather than node:fs — the app tsconfig ships no node types.
import USAGE_MD from '../USAGE.md?raw'

/** The transform requires a leading `#`; synthetic fixtures supply a stub one. */
function render(body: string) {
  return renderUsageGuide(`# Stub title\n\n${body}`)
}

describe('renderUsageGuide', () => {
  it('lifts the leading h1 into the title and out of the body', () => {
    const { title, html } = renderUsageGuide('# Using Waterforge\n\nHello.\n')
    expect(title).toBe('Using Waterforge')
    expect(html).not.toContain('<h1')
    expect(html).toContain('Hello.')
  })

  it('refuses markdown that does not open with an h1', () => {
    expect(() => renderUsageGuide('## Not a title\n')).toThrow(
      /single `# ` heading/,
    )
  })

  it('renders GFM tables', () => {
    const { html } = render(
      '| Salt | Ions |\n| ---- | ---- |\n| Gypsum | Ca |\n',
    )
    expect(html).toContain('<table>')
    expect(html).toContain('<td>Gypsum</td>')
    // Wrapped so a wide table scrolls on its own inside the dialog.
    expect(html).toContain('<div class="usage-table">')
  })

  describe('heading slugs', () => {
    it('gives headings slugged ids', () => {
      expect(render('## Weighing the salts\n').html).toContain(
        '<h2 id="weighing-the-salts">',
      )
    })

    // github-slugger drops disallowed characters in place and maps each
    // remaining space to a dash, so the em dash leaves a double dash behind.
    // Collapsing the run instead would make anchors copied from the rendered
    // document on GitHub silently fail to resolve in the app.
    it('matches GitHub for headings containing punctuation', () => {
      expect(render('## Step 1 — Pick a target profile\n').html).toContain(
        'id="step-1--pick-a-target-profile"',
      )
    })

    it('disambiguates repeated heading slugs', () => {
      const { html } = render('## Notes\n\n## Notes\n')
      expect(html).toContain('id="notes"')
      expect(html).toContain('id="notes-1"')
    })

    // A flat occurrence counter would emit `notes-1` for both the second
    // `Notes` and for `Notes 1`; querySelector would then silently scroll to
    // whichever came first.
    it('does not collide a generated id with an authored heading', () => {
      const { html } = render('## Notes\n\n## Notes\n\n## Notes 1\n')
      const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1])
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('links', () => {
    // The share-link guard. Fragment navigation from inside the dialog would
    // leave a stray fragment in the address bar — the channel share links use —
    // and scroll the page behind the dialog, so in-document links must never
    // render as href anchors.
    it('renders in-document links as anchor buttons, never as href links', () => {
      const { html } = render('See [Weighing](#weighing-the-salts).\n')
      expect(html).toContain('data-usage-anchor="weighing-the-salts"')
      expect(html).toContain('<button type="button"')
      expect(html).not.toContain('href="#')
    })

    it('opens external links in a new tab', () => {
      const { html } = render('[site](https://waterforge.app)\n')
      expect(html).toContain('href="https://waterforge.app"')
      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noopener noreferrer"')
    })

    // Overriding marked's link renderer opts out of the escaping it does
    // internally. A quote in a title or anchor would otherwise close the
    // attribute and inject markup into the dialog's {@html} block.
    it('escapes quotes and angle brackets in link attributes', () => {
      const { html } = render(
        '[x](https://e.com "a\\" onmouseover=\\"alert(1)")\n',
      )
      expect(html).toContain('&quot;')
      // No unescaped quote survives to open an attribute of its own.
      expect(html.replace(/&quot;/g, '')).not.toMatch(/ on\w+="/)
    })

    it('rejects unsupported link schemes at build time', () => {
      expect(() => render('[x](javascript:alert(1))\n')).toThrow(
        /unsupported scheme/,
      )
    })
  })

  describe('against the real USAGE.md', () => {
    const { title, html } = renderUsageGuide(USAGE_MD)

    it('extracts the guide title', () => {
      expect(title).toBe('Using Waterforge')
    })

    it('keeps the anchor RecipePanel deep-links to', () => {
      expect(html).toContain('id="weighing-the-salts"')
    })

    it('emits no href fragment links', () => {
      expect(html).not.toContain('href="#')
    })

    // Guards the coupling between the guide's prose and the dialog: renaming a
    // heading that something links to fails here instead of silently becoming a
    // dead button in the app.
    it('resolves every in-document anchor to a heading it emits', () => {
      const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))
      const anchors = [...html.matchAll(/data-usage-anchor="([^"]+)"/g)].map(
        (m) => m[1],
      )
      expect(anchors.length).toBeGreaterThan(0)
      expect(anchors.filter((a) => !ids.has(a))).toEqual([])
    })
  })
})
