#!/usr/bin/env node
// Guard against Tailwind data-variant shorthands that don't match bits-ui's
// data attributes. bits-ui emits compound `data-state="checked|unchecked"` and
// `data-state="open|closed"` — the shorthand variants `data-checked:`,
// `data-unchecked:`, `data-open:`, `data-closed:` silently fail to apply and
// produce invisible / broken UI primitives (Switch tracks, Dialog overlays,
// etc). Use the bracketed form: `data-[state=checked]:` and friends.
//
// Scoped to `src/lib/components/ui/` because that's where shadcn-style
// wrappers around bits-ui live. The shorthand is valid Tailwind elsewhere.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SCAN_DIR = join(ROOT, 'src/lib/components/ui')

// Each pattern is the shorthand we want to ban, paired with the bracketed
// replacement so the error message tells the contributor exactly what to type.
const BANNED = [
  { bad: 'data-checked:', good: 'data-[state=checked]:' },
  { bad: 'data-unchecked:', good: 'data-[state=unchecked]:' },
  { bad: 'data-open:', good: 'data-[state=open]:' },
  { bad: 'data-closed:', good: 'data-[state=closed]:' },
]

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) out.push(...walk(full))
    else if (entry.endsWith('.svelte') || entry.endsWith('.ts')) out.push(full)
  }
  return out
}

const findings = []
for (const file of walk(SCAN_DIR)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const { bad, good } of BANNED) {
      // Match the shorthand only when followed by a Tailwind utility char
      // (letter, hyphen, bracket, etc.) — avoids false positives on, say,
      // `data-checked` as a bare HTML attribute reference in a comment.
      const re = new RegExp(
        `(?<![\\w-])${bad.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}[\\w[\\-]`,
      )
      if (re.test(line)) {
        findings.push({
          file: relative(ROOT, file),
          line: i + 1,
          bad,
          good,
          excerpt: line.trim().slice(0, 120),
        })
      }
    }
  })
}

if (findings.length === 0) {
  process.exit(0)
}

console.error(
  'shadcn data-variant shorthand found — bits-ui emits compound `data-state`, so these silently fail to apply:',
)
console.error()
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`)
  console.error(`    ${f.excerpt}`)
  console.error(`    → replace \`${f.bad}\` with \`${f.good}\``)
  console.error()
}
console.error(
  `${findings.length} violation${findings.length === 1 ? '' : 's'}.`,
)
process.exit(1)
