/// <reference types="svelte" />
/// <reference types="vite/client" />

// Injected at build time by Vite's `define` (see vite.config.ts), sourced from
// package.json so it tracks the release-please version bump.
declare const __APP_VERSION__: string

// @fontsource-variable packages ship CSS only (no type declarations); these
// side-effect imports register the self-hosted Geist webfonts. See src/main.ts.
declare module '@fontsource-variable/geist'
declare module '@fontsource-variable/geist-mono'

// USAGE.md rendered to HTML at build time by the `waterforge:usage-guide`
// plugin in vite.config.ts, so the help dialog works offline (#234).
declare module 'virtual:usage-guide' {
  /** The guide's leading `#` heading — used as the dialog title. */
  export const title: string
  /** The rest of the guide as HTML, with the `<h1>` lifted into `title`. */
  export const html: string
}
