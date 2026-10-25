// Mineral band: a plain-word answer to "how mineral is this water?".
//
// Maps a TDS figure (mg/L) to one of five ordered bands, so a label or share
// card can say "Medium" instead of a raw number. The input is the
// **sum-of-ions** TDS (the solver's `tds`), which exists for every recipe —
// not a bottler's published dried-residue figure, which only some profiles
// carry. See docs/decisions/0022-mineral-band-and-published-tds.md.

/**
 * The mineral bands, in ascending order.
 *
 * The **single source of truth** for band thresholds and labels. Each band
 * covers `min` (inclusive) up to the next band's `min` (exclusive); the last
 * band is open-ended.
 */
export const MINERAL_BANDS = [
  { id: 'very-light', label: 'Very light', min: 0 },
  { id: 'light', label: 'Light', min: 100 },
  { id: 'medium', label: 'Medium', min: 300 },
  { id: 'rich', label: 'Rich', min: 700 },
  { id: 'bold', label: 'Bold', min: 1500 },
] as const

/** One entry of {@link MINERAL_BANDS}. */
export type MineralBand = (typeof MINERAL_BANDS)[number]

/** A mineral band's id. One of the `id`s in {@link MINERAL_BANDS}. */
export type MineralBandId = MineralBand['id']

/**
 * The mineral band for a TDS value in mg/L.
 *
 * Never throws: like the carbonation helpers, out-of-range input is clamped
 * rather than rejected — negative values and `NaN` fall into the lowest band.
 */
export function mineralBand(tds: number): MineralBand {
  let band: MineralBand = MINERAL_BANDS[0]
  for (const candidate of MINERAL_BANDS) {
    if (tds >= candidate.min) band = candidate
  }
  return band
}
