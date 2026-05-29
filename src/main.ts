import { mount } from 'svelte'
// Self-hosted brand typefaces (Geist for words, Geist Mono for data).
// Variable fonts cover the full 100–900 weight range in a single file each.
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
