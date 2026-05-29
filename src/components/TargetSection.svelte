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
          <Command.Empty>No water found.</Command.Empty>
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
