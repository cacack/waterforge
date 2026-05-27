<script lang="ts">
  import type { Snippet } from 'svelte'

  // Shared shell for an input/output region. The slice components (#15–#20)
  // render their content as children; the title + card chrome live here.
  let {
    title,
    hint,
    children,
  }: { title: string; hint?: string; children: Snippet } = $props()
</script>

<section class="bg-card text-card-foreground rounded-lg border p-4">
  <div class="flex items-baseline justify-between gap-2">
    <h2 class="text-sm font-medium">{title}</h2>
    {#if hint}
      <span class="text-muted-foreground text-xs">{hint}</span>
    {/if}
  </div>
  <div class="mt-3">
    {@render children()}
  </div>
</section>
