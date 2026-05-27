<script lang="ts">
  import { ION_ORDER, caco3ToHco3, hco3ToCaco3, type IonId } from '$lib'
  import { Switch } from '$lib/components/ui/switch'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'

  // Alkalinity unit toggle: 'hco3' (default, native engine units) or 'caco3'
  type AlkUnit = 'hco3' | 'caco3'
  let alkUnit = $state<AlkUnit>('hco3')

  // Display values for each ion — stored as strings to handle empty/partial input.
  // HCO3 is stored in the user's chosen unit; all others are in mg/L as-is.
  let displayValues = $state<Record<IonId, string>>({
    Ca: '',
    Mg: '',
    Na: '',
    K: '',
    HCO3: '',
    SO4: '',
    Cl: '',
  })

  // Human-readable ion labels with subscripts for display.
  const ION_LABELS: Record<IonId, string> = {
    Ca: 'Ca',
    Mg: 'Mg',
    Na: 'Na',
    K: 'K',
    HCO3: 'HCO₃',
    SO4: 'SO₄',
    Cl: 'Cl',
  }

  // Write a parsed mg/L value into app.source, clamping negatives to zero.
  function writeIon(ion: IonId, raw: string) {
    const parsed = parseFloat(raw)
    const mgPerL = isNaN(parsed) || parsed < 0 ? 0 : parsed

    if (ion === 'HCO3') {
      // Always store as-HCO3 in the engine regardless of display unit.
      app.source[ion] = alkUnit === 'caco3' ? caco3ToHco3(mgPerL) : mgPerL
    } else {
      app.source[ion] = mgPerL
    }
  }

  // When the user switches alkalinity units, convert the displayed HCO3 value
  // so it represents the same physical quantity in the new unit. The engine
  // value in app.source.HCO3 is unchanged (always as-HCO3).
  function switchAlkUnit(newUnit: AlkUnit) {
    if (newUnit === alkUnit) return
    const currentDisplay = parseFloat(displayValues.HCO3)
    if (!isNaN(currentDisplay) && currentDisplay > 0) {
      if (newUnit === 'caco3') {
        // was as-HCO3, convert displayed value to as-CaCO3
        displayValues.HCO3 = String(
          parseFloat(hco3ToCaco3(currentDisplay).toFixed(2)),
        )
      } else {
        // was as-CaCO3, convert displayed value back to as-HCO3
        displayValues.HCO3 = String(
          parseFloat(caco3ToHco3(currentDisplay).toFixed(2)),
        )
      }
    }
    alkUnit = newUnit
  }

  function handleInput(ion: IonId, value: string) {
    displayValues[ion] = value
    writeIon(ion, value)
  }

  // Toggle the source mode and zero out source when switching back to distilled.
  function toggleSourceMode(checked: boolean) {
    if (checked) {
      app.sourceMode = 'known'
    } else {
      app.sourceMode = 'distilled'
      // Clear display values and engine state when reverting to distilled.
      for (const ion of ION_ORDER) {
        displayValues[ion] = ''
        app.source[ion as IonId] = 0
      }
    }
  }

  const isKnown = $derived(app.sourceMode === 'known')
</script>

<SectionCard title="Source water">
  <!-- Mode toggle row -->
  <div class="mb-3 flex items-center gap-3">
    <Switch
      id="source-mode-switch"
      checked={isKnown}
      onCheckedChange={toggleSourceMode}
      size="sm"
    />
    <Label for="source-mode-switch" class="cursor-pointer select-none">
      {isKnown ? 'Known source' : 'Distilled / RO (all ions zero)'}
    </Label>
  </div>

  {#if isKnown}
    <!-- Ion input grid -->
    <div class="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
      {#each ION_ORDER as ion (ion)}
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between gap-1">
            <Label for="source-{ion}" class="text-xs font-normal">
              {ION_LABELS[ion as IonId]}
            </Label>
            <!-- Alkalinity unit toggle — only on HCO3 row -->
            {#if ion === 'HCO3'}
              <div class="flex overflow-hidden rounded border text-xs">
                <button
                  type="button"
                  class="px-1.5 py-0.5 transition-colors {alkUnit === 'hco3'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted'}"
                  onclick={() => switchAlkUnit('hco3')}
                  title="Enter alkalinity as mg/L HCO₃ (native engine units)"
                >
                  HCO₃
                </button>
                <button
                  type="button"
                  class="px-1.5 py-0.5 transition-colors {alkUnit === 'caco3'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted'}"
                  onclick={() => switchAlkUnit('caco3')}
                  title="Enter alkalinity as mg/L CaCO₃ (common on water reports) — converted to HCO₃ before solving"
                >
                  CaCO₃
                </button>
              </div>
            {/if}
          </div>
          <div class="relative">
            <Input
              id="source-{ion}"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={displayValues[ion as IonId]}
              oninput={(e) =>
                handleInput(ion as IonId, (e.target as HTMLInputElement).value)}
              class="h-7 pr-8 text-xs"
            />
            <span
              class="text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            >
              mg/L
            </span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Alkalinity unit hint — makes the active conversion unmistakable -->
    <p class="text-muted-foreground mt-2 text-xs">
      {#if alkUnit === 'caco3'}
        <span class="text-amber-600 dark:text-amber-400"
          >Alkalinity entered as CaCO₃ — converted to HCO₃ (×{(
            61.017 / 50.0435
          ).toFixed(4)}) before solving.</span
        >
      {:else}
        Alkalinity entered as HCO₃ (native engine units — matches most lab
        reports).
      {/if}
    </p>
  {/if}
</SectionCard>
