// Public API for the Waterforge engine (chem + solver).
//
// Framework-agnostic, pure TypeScript: no Svelte or DOM. The UI imports from
// `$lib` and never reaches into engine internals. Two layers are exported:
//   - chem: ions, salts, atomic/group weights, and unit conversions.
//   - solver: the ion x salt matrix + forward model, the deterministic
//     sequential oracle, an NNLS production solver, saturation warnings, and the
//     top-level `solve(target, source, salts, batch)` entry point.
export * from './chem'
export * from './solver'
