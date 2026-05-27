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

  // Local string state so the input can hold intermediate values while typing.
  let rawVolume = $state(String(app.batch.volume))

  function handleVolumeInput(event: Event) {
    const input = event.target as HTMLInputElement
    rawVolume = input.value
    const parsed = parseFloat(input.value)
    if (Number.isFinite(parsed) && parsed > 0) {
      app.batch.volume = parsed
    }
  }

  function handleVolumeBlur() {
    // On blur, clamp / reset to current valid value.
    const parsed = parseFloat(rawVolume)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      rawVolume = String(app.batch.volume)
    } else {
      app.batch.volume = parsed
      rawVolume = String(parsed)
    }
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
        class="w-full"
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
