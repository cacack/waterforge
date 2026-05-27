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

  // Per-ion "typed" overrides: while the user edits a field we hold their raw
  // string here; otherwise each field is derived from app.source, so external
  // changes (import, reload restore, shared links) show up in the inputs — not
  // just in the recipe.
  let typed = $state<Partial<Record<IonId, string>>>({})

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

  // The value shown in an ion input: the user's in-progress text if editing,
  // otherwise the engine value (HCO3 expressed in the active alkalinity unit).
  function displayFor(ion: IonId): string {
    const override = typed[ion]
    if (override != null) return override
    const v = app.source[ion]
    if (!v) return '' // undefined or 0 → empty (placeholder shows 0)
    if (ion === 'HCO3' && alkUnit === 'caco3') {
      return String(parseFloat(hco3ToCaco3(v).toFixed(2)))
    }
    return String(v)
  }

  // Write a parsed value into app.source, always stored as-HCO3 / mg/L.
  function writeIon(ion: IonId, raw: string) {
    const parsed = parseFloat(raw)
    const mgPerL = isNaN(parsed) || parsed < 0 ? 0 : parsed
    app.source[ion] =
      ion === 'HCO3' && alkUnit === 'caco3' ? caco3ToHco3(mgPerL) : mgPerL
  }

  function handleInput(ion: IonId, value: string) {
    typed[ion] = value
    writeIon(ion, value)
  }

  function handleBlur(ion: IonId) {
    // Drop the edit override so the field reflects the canonical engine value.
    typed[ion] = undefined
  }

  // Switching alkalinity units changes only how HCO3 is *displayed*; the engine
  // value (app.source.HCO3, always as-HCO3) is unchanged. Clearing the HCO3
  // override lets displayFor() re-render it in the new unit.
  function switchAlkUnit(newUnit: AlkUnit) {
    if (newUnit === alkUnit) return
    typed.HCO3 = undefined
    alkUnit = newUnit
  }

  // Toggle source mode; zero source + clear edits when reverting to distilled.
  function toggleSourceMode(checked: boolean) {
    if (checked) {
      app.sourceMode = 'known'
    } else {
      app.sourceMode = 'distilled'
      for (const ion of ION_ORDER) {
        typed[ion as IonId] = undefined
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
              value={displayFor(ion as IonId)}
              oninput={(e) =>
                handleInput(ion as IonId, (e.target as HTMLInputElement).value)}
              onblur={() => handleBlur(ion as IonId)}
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
