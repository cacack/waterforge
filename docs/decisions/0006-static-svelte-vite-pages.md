# ADR 0006 — Static Svelte/Vite/Pages stack: plain Vite SPA, no SvelteKit

**Status:** Accepted
**Date:** 2026-05-27

## Context

Waterforge has no server-side concerns: no SSR, no API routes, no
authentication, no dynamic routing. Everything computes in the browser from a
fixed salt/ion database baked into the bundle.

Framework options considered:

| Option                         | Notes                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Plain Vite SPA + Svelte 5**  | Single HTML entrypoint, purely static build, minimal config                                                |
| **SvelteKit (static adapter)** | Adds file-based routing, adapter layer, more config; pays off when there are multiple routes or SSR needed |
| **React / Vue / etc.**         | No specific advantage; Svelte 5 runes offer fine-grained reactivity with less boilerplate                  |

Deployment options:

| Option               | Notes                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| **GitHub Pages**     | Free, zero-server, works with a static build, no vendor lock-in beyond GitHub itself |
| **Netlify / Vercel** | Similar cost tier but adds a CDN vendor dependency                                   |
| **Self-hosted**      | Operational overhead not warranted for a static SPA                                  |

Vite's `base: './'` setting makes the build path-independent, so it deploys
correctly from any GitHub Pages subpath (e.g. `/<repo-name>/`).

## Decision

- **Framework:** Plain Vite 8 + Svelte 5 (runes). No SvelteKit.
- **Deploy target:** GitHub Pages, via `actions/deploy-pages`, triggered on push
  to `main`.
- **Build output:** `dist/` (static assets); no server process.

## Consequences

- The build is a single `vite build` command; deployment is a GitHub Actions
  workflow that uploads `dist/` as a Pages artifact.
- Adding a second page or route would require either client-side routing (e.g.
  svelte-spa-router) or migrating to SvelteKit — currently not needed.
- The static constraint enforces the privacy-by-default principle: no server
  means no telemetry, no accounts, no data leaving the user's browser.
- CI runs `lint`, `typecheck`, `test`, and `build` on every PR; the deploy
  workflow runs only on `main` pushes.
