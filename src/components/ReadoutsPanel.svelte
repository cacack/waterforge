<script lang="ts">
  import { AlertTriangle, Info } from '@lucide/svelte'
  import type { SolveResult } from '$lib'
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert'
  import SectionCard from './SectionCard.svelte'

  let { result }: { result: SolveResult | null } = $props()

  // ── Readout formatting ────────────────────────────────────────────────────
  const so4cl = $derived(
    result
      ? result.readouts.sulfateChlorideRatio === Infinity
        ? '∞'
        : result.readouts.sulfateChlorideRatio.toFixed(2)
      : '—',
  )

  // ── Saturation warnings (hard) ────────────────────────────────────────────
  // Already computed by the solver; just surface them.

  // ── Procedural guidance (soft) ───────────────────────────────────────────
  // Thresholds and rules:
  //
  // 1. Carbonate-first (Lersch method): triggered when the recipe contains any
  //    of chalk, bakingSoda, or potassiumBicarbonate.  These salts do not
  //    dissolve well in plain water; carbonating first (CO₂ → carbonic acid)
  //    provides the acid needed to dissolve them.
  //
  // 2. High-Mg + high-bicarbonate: Mg ≥ 50 mg/L AND HCO₃ ≥ 200 mg/L.
  //    Threshold rationale: Mg(HCO₃)₂ starts to stress solubility at these
  //    levels and the pair noticeably inhibits chalk dissolution when both
  //    exceed these values.
  //
  // 3. TDS taste note: TDS > 1500 mg/L — strongly mineral taste perceptible by
  //    most tasters; Evian sits ~350, Gerolsteiner ~2500 is the upper bound for
  //    popular mineral waters.

  const guidance = $derived((): GuidanceItem[] => {
    if (!result) return []

    const items: GuidanceItem[] = []
    const { recipe, resultProfile, readouts } = result

    // 1. Carbonate-first guidance
    const usesCarbonate = (Object.entries(recipe) as [string, number][]).some(
      ([id, dose]) =>
        dose > 0 &&
        (id === 'chalk' ||
          id === 'bakingSoda' ||
          id === 'potassiumBicarbonate'),
    )

    if (usesCarbonate) {
      items.push({
        key: 'carbonate-first',
        title: 'Carbonate the water first',
        body: 'This recipe uses carbonate/bicarbonate salts (chalk, baking soda, or potassium bicarbonate). Carbonate your distilled water with CO₂ first — the dissolved carbonic acid will dissolve these salts much more readily (the Lersch method). Add other salts afterwards.',
      })
    }

    // 2. High-Mg + high-bicarbonate
    const mg = resultProfile.Mg ?? 0
    const hco3 = resultProfile.HCO3 ?? 0
    if (mg >= 50 && hco3 >= 200) {
      items.push({
        key: 'mg-hco3',
        title: 'High Mg + HCO₃ — dissolution caveat',
        body: `This recipe has high magnesium (${mg.toFixed(0)} mg/L) and high bicarbonate (${hco3.toFixed(0)} mg/L). Mg(HCO₃)₂ is sparingly soluble; dissolving may take longer or require gentle warming. Carbonating first (as above) helps. If precipitation appears, reduce dose slightly.`,
      })
    }

    // 3. TDS taste note
    if (readouts.tds > 1500) {
      items.push({
        key: 'tds-taste',
        title: 'Strongly mineral taste',
        body: `TDS is ${Math.round(readouts.tds)} mg/L — well above most popular still mineral waters (~300–800 mg/L). This water will taste distinctly mineral, similar to a heavily mineralised sparkling water. Consider reducing target concentrations if a subtler taste is preferred.`,
      })
    }

    return items
  })

  interface GuidanceItem {
    key: string
    title: string
    body: string
  }
</script>

<SectionCard title="Readouts & warnings">
  {#if result}
    <!-- ── Readout grid ─────────────────────────────────────────────────── -->
    <dl class="grid grid-cols-3 gap-2 text-sm">
      <div
        title="Sulfate-to-chloride mass ratio (mg/L ÷ mg/L). Higher values favour a drier, more mineral character; lower values favour a rounder, softer taste."
      >
        <dt class="text-muted-foreground text-xs">SO₄:Cl</dt>
        <dd class="tabular-nums">{so4cl}</dd>
      </div>
      <div
        title="Total dissolved solids — sum of all modelled ion concentrations (mg/L). Typical drinking water: 50–500 mg/L."
      >
        <dt class="text-muted-foreground text-xs">TDS</dt>
        <dd class="tabular-nums">{Math.round(result.readouts.tds)} mg/L</dd>
      </div>
      <div
        title="Charge-balance residual (meq/L). Near zero means cation and anion charges balance; a large residual suggests mismatched source data or a unit convention error."
      >
        <dt class="text-muted-foreground text-xs">Charge</dt>
        <dd class="tabular-nums">
          {result.readouts.chargeResidual.toFixed(2)} meq/L
        </dd>
      </div>
    </dl>

    <!-- ── Hard warnings: saturation ─────────────────────────────────────── -->
    {#if result.warnings.length}
      <div class="mt-3 flex flex-col gap-2">
        {#each result.warnings as w (w.mineral)}
          <Alert variant="destructive" class="py-2">
            <AlertTriangle class="size-4" />
            <AlertTitle class="text-xs font-semibold capitalize"
              >{w.mineral} supersaturation (SI {w.saturationIndex.toFixed(
                2,
              )})</AlertTitle
            >
            <AlertDescription class="text-xs">{w.message}</AlertDescription>
          </Alert>
        {/each}
      </div>
    {/if}

    <!-- ── Soft guidance: procedural tips ────────────────────────────────── -->
    {#if guidance().length}
      <div class="mt-3 flex flex-col gap-2">
        {#each guidance() as g (g.key)}
          <Alert class="py-2">
            <Info class="size-4" />
            <AlertTitle class="text-xs font-semibold">{g.title}</AlertTitle>
            <AlertDescription class="text-xs">{g.body}</AlertDescription>
          </Alert>
        {/each}
      </div>
    {/if}
  {:else}
    <p class="text-muted-foreground text-sm">—</p>
  {/if}
</SectionCard>
