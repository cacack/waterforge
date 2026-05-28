<script lang="ts">
  import { SALT_ORDER, SALTS, type SaltId } from '$lib'
  import { app } from '../state.svelte'
  import SectionCard from './SectionCard.svelte'
  import { Switch } from '$lib/components/ui/switch'
  import { Label } from '$lib/components/ui/label'

  function isEnabled(id: SaltId): boolean {
    return app.salts.includes(id)
  }

  function toggle(id: SaltId, on: boolean) {
    if (on) {
      if (!app.salts.includes(id)) {
        // Insert in SALT_ORDER order.
        const next = SALT_ORDER.filter((s) => s === id || app.salts.includes(s))
        app.salts = next as SaltId[]
      }
    } else {
      app.salts = app.salts.filter((s) => s !== id)
    }
  }
</script>

<SectionCard title="Salts you own">
  <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {#each SALT_ORDER as id (id)}
      {@const salt = SALTS[id]}
      {@const checked = isEnabled(id)}
      <li class="flex items-center gap-3">
        <Switch
          id="salt-{id}"
          {checked}
          onCheckedChange={(v) => toggle(id, v)}
          size="sm"
          aria-label="Toggle {salt.name}"
        />
        <Label
          for="salt-{id}"
          class="flex cursor-pointer flex-col items-start gap-0.5 leading-tight"
        >
          <span class="text-sm font-medium">{salt.name}</span>
          <span class="text-muted-foreground font-mono text-xs"
            >{salt.formula}</span
          >
        </Label>
      </li>
    {/each}
  </ul>
</SectionCard>
