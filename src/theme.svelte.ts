// Light/dark theme. Toggles the `dark` class on <html> (the shadcn theme's
// `@custom-variant dark`) and remembers the choice in localStorage, falling
// back to the OS preference.

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'waterforge-theme'

function initialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const theme = $state({ mode: initialMode() })

/** Apply the current mode to the document root. Safe to call in an $effect. */
export function applyTheme(): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme.mode === 'dark')
}

/** Flip light/dark, persist, and apply. */
export function toggleTheme(): void {
  theme.mode = theme.mode === 'dark' ? 'light' : 'dark'
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme.mode)
  }
  applyTheme()
}
