<script lang="ts">
  // __APP_VERSION__ is a build-time global injected by Vite's `define`
  // (see vite.config.ts), sourced from package.json.
  const version = __APP_VERSION__
  const repo = 'https://github.com/cacack/waterforge'
</script>

<footer class="border-border mt-6 border-t py-4">
  <div
    class="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs sm:flex-row sm:items-center sm:justify-between"
  >
    <p>
      <a
        href="{repo}/releases/tag/v{version}"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline-offset-4 hover:underline"
      >
        v{version}
      </a>
      &middot; Code
      <a
        href="{repo}/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline-offset-4 hover:underline"
      >
        GPLv3
      </a>
      &middot;
      <a
        href={repo}
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline-offset-4 hover:underline"
      >
        Source
      </a>
    </p>
    <p>
      Profile data
      <a
        href="{repo}/blob/main/LICENSE-DATA"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline-offset-4 hover:underline"
      >
        CC-BY-SA-4.0
      </a>
      (per-profile sources) &middot; Recipe method after Martin Lersch /
      <a
        href="https://khymos.org/2012/01/04/mineral-waters-a-la-carte/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary underline-offset-4 hover:underline"
      >
        Khymos
      </a>
    </p>
  </div>
</footer>
