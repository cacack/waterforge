// Non-negative least squares (NNLS) via the Lawson-Hanson active-set algorithm.
//
// Solves min ||A x - b|| subject to x >= 0. Salt masses cannot be negative (you
// cannot remove a salt that distilled water never had), so an unconstrained
// least-squares fit is wrong: NNLS is the right tool. We implement it in pure
// TypeScript rather than pull in a matrix library, keeping the engine
// dependency-free. The math: see the solver notes under `docs/`.
//
// The active-set method partitions variables into a passive set P (free, can be
// positive) and an active set Z (held at zero). It repeatedly solves the
// unconstrained least-squares problem on P, and moves variables between the sets
// until the Karush-Kuhn-Tucker optimality conditions hold.

/** Result of an NNLS solve. */
export interface NnlsResult {
  /** The non-negative solution vector x. */
  x: number[]
  /** Residual 2-norm ||A x - b||. */
  residualNorm: number
  /** Whether the algorithm converged within the iteration budget. */
  converged: boolean
}

/** Dot product of two equal-length vectors. */
function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

/**
 * Least-squares solve of A_sub x = b over the columns in `passive`, via normal
 * equations (A^T A) x = A^T b with Gaussian elimination and partial pivoting.
 * Returns the solution restricted to the passive columns. The systems here are
 * tiny (at most a handful of salts), so normal equations are accurate enough.
 */
function leastSquaresOnSubset(
  A: number[][],
  b: number[],
  passive: number[],
): number[] {
  const m = A.length
  const k = passive.length
  // Normal matrix G = Ap^T Ap  (k x k) and right-hand side c = Ap^T b (k).
  const G: number[][] = Array.from({ length: k }, () => new Array(k).fill(0))
  const c: number[] = new Array(k).fill(0)
  for (let i = 0; i < k; i++) {
    const col_i = passive[i]
    for (let j = 0; j < k; j++) {
      const col_j = passive[j]
      let s = 0
      for (let r = 0; r < m; r++) s += A[r][col_i] * A[r][col_j]
      G[i][j] = s
    }
    let s = 0
    for (let r = 0; r < m; r++) s += A[r][col_i] * b[r]
    c[i] = s
  }
  return solveLinear(G, c)
}

/** Solve a dense linear system G z = c via Gaussian elimination with pivoting. */
function solveLinear(G: number[][], c: number[]): number[] {
  const n = c.length
  // Augmented matrix copy.
  const M: number[][] = G.map((row, i) => [...row, c[i]])
  for (let col = 0; col < n; col++) {
    // Partial pivot: largest magnitude in this column.
    let pivot = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
    }
    if (pivot !== col) {
      const tmp = M[pivot]
      M[pivot] = M[col]
      M[col] = tmp
    }
    const diag = M[col][col]
    if (Math.abs(diag) < 1e-15) continue // singular column; leave as zero
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = M[r][col] / diag
      if (factor === 0) continue
      for (let k = col; k <= n; k++) M[r][k] -= factor * M[col][k]
    }
  }
  const z: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    const diag = M[i][i]
    z[i] = Math.abs(diag) < 1e-15 ? 0 : M[i][n] / diag
  }
  return z
}

/**
 * Solve min ||A x - b|| subject to x >= 0 (Lawson-Hanson).
 *
 * @param A  m x n matrix (rows = observations/ions, cols = variables/salts).
 * @param b  length-m target vector.
 * @param opts.tol  optimality tolerance for the KKT dual condition.
 * @param opts.maxIter  outer-iteration budget.
 */
export function nnls(
  A: number[][],
  b: number[],
  opts: { tol?: number; maxIter?: number } = {},
): NnlsResult {
  const m = A.length
  const n = m > 0 ? A[0].length : 0
  const tol = opts.tol ?? 1e-12
  const maxIter = opts.maxIter ?? 3 * n + 10

  const x = new Array<number>(n).fill(0)
  // Set membership: true => active (held at zero), false => passive (free).
  const active = new Array<boolean>(n).fill(true)

  // Residual gradient w = A^T (b - A x); large positive entries on active
  // variables indicate that freeing them would reduce the residual.
  const computeW = (): number[] => {
    const residual = b.map((bi, i) => bi - dot(A[i], x))
    const w = new Array<number>(n).fill(0)
    for (let j = 0; j < n; j++) {
      let s = 0
      for (let i = 0; i < m; i++) s += A[i][j] * residual[i]
      w[j] = s
    }
    return w
  }

  let outer = 0
  while (outer++ < maxIter) {
    const w = computeW()
    // Pick the active variable with the most positive gradient.
    let t = -1
    let wmax = tol
    for (let j = 0; j < n; j++) {
      if (active[j] && w[j] > wmax) {
        wmax = w[j]
        t = j
      }
    }
    if (t === -1) break // KKT satisfied: optimal.

    active[t] = false // move t into the passive set

    // Inner loop: solve least squares on the passive set, backing off any
    // entries that went non-positive, until the passive solution is feasible.
    let inner = 0
    const innerBudget = 3 * n + 10
    while (inner++ < innerBudget) {
      const passive: number[] = []
      for (let j = 0; j < n; j++) if (!active[j]) passive.push(j)
      if (passive.length === 0) break

      const z = leastSquaresOnSubset(A, b, passive)

      // All passive entries strictly positive? Accept and re-check optimality.
      let allPositive = true
      for (let p = 0; p < passive.length; p++) {
        if (z[p] <= tol) {
          allPositive = false
          break
        }
      }
      if (allPositive) {
        for (let p = 0; p < passive.length; p++) x[passive[p]] = z[p]
        break
      }

      // Otherwise move x toward z only as far as feasibility (x >= 0) allows.
      let alpha = Infinity
      for (let p = 0; p < passive.length; p++) {
        const j = passive[p]
        if (z[p] <= tol) {
          const denom = x[j] - z[p]
          if (denom > 0) alpha = Math.min(alpha, x[j] / denom)
        }
      }
      if (!isFinite(alpha)) alpha = 0
      for (let p = 0; p < passive.length; p++) {
        const j = passive[p]
        x[j] = x[j] + alpha * (z[p] - x[j])
      }
      // Drop variables that hit zero back into the active set.
      for (let j = 0; j < n; j++) {
        if (!active[j] && x[j] <= tol) {
          x[j] = 0
          active[j] = true
        }
      }
    }
  }

  // Final residual norm.
  let resSq = 0
  for (let i = 0; i < m; i++) {
    const r = b[i] - dot(A[i], x)
    resSq += r * r
  }
  return {
    x,
    residualNorm: Math.sqrt(resSq),
    converged: outer <= maxIter,
  }
}
