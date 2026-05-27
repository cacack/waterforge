<script lang="ts">
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
</script>

<SectionCard title="Batch" hint="size + unit → #18">
  <p class="text-sm tabular-nums">
    {app.batch.volume}
    {app.batch.unit === 'gal' ? 'US gallon(s)' : 'litre(s)'}
  </p>
</SectionCard>
