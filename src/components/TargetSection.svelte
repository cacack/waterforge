<script lang="ts">
  import { ION_ORDER } from '$lib'
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
</script>

<SectionCard title="Target water" hint="searchable picker → #15">
  {#if app.target}
    <div class="font-medium">{app.target.name}</div>
    <dl
      class="text-muted-foreground mt-2 grid grid-cols-3 gap-x-4 gap-y-0.5 text-xs sm:grid-cols-4"
    >
      {#each ION_ORDER as ion (ion)}
        {#if app.target.ions[ion] != null}
          <div class="flex justify-between gap-2">
            <dt>{ion}</dt>
            <dd class="tabular-nums">{app.target.ions[ion]}</dd>
          </div>
        {/if}
      {/each}
    </dl>
  {:else}
    <p class="text-muted-foreground text-sm">No target selected.</p>
  {/if}
</SectionCard>
