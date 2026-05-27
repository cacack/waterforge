<script lang="ts">
  import Header from './components/Header.svelte'
  import TargetSection from './components/TargetSection.svelte'
  import SourceSection from './components/SourceSection.svelte'
  import SaltsSection from './components/SaltsSection.svelte'
  import BatchSection from './components/BatchSection.svelte'
  import RecipePanel from './components/RecipePanel.svelte'
  import ReadoutsPanel from './components/ReadoutsPanel.svelte'
  import { computeResult } from './state.svelte'
  import { applyTheme } from './theme.svelte'

  const result = $derived(computeResult())

  // Keep the document theme class in sync with the theme store.
  $effect(() => {
    applyTheme()
  })
</script>

<div class="bg-background text-foreground min-h-svh">
  <Header />

  <main class="@container mx-auto max-w-6xl px-4 py-6">
    <div class="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_24rem]">
      <!-- Inputs -->
      <div class="flex flex-col gap-5">
        <TargetSection />
        <SourceSection />
        <SaltsSection />
        <BatchSection />
      </div>

      <!-- Live recipe + readouts -->
      <div class="flex flex-col gap-5 @3xl:sticky @3xl:top-20 @3xl:self-start">
        <RecipePanel {result} />
        <ReadoutsPanel {result} />
      </div>
    </div>
  </main>
</div>
