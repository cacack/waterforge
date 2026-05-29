<script lang="ts">
  // Waterforge mark: a hexagon (the mineral lattice / the forge) holding a
  // single droplet. Per the brand, the droplet is the *only* blue — the same
  // rule that governs the whole system: blue marks the living, active element.
  // The hexagon inherits `currentColor` (stays neutral); the droplet fills
  // with --primary (sky).
  let { class: className }: { class?: string } = $props()
</script>

<svg
  viewBox="0 0 32 32"
  class={className}
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  <polygon
    points="30,16 23,28.12 9,28.12 2,16 9,3.88 23,3.88"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linejoin="round"
  />
  <path
    d="M16 8 C 12.5 13 10.5 15.5 10.5 18 a 5.5 5.5 0 1 0 11 0 C 21.5 15.5 19.5 13 16 8 Z"
    style="fill: var(--primary)"
  />
</svg>
