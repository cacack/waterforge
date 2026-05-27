<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  // Placeholder shell. The real vertical-slice UI lands in M3 (#14 onward).
</script>

<main
  class="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center"
>
  <h1 class="text-4xl font-semibold tracking-tight">Waterforge</h1>
  <p class="text-muted-foreground max-w-prose text-balance">
    Clone bottled mineral waters from distilled (or known-source) water and
    food-grade salts. The recipe builder is on the way.
  </p>
  <Button href="https://github.com/cacack/waterforge" variant="outline">
    View the source
  </Button>
</main>
