# Using Waterforge

> **Status:** the app UI is in progress (planned for milestone M3). This
> document describes the intended user flow so you know what to expect. Steps
> are presented in order; the UI will guide you through them in sequence.

## Overview

Waterforge turns a named mineral-water target into a gram-accurate, batch-scaled
salt recipe. The core loop is:

1. Pick a target profile.
2. Set your source water.
3. Toggle the salts you own.
4. Set your batch size and unit.
5. Read the recipe and the readouts.
6. Dissolve (or carbonate) your water.

## Step 1 — Pick a target profile

Browse or search the built-in library of bottled and brewing water profiles.
Each profile is a set of ion concentrations in mg/L (calcium, magnesium, sodium,
potassium, chloride, sulfate, bicarbonate). Select the one you want to clone.

## Step 2 — Set your source water

By default, source water is treated as distilled (all ions at zero). This is the
recommended starting point: results are reproducible anywhere you can buy
distilled water.

If you are starting from a known-source water (filtered tap, a specific bottled
water, etc.) you can enter its ion concentrations manually. Waterforge will
subtract what is already in your source before computing the additions needed.

> Note: if your source water is _richer_ in any ion than the target, that ion
> cannot be corrected by adding salts. The solver will match it as closely as
> possible and the charge-residual readout will show the shortfall.

## Step 3 — Toggle the salts you own

Waterforge works with a palette of food-grade salts. Toggle on only the salts
you actually have. The solver will use only the selected salts when computing
your recipe.

Common salts in the palette:

| Salt                  | Common name       | Primary ions |
| --------------------- | ----------------- | ------------ |
| Gypsum                | Calcium sulfate   | Ca²⁺, SO₄²⁻  |
| Epsom salt            | Magnesium sulfate | Mg²⁺, SO₄²⁻  |
| Table salt            | Sodium chloride   | Na⁺, Cl⁻     |
| Potassium bicarbonate | —                 | K⁺, HCO₃⁻    |
| Calcium chloride      | Pickling salt     | Ca²⁺, Cl⁻    |
| Sodium bicarbonate    | Baking soda       | Na⁺, HCO₃⁻   |
| Magnesium chloride    | —                 | Mg²⁺, Cl⁻    |

If a needed ion has no contributing salt in your selection, the solver will
still find the closest achievable recipe — but the readouts will reflect the
shortfall.

## Step 4 — Set batch size and unit

Enter the volume you want to make and choose the unit: **litre** or **US
gallon**. All gram quantities in the recipe are scaled to this volume.

## Step 5 — Read the recipe and readouts

The recipe panel shows the grams of each selected salt to add to your batch. It
also shows four readouts:

| Readout              | What it means                                             |
| -------------------- | --------------------------------------------------------- |
| **Sulfate:chloride** | SO₄:Cl mass ratio of the resulting water                  |
| **TDS**              | Total Dissolved Solids — sum of all modelled ions in mg/L |
| **Charge residual**  | Ionic charge balance in meq/L — ideally close to zero     |
| **Saturation index** | Per-salt saturation index; a warning appears when SI ≥ 0  |

### Warnings

A **saturation warning** means a salt is at or above its solubility limit at
room temperature. This is most common for gypsum (CaSO₄) at high doses.
If you see one, consider:

- Reducing the batch size and scaling the dose accordingly.
- Warming the water gently while dissolving (see Step 6).
- Adjusting the target profile to require less of the saturating salt.

## Step 6 — Dissolve and (optionally) carbonate

**Dissolving salts:** add the measured salts to your water and stir. Most salts
dissolve quickly at room temperature. Gypsum near its saturation limit dissolves
best in warmer water with extended stirring.

**Adding bicarbonate:** if your recipe includes potassium bicarbonate or sodium
bicarbonate, add it last. These salts react with CO₂ in the air; add them to
still or slightly warm water and stir gently to avoid fizzing.

**Carbonating:** if you want sparkling water, carbonate _after_ adding the
mineral salts. The presence of dissolved minerals (especially bicarbonate) can
affect CO₂ retention, so it is best to get the mineral profile stable first and
then force-carbonate to your preferred level.
