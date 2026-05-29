<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from '$lib/components/ui/select'
  import type { VolumeUnit } from '$lib'

  // While the user is typing, `typed` holds their raw string (so intermediate
  // values like "1." survive). When not editing (`typed === null`) the field
  // shows the canonical app.batch.volume — so external changes (import, reload
  // restore, shared links) are reflected in the input, not just the recipe.
  let typed = $state<string | null>(null)
  const rawVolume = $derived(typed ?? String(app.batch.volume))

  function handleVolumeInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    typed = value
    const parsed = parseFloat(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      app.batch.volume = parsed
    }
  }

  function handleVolumeBlur() {
    const parsed = parseFloat(typed ?? '')
    if (Number.isFinite(parsed) && parsed > 0) {
      app.batch.volume = parsed
    }
    // Revert to the canonical value (also discards invalid input).
    typed = null
  }

  const UNIT_OPTIONS: { value: VolumeUnit; label: string }[] = [
    { value: 'L', label: 'Litres' },
    { value: 'gal', label: 'US gallons (3.785 L)' },
  ]
</script>

<SectionCard title="Batch size">
  <div class="flex flex-wrap items-end gap-3">
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <Label for="batch-volume" class="text-xs">Volume</Label>
      <Input
        id="batch-volume"
        type="number"
        min="0.001"
        step="0.5"
        inputmode="decimal"
        value={rawVolume}
        oninput={handleVolumeInput}
        onblur={handleVolumeBlur}
        class="w-full font-mono"
        aria-label="Batch volume"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <Label for="batch-unit" class="text-xs">Unit</Label>
      <Select
        type="single"
        value={app.batch.unit}
        onValueChange={(v: string) => {
          if (v === 'L' || v === 'gal') {
            app.batch.unit = v
          }
        }}
      >
        <SelectTrigger id="batch-unit" class="w-48" aria-label="Volume unit">
          <SelectPrimitive.Value placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          {#each UNIT_OPTIONS as opt (opt.value)}
            <SelectItem value={opt.value}>{opt.label}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
  </div>
</SectionCard>
