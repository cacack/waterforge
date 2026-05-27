<script lang="ts">
  // Actions toolbar — export (download / copy) and import (file or paste) for
  // the current recipe state. Designed to be extensible: issue #23 (share link)
  // will add a button here as well.
  //
  // Export formats supported:
  //   - AppSnapshot JSON (canonical; round-trips perfectly via applySnapshot).
  //
  // Import formats supported:
  //   - AppSnapshot JSON  (version:1, source as-HCO₃ — native round-trip).
  //   - Profile JSON      (the Profile schema with alkalinity_unit; converted
  //                        via profileToIonProfile/caco3ToHco3 so as-CaCO₃
  //                        data is not silently mis-read).

  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Textarea } from '$lib/components/ui/textarea'
  import DownloadIcon from '@lucide/svelte/icons/download'
  import UploadIcon from '@lucide/svelte/icons/upload'
  import CopyIcon from '@lucide/svelte/icons/copy'
  import { snapshotState, applySnapshot } from '../persist.svelte'
  import { app } from '../state.svelte'
  import { validateProfile, profileToIonProfile, type Profile } from '$lib'

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  function buildJson(): string {
    return JSON.stringify(snapshotState(), null, 2)
  }

  function buildFilename(): string {
    const name = app.target?.name ?? 'custom'
    // Sanitise for a safe filename: lowercase, spaces → hyphens, strip
    // characters that are invalid on Windows/macOS/Linux.
    const safe = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_.]/g, '')
    return `waterforge-${safe || 'recipe'}.json`
  }

  function handleDownload() {
    const json = buildJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = buildFilename()
    a.click()
    URL.revokeObjectURL(url)
  }

  let copyLabel = $state<'copy' | 'copied'>('copy')
  let copyTimer: ReturnType<typeof setTimeout> | undefined

  async function handleCopy() {
    await navigator.clipboard.writeText(buildJson())
    copyLabel = 'copied'
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copyLabel = 'copy'
    }, 2000)
  }

  // ---------------------------------------------------------------------------
  // Import
  // ---------------------------------------------------------------------------

  let importOpen = $state(false)
  let pasteValue = $state('')
  let importError = $state<string | null>(null)
  let fileInputEl: HTMLInputElement | undefined = $state()

  function resetImportState() {
    pasteValue = ''
    importError = null
  }

  /** Try to apply pasted/file JSON. Returns true on success. */
  function applyJson(raw: string): boolean {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      importError = 'Invalid JSON — could not parse the text.'
      return false
    }

    // Detect format: AppSnapshot has "version" key; Profile has "ions" key.
    if (typeof parsed === 'object' && parsed !== null && 'version' in parsed) {
      // AppSnapshot path — applySnapshot validates internally and is tolerant.
      const before = snapshotState()
      applySnapshot(parsed)
      // Heuristic: if the target name didn't change AND all other fields match
      // exactly what was there before, the snapshot was silently ignored (likely
      // wrong version or schema). Surface that as an error.
      const after = snapshotState()
      if (JSON.stringify(before) === JSON.stringify(after)) {
        // Could be same state, or could be a rejected snapshot. Since we can't
        // distinguish "already identical" from "rejected", only warn if the
        // incoming version doesn't match ours.
        const snap = parsed as Record<string, unknown>
        if (typeof snap['version'] === 'number' && snap['version'] !== 1) {
          importError = `Unsupported snapshot version ${snap['version']}. Only version 1 is supported.`
          return false
        }
      }
      return true
    }

    if (typeof parsed === 'object' && parsed !== null && 'ions' in parsed) {
      // Profile path — validate then convert to IonProfile and load as source.
      const result = validateProfile(parsed)
      if (!result.ok) {
        const msgs = result.errors.slice(0, 3).map((e) => e.message)
        importError = `Invalid profile: ${msgs.join('; ')}`
        return false
      }
      const profile = result.value as Profile
      const ions = profileToIonProfile(profile)
      // Apply: set target to null (no snapshot target), source to profile ions,
      // sourceMode to 'known', keeping existing salts + batch.
      app.target = null
      app.source = ions
      app.sourceMode = 'known'
      return true
    }

    importError =
      'Unrecognised format. Expected an AppSnapshot (has "version") or a Profile (has "ions").'
    return false
  }

  function handlePasteImport() {
    importError = null
    if (!pasteValue.trim()) {
      importError = 'Paste some JSON first.'
      return
    }
    const ok = applyJson(pasteValue)
    if (ok) {
      importOpen = false
      resetImportState()
    }
  }

  function handleFileChange(event: Event) {
    importError = null
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const ok = applyJson(text)
      if (ok) {
        importOpen = false
        resetImportState()
      }
      // Reset the input so the same file can be re-selected.
      if (fileInputEl) fileInputEl.value = ''
    }
    reader.onerror = () => {
      importError = 'Could not read the file.'
      if (fileInputEl) fileInputEl.value = ''
    }
    reader.readAsText(file)
  }

  function handleDialogOpenChange(open: boolean) {
    importOpen = open
    if (!open) resetImportState()
  }
</script>

<div class="flex items-center gap-1">
  <!-- Download JSON -->
  <Button
    variant="ghost"
    size="icon"
    onclick={handleDownload}
    aria-label="Download recipe as JSON"
    title="Download recipe as JSON"
  >
    <DownloadIcon class="size-4" />
  </Button>

  <!-- Copy JSON to clipboard -->
  <Button
    variant="ghost"
    size="icon"
    onclick={handleCopy}
    aria-label="Copy recipe JSON to clipboard"
    title="Copy recipe JSON to clipboard"
  >
    {#if copyLabel === 'copied'}
      <span class="text-xs font-medium">✓</span>
    {:else}
      <CopyIcon class="size-4" />
    {/if}
  </Button>

  <!-- Import JSON -->
  <Dialog.Root open={importOpen} onOpenChange={handleDialogOpenChange}>
    <Dialog.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          size="icon"
          aria-label="Import recipe from JSON"
          title="Import recipe from JSON"
        >
          <UploadIcon class="size-4" />
        </Button>
      {/snippet}
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-md">
      <Dialog.Header>
        <Dialog.Title>Import recipe</Dialog.Title>
        <Dialog.Description>
          Load an AppSnapshot or Profile JSON. Accepts a file or pasted text.
        </Dialog.Description>
      </Dialog.Header>

      <div class="flex flex-col gap-4">
        <!-- File picker -->
        <div class="flex flex-col gap-1.5">
          <label for="import-file" class="text-sm font-medium">From file</label>
          <input
            id="import-file"
            bind:this={fileInputEl}
            type="file"
            accept=".json,application/json"
            onchange={handleFileChange}
            class="text-foreground file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:px-2.5 file:py-1 file:text-xs file:font-medium file:transition-colors"
          />
        </div>

        <div class="text-muted-foreground text-center text-xs">or</div>

        <!-- Paste area -->
        <div class="flex flex-col gap-1.5">
          <label for="import-paste" class="text-sm font-medium"
            >Paste JSON</label
          >
          <Textarea
            id="import-paste"
            bind:value={pasteValue}
            placeholder="Paste AppSnapshot or Profile JSON here"
            rows={6}
            class="font-mono text-xs"
          />
        </div>

        <!-- Inline error -->
        {#if importError}
          <p class="text-destructive text-sm" role="alert">{importError}</p>
        {/if}
      </div>

      <Dialog.Footer>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button {...props} variant="outline" size="sm">Cancel</Button>
          {/snippet}
        </Dialog.Close>
        <Button
          size="sm"
          onclick={handlePasteImport}
          disabled={!pasteValue.trim()}
        >
          Import
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
