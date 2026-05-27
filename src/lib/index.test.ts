import { describe, expect, it } from 'vitest'
import * as engine from './index'

// Smoke test: the engine's public-API barrel loads and re-exports the chem and
// solver entry points the UI relies on.
describe('engine public API', () => {
  it('module loads', () => {
    expect(engine).toBeTypeOf('object')
  })

  it('exports the chem constants and conversions', () => {
    expect(engine.IONS).toBeDefined()
    expect(engine.SALTS).toBeDefined()
    expect(engine.mgToMmol).toBeTypeOf('function')
    expect(engine.caco3ToHco3).toBeTypeOf('function')
  })

  it('exports the solver entry points', () => {
    expect(engine.solve).toBeTypeOf('function')
    expect(engine.forward).toBeTypeOf('function')
    expect(engine.sequentialOracle).toBeTypeOf('function')
    expect(engine.nnls).toBeTypeOf('function')
    expect(engine.saturationWarnings).toBeTypeOf('function')
  })
})
