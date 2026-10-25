<script lang="ts">
  import Header from './components/Header.svelte'
  import Footer from './components/Footer.svelte'
  import TargetSection from './components/TargetSection.svelte'
  import SourceSection from './components/SourceSection.svelte'
  import SaltsSection from './components/SaltsSection.svelte'
  import BatchSection from './components/BatchSection.svelte'
  import CarbonationSection from './components/CarbonationSection.svelte'
  import RecipePanel from './components/RecipePanel.svelte'
  import ReadoutsPanel from './components/ReadoutsPanel.svelte'
  import HelpDialog from './components/HelpDialog.svelte'
  import { computeResult } from './state.svelte'
  import { applyTheme } from './theme.svelte'
  import {
    loadFromStorage,
    initPersistence,
    applyParsedHash,
  } from './persist.svelte'
  import { parseHash } from './share'

  const result = $derived(computeResult())

  // Restore persisted state before first render.
  // URL hash wins over localStorage: it is applied after loadFromStorage() so
  // a shared link always takes precedence. A snapshot link (`#v1:…`, `#2…`)
  // replaces the whole recipe; a target link (`#<slug>`) selects that target
  // and leaves source, salts, batch and carbonation alone. Unknown or
  // malformed hashes are ignored and left in place. When something was
  // applied, the hash is cleared so later manual edits are not "stuck" on the
  // shared URL.
  function applyHashIfPresent() {
    const rawHash = location.hash.slice(1) // strip leading '#'
    if (!rawHash) return
    const parsed = parseHash(rawHash)
    if (parsed === null || !applyParsedHash(parsed)) return
    // Remove the hash from the address bar without creating a history entry
    // so the back-button still works as expected.
    history.replaceState(null, '', location.pathname + location.search)
  }

  loadFromStorage()
  applyHashIfPresent()

  // A shared URL pasted into the *same* tab as an already-running Waterforge
  // session is a fragment-only navigation — the browser does not reload the
  // page, so the initial-mount code above never re-runs. Listen for
  // hashchange and re-apply so the second-paste case works. Issue #63.
  $effect(() => {
    function onHashChange() {
      applyHashIfPresent()
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  })

  // Keep the document theme class in sync with the theme store.
  $effect(() => {
    applyTheme()
  })

  // Wire localStorage persistence (writes on every state change).
  // This runs after any URL-hash snapshot has been applied, so the shared
  // state is immediately persisted for future visits (no hash needed).
  initPersistence()
</script>

<div class="min-h-svh bg-background text-foreground">
  <Header />

  <main class="@container mx-auto max-w-6xl px-4 py-6">
    <div class="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_24rem]">
      <!-- Inputs -->
      <div class="flex flex-col gap-5">
        <TargetSection />
        <SourceSection />
        <SaltsSection />
        <BatchSection />
        <CarbonationSection />
      </div>

      <!-- Live recipe + readouts.
           At @3xl the pane is sticky and self-starts so it doesn't stretch.
           A max-height tied to the viewport (minus the sticky header band)
           plus overflow-y-auto keeps the entire pane reachable on short
           viewports where its content exceeds the viewport height. -->
      <div
        class="flex flex-col gap-5 @3xl:sticky @3xl:top-20 @3xl:max-h-[calc(100svh-6rem)] @3xl:self-start @3xl:overflow-y-auto"
      >
        <RecipePanel {result} />
        <ReadoutsPanel {result} />
      </div>
    </div>
  </main>

  <Footer />

  <!-- Mounted once; opened from the header's `?` and RecipePanel (#234). -->
  <HelpDialog />
</div>
