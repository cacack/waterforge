<script lang="ts">
  import { PROFILES, ION_ORDER, type Profile } from '$lib'
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import * as Command from '$lib/components/ui/command/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down'
  import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2'
  import CircleIcon from '@lucide/svelte/icons/circle'
  import ExternalLinkIcon from '@lucide/svelte/icons/external-link'

  let open = $state(false)

  function selectProfile(profile: Profile) {
    app.target = profile
    open = false
  }

  /**
   * Turn a controlled-vocabulary trait slug into a human-readable label:
   * `'silica-rich'` → `'Silica-rich'` (compound term kept hyphenated),
   * `'low-mineralization'` → `'Low mineralization'` (qualifier + word).
   * Hyphens before `-rich` are part of the term; other hyphens separate words.
   */
  function humanizeTrait(trait: string): string {
    const spaced = trait.replace(/-(?!rich\b)/g, ' ')
    return spaced.charAt(0).toUpperCase() + spaced.slice(1)
  }

  /** Build a "locality, country" location string from whatever is present. */
  function locationLabel(profile: Profile): string | null {
    const parts = [profile.locality, profile.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }
</script>

<SectionCard title="Target water">
  <!-- Searchable combobox -->
  <Popover.Root bind:open>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          class="w-full justify-between font-normal"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span class="truncate">
            {app.target ? app.target.name : 'Select a water…'}
          </span>
          <ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      class="p-0 w-[var(--bits-popover-anchor-width)] min-w-64"
      align="start"
      sideOffset={4}
    >
      <Command.Root>
        <Command.Input placeholder="Search waters…" />
        <Command.List>
          <Command.Empty>
            <p>No water found.</p>
            <p class="text-muted-foreground mt-1 text-xs">
              Can't find your water?
              <a
                href="https://github.com/cacack/waterforge/issues/new?template=profile_request.md"
                target="_blank"
                rel="noopener noreferrer"
                class="text-foreground underline underline-offset-2"
              >
                Request it on GitHub</a
              >.
            </p>
          </Command.Empty>
          <Command.Group>
            {#each PROFILES as profile (profile.name)}
              <Command.Item
                value={profile.name}
                onSelect={() => selectProfile(profile)}
                data-checked={app.target?.name === profile.name}
              >
                <span class="truncate">{profile.name}</span>
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>

  <!-- Ion profile grid -->
  {#if app.target}
    <dl
      class="text-muted-foreground mt-3 grid grid-cols-3 gap-x-4 gap-y-0.5 text-xs sm:grid-cols-4"
    >
      {#each ION_ORDER as ion (ion)}
        {#if app.target.ions[ion] != null}
          <div class="flex justify-between gap-2">
            <dt>{ion}</dt>
            <dd class="font-mono tabular-nums">{app.target.ions[ion]}</dd>
          </div>
        {/if}
      {/each}
    </dl>

    <!-- Descriptive metadata (display-only) -->
    {@const location = locationLabel(app.target)}
    {#if location || app.target.description || app.target.category || (app.target.traits && app.target.traits.length > 0)}
      <div class="mt-3 space-y-1.5 text-xs">
        {#if location}
          <p class="text-muted-foreground">{location}</p>
        {/if}
        {#if app.target.description}
          <p class="text-muted-foreground leading-snug">
            {app.target.description}
          </p>
        {/if}
        {#if (app.target.traits && app.target.traits.length > 0) || app.target.category}
          <div class="flex flex-wrap gap-1">
            {#if app.target.traits}
              {#each app.target.traits as trait (trait)}
                <span
                  class="bg-muted text-muted-foreground rounded px-1.5 py-0.5"
                >
                  {humanizeTrait(trait)}
                </span>
              {/each}
            {/if}
            {#if app.target.category}
              <span
                class="border-border text-muted-foreground rounded border px-1.5 py-0.5 capitalize"
              >
                {app.target.category}
              </span>
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Provenance -->
    <div class="mt-3 space-y-1 text-xs">
      <div class="flex items-center gap-1.5">
        {#if app.target.provenance.verified}
          <CheckCircle2Icon class="size-3.5 shrink-0 text-green-500" />
          <span class="font-medium text-green-600 dark:text-green-400"
            >Verified</span
          >
        {:else}
          <CircleIcon class="size-3.5 shrink-0 text-muted-foreground" />
          <span class="text-muted-foreground">Unverified</span>
        {/if}
      </div>
      <p class="text-muted-foreground leading-snug">
        {app.target.provenance.source}
        {#if app.target.provenance.source_date}
          <span class="opacity-70">({app.target.provenance.source_date})</span>
        {/if}
      </p>
      {#if app.target.url}
        <a
          href={app.target.url}
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary inline-flex items-center gap-1 underline-offset-2 hover:underline"
        >
          Source
          <ExternalLinkIcon class="size-3" />
        </a>
      {/if}
    </div>
  {:else}
    <p class="text-muted-foreground mt-3 text-sm">No target selected.</p>
  {/if}
</SectionCard>
