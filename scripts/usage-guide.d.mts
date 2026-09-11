// Types for the build-time usage-guide renderer. Hand-written because
// scripts/ is plain .mjs (like check-shadcn-data-attrs.mjs) while its two
// consumers — vite.config.ts and src/usage-guide.test.ts — are type-checked.

export declare function renderUsageGuide(markdown: string): {
  title: string
  html: string
}
