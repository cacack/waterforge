import js from '@eslint/js'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteConfig from './svelte.config.js'

export default ts.config(
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      // Vendored shadcn-svelte components — formatted, but not linted.
      'src/lib/components/ui/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Build-time constant injected by Vite's `define` (vite.config.ts).
        __APP_VERSION__: 'readonly',
      },
    },
  },
  {
    // The engine stays framework-agnostic (docs/architecture/overview.md):
    // relative imports only, plus vitest in its tests.
    files: ['src/lib/{chem,solver,profiles}/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\.{1,2}/|vitest$)',
              message:
                'Engine code (chem/solver/profiles) imports only relative modules — no Svelte, UI, or runtime libraries.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
  },
)
