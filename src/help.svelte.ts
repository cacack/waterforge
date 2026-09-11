// Open state for the usage-guide dialog (#234). Shared because two call sites
// drive one dialog instance: the header's `?` button and RecipePanel's
// "Weighing the salts" link, which deep-links to a section.

export const help = $state<{ open: boolean; anchor: string | null }>({
  open: false,
  anchor: null,
})

/**
 * Open the usage guide, optionally scrolled to a heading.
 *
 * Safe to call while the guide is already open — the anchor drives the scroll
 * whether the dialog is mounting or already on screen.
 *
 * An anchor that matches no heading scrolls nowhere rather than erroring. The
 * ids come from USAGE.md's headings, so `src/usage-guide.test.ts` asserts the
 * ones referenced here still exist; a heading rename fails CI.
 *
 * @param anchor Slugged heading id from USAGE.md, e.g. `weighing-the-salts`.
 */
export function openHelp(anchor?: string): void {
  help.anchor = anchor ?? null
  help.open = true
}
