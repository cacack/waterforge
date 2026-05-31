import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
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
  plugins: [
    tailwindcss(),
    svelte(),
    // Installable + offline (#26). The app is a static client-side SPA, so the
    // service worker just precaches the built shell — including the hashed JS/
    // CSS/font bundles, which Workbox enumerates automatically. Icons are the
    // committed brand mark under public/ (regen: scripts/generate-icons.sh).
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'Waterforge',
        short_name: 'Waterforge',
        description:
          'Clone bottled mineral waters from distilled water and food-grade salts.',
        // Relative so they resolve at both waterforge.app/ and the GitHub
        // Pages subpath; matches base: './'.
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: '#0284c7',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
      },
    }),
  ],
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
