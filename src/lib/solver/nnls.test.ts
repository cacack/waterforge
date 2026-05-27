import { describe, expect, it } from 'vitest'
import { nnls } from './nnls'

describe('nnls', () => {
  it('recovers the exact solution of a well-determined system', () => {
    // A is identity-like; solution is just b when b >= 0.
    const A = [
      [2, 0],
      [0, 3],
    ]
    const b = [4, 9]
    const { x, residualNorm } = nnls(A, b)
    expect(x[0]).toBeCloseTo(2, 10)
    expect(x[1]).toBeCloseTo(3, 10)
    expect(residualNorm).toBeCloseTo(0, 10)
  })

  it('clamps a would-be-negative variable at zero', () => {
    // Unconstrained least squares wants x = [-1, ...]; NNLS must return >= 0.
    const A = [
      [1, 0],
      [0, 1],
    ]
    const b = [-1, 2]
    const { x } = nnls(A, b)
    expect(x[0]).toBe(0)
    expect(x[1]).toBeCloseTo(2, 10)
  })

  it('solves an overdetermined non-negative least-squares problem', () => {
    // Three observations of one positive variable; best fit is the mean slope.
    const A = [[1], [1], [1]]
    const b = [2, 2, 2]
    const { x, residualNorm } = nnls(A, b)
    expect(x[0]).toBeCloseTo(2, 10)
    expect(residualNorm).toBeCloseTo(0, 10)
  })
})
