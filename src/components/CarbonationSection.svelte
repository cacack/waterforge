<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import SectionCard from './SectionCard.svelte'
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
    gramsPerLitreToVolumes,
    regulatorPsi,
    toCarbonationVolumes,
    toCelsius,
    volumesToGramsPerLitre,
    type CarbonationUnit,
    type TemperatureUnit,
  } from '$lib'

  // Standalone "set-and-forget" force-carbonation calculator (issue #121): a
  // manual what-if tool with its own local state. The profile-driven
  // carbonation line in the recipe output (issue #123) is separate and owns
  // its own shared/persisted carbonating temperature.
  let carbonationInput = $state('2.4') // typical sparkling-water level (volumes CO₂)
  let carbonationUnit = $state<CarbonationUnit>('volumes')
  let tempInput = $state('4') // typical fridge / serving temperature (°C)
  let tempUnit = $state<TemperatureUnit>('C')

  const carbonationValue = $derived(parseFloat(carbonationInput))
  const tempValue = $derived(parseFloat(tempInput))

  const valid = $derived(
    Number.isFinite(carbonationValue) &&
      carbonationValue >= 0 &&
      Number.isFinite(tempValue),
  )

  const targetVolumes = $derived(
    valid ? toCarbonationVolumes(carbonationValue, carbonationUnit) : 0,
  )
  const tempC = $derived(valid ? toCelsius(tempValue, tempUnit) : 0)
  const psi = $derived(valid ? regulatorPsi(targetVolumes, tempC) : null)

  // The same carbonation in the *other* unit, for cross-reference. Derived from
  // the canonical `targetVolumes` (not the raw input) so it shares the single
  // normalisation path, and guarded on `valid` so it never renders "NaN".
  const equivalent = $derived(
    !valid
      ? null
      : carbonationUnit === 'volumes'
        ? `${volumesToGramsPerLitre(targetVolumes).toFixed(1)} g/L`
        : `${targetVolumes.toFixed(2)} volumes`,
  )

  // Switching a unit converts the in-flight value so the underlying carbonation
  // / temperature stays the same — otherwise the same digits would be silently
  // reinterpreted in the new unit (e.g. 2.4 volumes → read as 2.4 g/L).
  function changeCarbonationUnit(next: CarbonationUnit) {
    if (next === carbonationUnit) return
    if (Number.isFinite(carbonationValue)) {
      const converted =
        next === 'gPerL'
          ? volumesToGramsPerLitre(carbonationValue)
          : gramsPerLitreToVolumes(carbonationValue)
      carbonationInput = String(Number(converted.toFixed(2)))
    }
    carbonationUnit = next
  }

  function changeTempUnit(next: TemperatureUnit) {
    if (next === tempUnit) return
    if (Number.isFinite(tempValue)) {
      const converted =
        next === 'F'
          ? celsiusToFahrenheit(tempValue)
          : fahrenheitToCelsius(tempValue)
      tempInput = String(Number(converted.toFixed(1)))
    }
    tempUnit = next
  }

  const CARBONATION_UNITS: { value: CarbonationUnit; label: string }[] = [
    { value: 'volumes', label: 'Volumes CO₂' },
    { value: 'gPerL', label: 'g/L CO₂' },
  ]
  const TEMP_UNITS: { value: TemperatureUnit; label: string }[] = [
    { value: 'C', label: '°C' },
    { value: 'F', label: '°F' },
  ]

  // Sensible lower bound for the temperature field, matched to the selected
  // unit (serving temperatures are never below freezing in practice).
  const tempMin = $derived(tempUnit === 'C' ? -10 : 14)
</script>

<SectionCard title="Carbonation">
  <div class="flex flex-col gap-3">
    <p class="text-muted-foreground text-xs">
      Force-carbonate a sparkling clone: pick a target CO₂ level and your
      serving temperature to get the regulator pressure to set and forget.
    </p>
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <Label for="carbonation-target" class="text-xs"
          >Target carbonation</Label
        >
        <Input
          id="carbonation-target"
          type="number"
          min="0"
          step="0.1"
          inputmode="decimal"
          bind:value={carbonationInput}
          class="w-full font-mono"
          aria-label="Target carbonation"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="carbonation-unit" class="text-xs">Unit</Label>
        <Select
          type="single"
          value={carbonationUnit}
          onValueChange={(v: string) => {
            if (v === 'volumes' || v === 'gPerL') changeCarbonationUnit(v)
          }}
        >
          <SelectTrigger
            id="carbonation-unit"
            class="w-36"
            aria-label="Carbonation unit"
          >
            <SelectPrimitive.Value placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {#each CARBONATION_UNITS as opt (opt.value)}
              <SelectItem value={opt.value}>{opt.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="flex flex-wrap items-end gap-3">
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <Label for="carbonation-temp" class="text-xs">Serving temperature</Label
        >
        <Input
          id="carbonation-temp"
          type="number"
          min={tempMin}
          step="1"
          inputmode="decimal"
          bind:value={tempInput}
          class="w-full font-mono"
          aria-label="Serving temperature"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="carbonation-temp-unit" class="text-xs">Unit</Label>
        <Select
          type="single"
          value={tempUnit}
          onValueChange={(v: string) => {
            if (v === 'C' || v === 'F') changeTempUnit(v)
          }}
        >
          <SelectTrigger
            id="carbonation-temp-unit"
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

    {#if psi !== null}
      <div class="bg-muted/50 rounded-md px-3 py-2.5 text-sm">
        Set your regulator to
        <span class="font-mono font-semibold">{psi.toFixed(1)} psi</span>
        {#if psi === 0}
          <span class="text-muted-foreground"
            >— this carbonation needs no added pressure at this temperature.</span
          >
        {/if}
        <span class="text-muted-foreground block text-xs"
          >Target ≈ {equivalent}. Leave the keg at this pressure and temperature
          until carbonation equilibrates (typically a few days).</span
        >
      </div>
    {:else}
      <p class="text-muted-foreground text-sm">
        Enter a target carbonation and temperature to see the regulator
        pressure.
      </p>
    {/if}
  </div>
</SectionCard>
