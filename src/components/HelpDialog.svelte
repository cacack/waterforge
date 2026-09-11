<script lang="ts">
  import { tick } from 'svelte'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Button } from '$lib/components/ui/button'
  import { help } from '../help.svelte'
  // USAGE.md, rendered to HTML at build time (see vite.config.ts). Bundling it
  // is what makes the guide readable offline — the point of #234.
  import { title, html } from 'virtual:usage-guide'

  const sourceUrl = 'https://github.com/cacack/waterforge/blob/main/USAGE.md'

  // The guide body, once the dialog has portalled it into the DOM. Reactive so
  // the deep-link effect below re-runs when a fresh node mounts on open.
  let bodyEl = $state<HTMLElement | null>(null)

  /**
   * Scroll a heading to the top of the guide body.
   *
   * `reassert` re-applies the scroll on the next frames. On open, the dialog
   * moves focus into itself *after* this runs, which resets the body's scroll
   * to the top and would swallow a deep link; re-applying outlasts that. Three
   * frames is empirical, not derived — it comfortably outlasts the focus move
   * in testing. If a bits-ui upgrade ever makes deep links land at the top of
   * the guide intermittently, this is the knob. Plain in-guide clicks pass 0 —
   * nothing competes with them.
   */
  function scrollToAnchor(container: HTMLElement, id: string, reassert = 0) {
    const target = container.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    if (!target) return
    // Move the container's own scroll rather than calling scrollIntoView,
    // which would also scroll the page behind the dialog.
    container.scrollTop = target.offsetTop
    if (reassert > 0) {
      requestAnimationFrame(() => scrollToAnchor(container, id, reassert - 1))
    }
  }

  // Consume a deep link whenever one is set and the body is mounted — keyed on
  // the anchor rather than on the dialog opening, so openHelp() also works when
  // the guide is already on screen. Clearing the anchor re-runs this effect,
  // which then returns at the guard; nothing resets scroll on that second pass.
  // tick() lets the rendered guide lay out before offsets are measured.
  $effect(() => {
    const anchor = help.anchor
    const node = bodyEl
    if (!anchor || !node) return
    help.anchor = null
    void tick().then(() => scrollToAnchor(node, anchor, 3))
  })

  // In-document links render as buttons carrying `data-usage-anchor` rather
  // than `href="#..."`; fragment navigation would dirty the share-link channel
  // and scroll the page behind the dialog (see ADR 0020). Delegate from the
  // container so the handler covers the {@html} content, and attach it
  // imperatively — the clickable descendants are real <button>s, so this is
  // delegation, not an interactive <div>.
  function guideBody(node: HTMLElement) {
    function onClick(event: MouseEvent) {
      const id = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-usage-anchor]',
      )?.dataset.usageAnchor
      if (id) scrollToAnchor(node, id)
    }
    node.addEventListener('click', onClick)

    return { destroy: () => node.removeEventListener('click', onClick) }
  }
</script>

<Dialog.Root bind:open={help.open}>
  <!-- flex (not the default grid) so the scrolling body below can actually
       shrink to the dialog's max height; auto grid rows size to content and
       would clip the guide instead. -->
  <Dialog.Content class="flex max-h-[85svh] flex-col gap-3 sm:max-w-2xl">
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>
        Works offline — the guide ships with the app.
      </Dialog.Description>
    </Dialog.Header>

    <!-- min-h-0 is load-bearing: Dialog.Content is a grid, and a grid item's
         default `min-height: auto` would let this div grow past the dialog's
         max height and clip the guide instead of scrolling it. -->
    <div
      bind:this={bodyEl}
      use:guideBody
      class="usage-prose relative min-h-0 overflow-y-auto pr-1"
    >
      <!--
        Safe: this is USAGE.md from our own repository, rendered at build time
        by scripts/usage-guide.mjs. It never contains user input.
      -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html html}
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        size="sm"
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!--
  Prose styling for the rendered guide. Written as :global() rules because
  Svelte's scoping never reaches {@html} content, and hand-rolled against the
  brand tokens in app.css so both themes work without a typography plugin.
-->
<style>
  .usage-prose {
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .usage-prose :global(h2) {
    margin: 1.5rem 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .usage-prose :global(h3) {
    margin: 1.25rem 0 0.375rem;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .usage-prose :global(:is(h2, h3):first-child) {
    margin-top: 0;
  }

  .usage-prose :global(p) {
    margin: 0.625rem 0;
  }

  .usage-prose :global(:is(ul, ol)) {
    margin: 0.625rem 0;
    padding-left: 1.25rem;
  }

  .usage-prose :global(ul) {
    list-style: disc;
  }

  .usage-prose :global(ol) {
    list-style: decimal;
  }

  .usage-prose :global(li) {
    margin: 0.25rem 0;
  }

  .usage-prose :global(blockquote) {
    margin: 0.875rem 0;
    border-left: 2px solid var(--border);
    padding-left: 0.75rem;
    color: var(--muted-foreground);
  }

  .usage-prose :global(.usage-table) {
    margin: 0.875rem 0;
    overflow-x: auto;
  }

  .usage-prose :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
    white-space: nowrap;
  }

  .usage-prose :global(:is(th, td)) {
    border-bottom: 1px solid var(--border);
    padding: 0.375rem 0.75rem 0.375rem 0;
    text-align: left;
  }

  .usage-prose :global(th) {
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .usage-prose :global(code) {
    border-radius: 0.25rem;
    background: var(--muted);
    padding: 0.0625rem 0.25rem;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.8125em;
  }

  .usage-prose :global(hr) {
    margin: 1.25rem 0;
    border: 0;
    border-top: 1px solid var(--border);
  }

  /* Links out to the web, and the in-document anchor buttons, read the same. */
  .usage-prose :global(:is(a, [data-usage-anchor])) {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .usage-prose :global([data-usage-anchor]) {
    cursor: pointer;
    font: inherit;
  }

  .usage-prose :global(:is(a, [data-usage-anchor]):hover) {
    text-decoration-thickness: 2px;
  }
</style>
