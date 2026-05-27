import { describe, expect, it } from 'vitest'
import * as engine from './index'

// Smoke test: the engine's public-API barrel loads. The real chem/solver
// suites land in #7 and extend this module.
describe('engine public API', () => {
  it('module loads', () => {
    expect(engine).toBeTypeOf('object')
  })
})
