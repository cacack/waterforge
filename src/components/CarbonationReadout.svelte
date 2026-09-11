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
  import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2'
  import CircleIcon from '@lucide/svelte/icons/circle'
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
    <p class="mb-2 text-xs text-muted-foreground">Carbonation</p>
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
      <div class="rounded-md bg-muted/50 px-3 py-2.5 text-sm">
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
          <span class="block text-xs text-muted-foreground"
            >This carbonation needs no added pressure at this temperature.</span
          >
        {/if}
      </div>
      <!-- Provenance for the carbonation figure, mirroring the target
           profile's badge in TargetSection. Most bottled-carbonation targets
           are unverified estimates (ADR 0013); showing a precise psi without
           saying so would overstate the number's authority. -->
      <div class="mt-2 space-y-1 text-xs">
        <div class="flex items-center gap-1.5">
          {#if readout.provenance.verified}
            <CheckCircle2Icon class="size-3.5 shrink-0 text-green-500" />
            <span class="font-medium text-green-600 dark:text-green-400"
              >Verified carbonation figure</span
            >
          {:else}
            <CircleIcon class="size-3.5 shrink-0 text-muted-foreground" />
            <span class="text-muted-foreground"
              >Estimated carbonation figure</span
            >
          {/if}
        </div>
        <p class="leading-snug text-muted-foreground">
          {readout.provenance.source}
          {#if readout.provenance.source_date}
            <span class="opacity-70">({readout.provenance.source_date})</span>
          {/if}
        </p>
      </div>
    {:else}
      <p class="text-sm text-muted-foreground">
        Enter a carbonating temperature to see the regulator pressure.
      </p>
    {/if}
  </div>
{:else if readout.kind === 'sparkling-unknown'}
  <!-- Known sparkling, but no sourced target. Rendering nothing here would
       read as "no carbonation needed" — the opposite of the truth — so say
       plainly that the number is unknown and point at the calculator, which
       works from a target the user supplies. No directional wording: the
       calculator is a sibling column at wide widths and stacked above at
       narrow ones. -->
  <div class="mt-5">
    <p class="mb-1 text-xs text-muted-foreground">Carbonation</p>
    <div class="rounded-md bg-muted/50 px-3 py-2.5 text-sm">
      <span class="font-medium">Sparkling</span> — no sourced carbonation target
      for this water yet.
      <span class="mt-1 block text-xs text-muted-foreground">
        We only record a target when one can be authoritatively sourced. Use the
        carbonation calculator with your own target to get a regulator pressure.
      </span>
    </div>
  </div>
{:else if readout.kind === 'still'}
  <div class="mt-5">
    <p class="text-sm text-muted-foreground">Still water — no carbonation.</p>
  </div>
{/if}
