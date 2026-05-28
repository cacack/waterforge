<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { theme, toggleTheme } from '../theme.svelte'
  import Actions from './Actions.svelte'
  import SunIcon from '@lucide/svelte/icons/sun'
  import MoonIcon from '@lucide/svelte/icons/moon'
  import GitHubMark from './icons/GitHubMark.svelte'
</script>

<header
  class="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur"
>
  <div
    class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"
  >
    <div class="flex items-baseline gap-2">
      <span class="text-lg font-semibold tracking-tight">Waterforge</span>
      <span class="text-muted-foreground hidden text-sm sm:inline">
        bottled mineral water from salts
      </span>
    </div>
    <div class="flex items-center gap-1">
      <!-- Recipe import/export actions (#22); share link will join here (#23) -->
      <Actions />
      <Button
        variant="ghost"
        size="icon"
        onclick={toggleTheme}
        aria-label="Toggle light/dark theme"
        title="Toggle light/dark theme"
      >
        {#if theme.mode === 'dark'}
          <SunIcon class="size-4" />
        {:else}
          <MoonIcon class="size-4" />
        {/if}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        href="https://github.com/cacack/waterforge"
        aria-label="GitHub"
        title="GitHub repository"
      >
        <GitHubMark class="size-4" />
      </Button>
    </div>
  </div>
</header>
