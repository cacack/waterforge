<script lang="ts">
  import { SALTS } from '$lib'
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
</script>

<SectionCard title="Salts you own" hint="toggles → #17">
  <ul class="flex flex-wrap gap-1.5">
    {#each app.salts as salt (salt)}
      <li
        class="border-border bg-muted text-muted-foreground rounded-full border px-2 py-0.5 text-xs"
      >
        {SALTS[salt].name}
      </li>
    {/each}
  </ul>
</SectionCard>
