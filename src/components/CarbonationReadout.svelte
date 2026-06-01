<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from '$lib/components/ui/select'
  import {
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    type TemperatureUnit,
  } from '$lib'
  import { app, computeCarbonation } from '../state.svelte'

  // Bound to the shared carbonating-temperature state — the recipe line owns
  // this; the standalone CarbonationSection keeps its own local state.
  const readout = $derived(computeCarbonation())

  // Switching the unit converts the value so the underlying temperature stays
  // the same — otherwise the same digits would be reinterpreted in the new
  // unit (mirrors CarbonationSection's idiom).
  function changeTempUnit(next: TemperatureUnit) {
    if (next === app.carbonation.tempUnit) return
    if (Number.isFinite(app.carbonation.temp)) {
      const converted =
        next === 'F'
          ? celsiusToFahrenheit(app.carbonation.temp)
          : fahrenheitToCelsius(app.carbonation.temp)
      app.carbonation.temp = Number(converted.toFixed(1))
    }
    app.carbonation.tempUnit = next
  }

  const TEMP_UNITS: { value: TemperatureUnit; label: string }[] = [
    { value: 'C', label: '°C' },
    { value: 'F', label: '°F' },
  ]

  // Sensible bounds for the temperature field, matched to the unit. The
  // empirical carbonation fit is only meaningful around fridge-to-room
  // temperature, so cap the field there rather than letting it run away.
  const tempMin = $derived(app.carbonation.tempUnit === 'C' ? -10 : 14)
  const tempMax = $derived(app.carbonation.tempUnit === 'C' ? 40 : 104)

  // A cleared number field binds to NaN; guard so we prompt for a value rather
  // than rendering "NaN psi".
  const tempValid = $derived(Number.isFinite(app.carbonation.temp))
</script>

{#if readout.kind === 'target'}
  <div class="mt-5">
    <p class="text-muted-foreground mb-2 text-xs">Carbonation</p>
    <div class="mb-3 flex flex-wrap items-end gap-3">
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <Label for="recipe-carbonation-temp" class="text-xs"
          >Carbonating temperature</Label
        >
        <Input
          id="recipe-carbonation-temp"
          type="number"
          min={tempMin}
          max={tempMax}
          step="1"
          inputmode="decimal"
          bind:value={app.carbonation.temp}
          class="w-full font-mono"
          aria-label="Carbonating temperature"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="recipe-carbonation-temp-unit" class="text-xs">Unit</Label>
        <Select
          type="single"
          value={app.carbonation.tempUnit}
          onValueChange={(v: string) => {
            if (v === 'C' || v === 'F') changeTempUnit(v)
          }}
        >
          <SelectTrigger
            id="recipe-carbonation-temp-unit"
            class="w-36"
            aria-label="Temperature unit"
          >
            <SelectPrimitive.Value placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {#each TEMP_UNITS as opt (opt.value)}
              <SelectItem value={opt.value}>{opt.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
    </div>
    {#if tempValid}
      <div class="bg-muted/50 rounded-md px-3 py-2.5 text-sm">
        Carbonate to
        <span class="font-mono font-semibold"
          >{readout.gPerL.toFixed(1)} g/L</span
        >
        (≈ {readout.volumes.toFixed(2)} volumes) →
        <span class="font-mono font-semibold">{readout.psi.toFixed(1)} psi</span
        >
        at {app.carbonation.temp} °{app.carbonation.tempUnit}
        <!-- Match the rounded display: anything under 0.05 shows as "0.0 psi",
             so treat it as "no added pressure" rather than testing === 0
             (regulatorPsi can clamp to a hair above 0 for floating-point
             reasons near the atmospheric-solubility boundary). -->
        {#if readout.psi < 0.05}
          <span class="text-muted-foreground block text-xs"
            >This carbonation needs no added pressure at this temperature.</span
          >
        {/if}
      </div>
    {:else}
      <p class="text-muted-foreground text-sm">
        Enter a carbonating temperature to see the regulator pressure.
      </p>
    {/if}
  </div>
{:else if readout.kind === 'still'}
  <div class="mt-5">
    <p class="text-muted-foreground text-sm">Still water — no carbonation.</p>
  </div>
{/if}
