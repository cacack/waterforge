import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

// Source the app version from package.json at build time so the footer stays
// in lockstep with release-please's version bump (no hardcoded literal).
const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('./package.json', import.meta.url)),
    'utf8',
  ),
)

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the static build works from any GitHub Pages subpath.
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
  test: {
    // Engine (chem/solver) is pure TS — a node environment is enough.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
