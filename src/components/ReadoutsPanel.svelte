<script lang="ts">
  import type { SolveResult } from '$lib'
  import SectionCard from './SectionCard.svelte'

  let { result }: { result: SolveResult | null } = $props()

  const so4cl = $derived(
    result
      ? result.readouts.sulfateChlorideRatio === Infinity
        ? '∞'
        : result.readouts.sulfateChlorideRatio.toFixed(2)
      : '—',
  )
</script>

<SectionCard title="Readouts & warnings" hint="full guidance → #20">
  {#if result}
    <dl class="grid grid-cols-3 gap-2 text-sm">
      <div>
        <dt class="text-muted-foreground text-xs">SO₄:Cl</dt>
        <dd class="tabular-nums">{so4cl}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground text-xs">TDS</dt>
        <dd class="tabular-nums">{Math.round(result.readouts.tds)} mg/L</dd>
      </div>
      <div>
        <dt class="text-muted-foreground text-xs">Charge</dt>
        <dd class="tabular-nums">
          {result.readouts.chargeResidual.toFixed(2)} meq/L
        </dd>
      </div>
    </dl>
    {#if result.warnings.length}
      <ul class="mt-3 space-y-1 text-xs">
        {#each result.warnings as w (w.mineral)}
          <li class="text-amber-600 dark:text-amber-400">⚠ {w.message}</li>
        {/each}
      </ul>
    {/if}
  {:else}
    <p class="text-muted-foreground text-sm">—</p>
  {/if}
</SectionCard>
