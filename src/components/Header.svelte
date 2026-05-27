<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { theme, toggleTheme } from '../theme.svelte'
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
      <Button
        variant="ghost"
        size="icon"
        onclick={toggleTheme}
        aria-label="Toggle light/dark theme"
      >
        {theme.mode === 'dark' ? '☀' : '🌙'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        href="https://github.com/cacack/waterforge"
      >
        GitHub
      </Button>
    </div>
  </div>
</header>
