# ADR 0008 — shadcn-svelte + Tailwind v4 for the UI component layer

**Status:** Accepted
**Date:** 2026-05-27

## Context

The UI needs accessible interactive components (dialogs, selects, number inputs,
tooltips). Options:

| Option                                                             | Notes                                                                                                                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Raw HTML + Tailwind**                                            | Full control; accessibility (ARIA, keyboard nav) must be hand-rolled for every component                                                                       |
| **A versioned component library** (e.g. Skeleton, Flowbite-Svelte) | Convenient but locks the app to a library version and release cadence                                                                                          |
| **shadcn-svelte + Bits UI**                                        | Components are copied into the repo (`$lib/components/ui`); no runtime dependency on a component framework; Bits UI supplies headless accessibility primitives |
| **Melt UI**                                                        | Headless only; requires building visual layer from scratch                                                                                                     |

Tailwind version:

| Version         | Notes                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| **Tailwind v4** | Vite-native plugin (`@tailwindcss/vite`); no PostCSS step; CSS-first config |
| **Tailwind v3** | PostCSS-based; widely supported but an extra build step                     |

shadcn-svelte's schema (`components.json`) declares `tailwind.baseColor: "zinc"`,
which is Tailwind v4-compatible and provides the neutral palette.

## Decision

Use **shadcn-svelte** (registry at `shadcn-svelte.com`) with **Bits UI** as the
headless primitive layer, styled with **Tailwind CSS v4** via the Vite plugin.
Components are owned copies in `$lib/components/ui`; the `bits-ui` package is a
runtime dependency for accessible behaviour (focus trapping, ARIA, keyboard
navigation).

Additional utilities: `clsx` + `tailwind-merge` (class merging), `tailwind-variants`
(variant API), `tw-animate-css` (animation utilities), `@lucide/svelte` (icons).

## Consequences

- UI components are co-located in the repo; upgrading shadcn-svelte means
  re-copying updated component files, not bumping a version number.
- `bits-ui` (Bits UI) is a runtime dependency; its API must remain compatible
  with the copied component implementations.
- Tailwind v4's Vite-native plugin removes PostCSS from the build pipeline,
  simplifying `vite.config.ts`.
- The `tailwind.baseColor: "zinc"` palette is baked into `components.json`; a
  palette change requires regenerating components or adjusting CSS variables.
