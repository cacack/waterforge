<script lang="ts">
  import {
    SALTS,
    SALT_ORDER,
    ION_ORDER,
    profileToIonProfile,
    type SaltId,
    type IonId,
    type SolveResult,
  } from '$lib'
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
  import TrendingUpIcon from '@lucide/svelte/icons/trending-up'
  import TrendingDownIcon from '@lucide/svelte/icons/trending-down'

  let { result }: { result: SolveResult | null } = $props()

  // Salts prescribed for the batch (> 0 grams only), ordered by SALT_ORDER.
  const doses = $derived(
    result
      ? SALT_ORDER.filter((s) => (result.recipe[s] ?? 0) > 0).map((s) => ({
          id: s as SaltId,
          grams: result.recipe[s] ?? 0,
        }))
      : [],
  )

  // Target ion profile derived locally from the chosen Profile.
  const targetProfile = $derived(
    app.target ? profileToIonProfile(app.target) : null,
  )

  // Tolerance below which a deviation is not flagged (mg/L).
  const TOLERANCE = 0.05

  interface IonRow {
    id: IonId
    label: string
    target: number
    achieved: number
    delta: number
    /** 'over' | 'under' | 'ok' */
    status: 'over' | 'under' | 'ok'
  }

  // Per-ion comparison rows (only ions where either target or achieved is > 0).
  const ionRows = $derived((): IonRow[] => {
    if (!result || !targetProfile) return []
    return ION_ORDER.flatMap((id) => {
      const target = targetProfile[id] ?? 0
      const achieved = result.resultProfile[id] ?? 0
      if (target === 0 && achieved === 0) return []
      const delta = achieved - target
      const status =
        Math.abs(delta) <= TOLERANCE ? 'ok' : delta > 0 ? 'over' : 'under'
      return [{ id, label: ionLabel(id), target, achieved, delta, status }]
    })
  })

  function ionLabel(id: IonId): string {
    const labels: Record<IonId, string> = {
      Ca: 'Ca²⁺',
      Mg: 'Mg²⁺',
      Na: 'Na⁺',
      K: 'K⁺',
      HCO3: 'HCO₃⁻',
      SO4: 'SO₄²⁻',
      Cl: 'Cl⁻',
    }
    return labels[id]
  }

  function fmtMgl(v: number): string {
    return v.toFixed(2)
  }

  function fmtDelta(delta: number): string {
    const sign = delta > 0 ? '+' : ''
    return `${sign}${delta.toFixed(2)}`
  }
</script>

<SectionCard title="Recipe">
  {#if result && doses.length}
    <!-- Salt recipe table -->
    <div class="mb-5">
      <p class="text-muted-foreground mb-2 text-xs">
        Salts for <span class="font-mono"
          >{app.batch.volume}&nbsp;{app.batch.unit}</span
        >
      </p>
      <table class="w-full text-sm">
        <thead class="text-muted-foreground text-xs">
          <tr>
            <th class="pb-1 text-left font-normal">Salt</th>
            <th class="pb-1 text-right font-normal">g</th>
          </tr>
        </thead>
        <tbody>
          {#each doses as d (d.id)}
            <tr class="border-border/60 border-t">
              <td class="py-1">{SALTS[d.id].name}</td>
              <td class="py-1 text-right font-mono tabular-nums"
                >{d.grams.toFixed(3)}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Achieved vs target ion table -->
    {#if ionRows().length}
      <div>
        <p class="text-muted-foreground mb-2 text-xs">
          Ions achieved vs target (mg/L)
        </p>
        <table class="w-full text-sm">
          <thead class="text-muted-foreground text-xs">
            <tr>
              <th class="pb-1 text-left font-normal">Ion</th>
              <th class="pb-1 text-right font-normal">Target</th>
              <th class="pb-1 text-right font-normal">Achieved</th>
              <th class="pb-1 text-right font-normal">Δ</th>
            </tr>
          </thead>
          <tbody>
            {#each ionRows() as row (row.id)}
              <tr class="border-border/60 border-t">
                <td class="py-1 font-mono text-xs">{row.label}</td>
                <td
                  class="text-muted-foreground py-1 text-right font-mono tabular-nums"
                  >{fmtMgl(row.target)}</td
                >
                <td class="py-1 text-right font-mono tabular-nums"
                  >{fmtMgl(row.achieved)}</td
                >
                <td class="py-1 text-right font-mono tabular-nums">
                  {#if row.status === 'ok'}
                    <span class="text-muted-foreground text-xs">✓</span>
                  {:else if row.status === 'over'}
                    <span
                      class="inline-flex items-center justify-end gap-1 text-xs text-amber-600 dark:text-amber-400"
                      aria-label="Above target by {fmtDelta(row.delta)} mg/L"
                    >
                      <TrendingUpIcon class="size-3.5" aria-hidden="true" />
                      {fmtDelta(row.delta)}
                    </span>
                  {:else}
                    <!-- Both over- and under-target are "out of tolerance"
                         deviations; the brand reserves blue for active state,
                         not status, so both directions use the amber warning
                         tone and the arrow icon carries the direction. -->
                    <span
                      class="inline-flex items-center justify-end gap-1 text-xs text-amber-600 dark:text-amber-400"
                      aria-label="Below target by {fmtDelta(row.delta)} mg/L"
                    >
                      <TrendingDownIcon class="size-3.5" aria-hidden="true" />
                      {fmtDelta(row.delta)}
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:else if result}
    <p class="text-muted-foreground text-sm">
      No salts needed — the source already matches the target.
    </p>
  {:else}
    <p class="text-muted-foreground text-sm">Choose a target water to start.</p>
  {/if}
</SectionCard>
