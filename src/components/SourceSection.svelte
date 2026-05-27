<script lang="ts">
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
</script>

<SectionCard title="Source water" hint="known-source input → #16">
  <p class="text-sm">
    {app.sourceMode === 'distilled'
      ? 'Distilled (all ions zero).'
      : 'Known source.'}
  </p>
</SectionCard>
