import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the static build works from any GitHub Pages subpath.
  base: './',
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
