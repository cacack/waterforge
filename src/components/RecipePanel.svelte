<script lang="ts">
  import { SALTS, SALT_ORDER, type SaltId, type SolveResult } from '$lib'
  import SectionCard from './SectionCard.svelte'

  let { result }: { result: SolveResult | null } = $props()

  const doses = $derived(
    result
      ? SALT_ORDER.filter((s) => (result.recipe[s] ?? 0) > 0).map((s) => ({
          id: s as SaltId,
          grams: result.recipe[s] ?? 0,
        }))
      : [],
  )
</script>

<SectionCard title="Recipe" hint="batch table → #18/#19">
  {#if result && doses.length}
    <table class="w-full text-sm">
      <thead class="text-muted-foreground text-xs">
        <tr>
          <th class="text-left font-normal">Salt</th>
          <th class="text-right font-normal">grams</th>
        </tr>
      </thead>
      <tbody>
        {#each doses as d (d.id)}
          <tr class="border-border/60 border-t">
            <td class="py-1">{SALTS[d.id].name}</td>
            <td class="py-1 text-right tabular-nums">{d.grams.toFixed(3)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else if result}
    <p class="text-muted-foreground text-sm">
      No salts needed — the source already matches the target.
    </p>
  {:else}
    <p class="text-muted-foreground text-sm">Choose a target water to start.</p>
  {/if}
</SectionCard>
