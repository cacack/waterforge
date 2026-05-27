# Water Chemistry & Solver Math

This guide explains the chemistry and mathematics behind the Waterforge engine.
The goal is to be genuinely educational: a careful reader should understand how
a named target profile becomes a gram-accurate salt recipe.

---

## 1. The Seven Ions

Waterforge tracks seven ions that together account for virtually all of the
mineral character of natural still waters:

| Ion   | Charge | Formula | Molar mass (g/mol) | Notes                         |
| ----- | ------ | ------- | ------------------ | ----------------------------- |
| Ca²⁺  | +2     | Ca      | 40.078             | Dominant hardness ion         |
| Mg²⁺  | +2     | Mg      | 24.305             | Secondary hardness ion        |
| Na⁺   | +1     | Na      | 22.990             | Contributes to soft/flat feel |
| K⁺    | +1     | K       | 39.098             | Minor; potassium bicarbonate  |
| HCO₃⁻ | −1     | HCO₃    | 61.017             | Alkalinity / carbonate buffer |
| SO₄²⁻ | −2     | SO₄     | 96.06              | "Dry" / mineralic character   |
| Cl⁻   | −1     | Cl      | 35.450             | "Round" / soft character      |

All concentrations in the engine are in **mg/L** (milligrams per litre).
Because water density is approximately 1 kg/L, mg/L ≈ ppm (parts per million
by mass) at the concentrations typical of drinking water.

---

## 2. The Carbonate System

### CO₂ / HCO₃⁻ / CO₃²⁻ equilibrium

Carbon dioxide dissolves in water to form carbonic acid, which dissociates
through two steps:

```
CO₂(g) + H₂O  ⇌  H₂CO₃  (carbonic acid — rarely tracked separately)
H₂CO₃          ⇌  H⁺ + HCO₃⁻   (pKa ≈ 6.35)
HCO₃⁻          ⇌  H⁺ + CO₃²⁻   (pKa ≈ 10.33)
```

In the pH range of natural drinking water (roughly 6–8), bicarbonate (HCO₃⁻)
overwhelmingly dominates over both dissolved CO₂ and carbonate (CO₃²⁻).
This is why Waterforge models the carbonate system as **HCO₃⁻ alkalinity** and
tracks no other carbonate species — it is the right approximation for the
target use case.

### Why bicarbonate is the alkalinity proxy

Alkalinity measures a solution's capacity to neutralise acid. For drinking
water at typical pH, alkalinity ≈ [HCO₃⁻]. Waterforge stores alkalinity as
**mg/L expressed as HCO₃⁻** — not as CaCO₃ — and the conversion between the
two conventions is the single most common error in water chemistry. See
section 3 for the trap and how to avoid it.

---

## 3. Alkalinity: the as-CaCO₃ / as-HCO₃ Trap

Many sources (water-quality reports, water-chemistry software, homebrew
resources) express alkalinity as-CaCO₃. The Waterforge engine stores alkalinity
as-HCO₃. These are the **same physical quantity measured against different
reference compounds**, and mixing them up silently produces a ~22% error.

### Why the units differ

CaCO₃ has a molar mass of ≈ 100.087 g/mol. Because one mole of CaCO₃ provides
**two moles of alkalinity** (Ca²⁺ is divalent; the CO₃²⁻ neutralises two H⁺
via: CO₃²⁻ + 2H⁺ → H₂O + CO₂), the **equivalent weight** of CaCO₃ is
half its molar mass:

```
EW(CaCO₃) = 100.087 / 2 = 50.0435 g/eq
```

HCO₃⁻, on the other hand, carries one charge equivalent per mole, so its
equivalent weight equals its molar mass:

```
EW(HCO₃⁻) = 61.017 g/eq
```

### The conversion

To convert between the two conventions, match equivalents:

```
mg/L as HCO₃ = (mg/L as CaCO₃) × (EW(HCO₃) / EW(CaCO₃))
             = (mg/L as CaCO₃) × (61.017 / 50.0435)
             ≈ (mg/L as CaCO₃) × 1.2189
```

Equivalently:

```
mg/L as CaCO₃ = (mg/L as HCO₃) × (50.0435 / 61.017)
              ≈ (mg/L as HCO₃) × 0.8202
```

**Example:** A water report says alkalinity = 200 mg/L as CaCO₃.
In Waterforge's native units: 200 × 1.2189 ≈ **244 mg/L HCO₃⁻**.
Entering 200 instead of 244 would leave your target under-alkaline by ~44 mg/L —
a meaningful error that the engine would try to correct with extra baking soda
or chalk.

The engine exposes this via `caco3ToHco3()` / `hco3ToCaco3()` in
`src/lib/chem/conversions.ts` using the exact values from `constants.ts`:
`HCO3_WEIGHT = 61.017`, `CACO3_EQUIVALENT_WEIGHT = 50.0435`.

---

## 4. Charge Balance

Every ion-balanced water must satisfy electrical neutrality: the sum of positive
charges equals the sum of negative charges. In practice "near zero" is
achievable; real water has minor species (H⁺, OH⁻, trace metals) that the model
omits.

### Charge expressed in meq/L

The natural unit for charge balance is **milliequivalents per litre (meq/L)**.
One milliequivalent = one millimole × |charge|.

For each ion:

```
contribution (meq/L) = [ion] (mg/L) / molarMass (g/mol) × charge
```

The **charge residual** the engine reports is:

```
chargeResidual = Σ (cation contributions) + Σ (anion contributions)
               = Σᵢ ([ionᵢ] / Mᵢ) × zᵢ
```

where zᵢ is signed (+2, +1, −1, −2 …). A well-matched profile sits near zero;
the engine surfaces this as a readout so you can spot badly mismatched profiles
(e.g. from a water report that uses different alkalinity conventions).

**Example calculation for a simple Ca / HCO₃ water:**

- Ca²⁺: 40 mg/L → 40/40.078 × 2 = **1.997 meq/L** (positive)
- HCO₃⁻: 122 mg/L → 122/61.017 × (−1) = **−2.000 meq/L** (negative)
- Residual: 1.997 − 2.000 = **−0.003 meq/L** (essentially zero)

---

## 5. Solubility, Ksp, and the Saturation Index

### Ion activity product and Ksp

For a sparingly soluble salt M_aX_b dissolving to give ions M and X:

```
M_aX_b(s)  ⇌  a M^(z+)  +  b X^(z−)
Ksp = [M]^a [X]^b          (at equilibrium)
```

If the **ion activity product** IAP = [M]^a [X]^b exceeds Ksp, the solution is
supersaturated and the mineral tends to precipitate.

### Saturation Index

The **Saturation Index (SI)** makes this logarithmic and human-readable:

```
SI = log₁₀(IAP / Ksp)
```

- SI < 0 → undersaturated; mineral dissolves freely
- SI = 0 → at equilibrium
- SI ≥ 0 → supersaturated; mineral may precipitate

The engine warns when SI ≥ 0.

### Ksp values used

At 25 °C:

| Mineral | Formula | log₁₀(Ksp) | Ksp           |
| ------- | ------- | ---------- | ------------- |
| Gypsum  | CaSO₄   | −4.58      | ≈ 2.63 × 10⁻⁵ |
| Calcite | CaCO₃   | −8.48      | ≈ 3.31 × 10⁻⁹ |

### Activity approximation

The engine sets activity coefficients to 1 (i.e., activity ≈ concentration in
mol/L). Real waters have ionic strength that lowers ion activities, which would
push the true saturation limit slightly higher than the model predicts. The
approximation is deliberately conservative: it may flag warnings that do not
materialise in practice, but it will not miss real precipitation risks at the
concentrations typical of mineral-water cloning.

### Gypsum ceiling clamp

Because gypsum saturates at roughly 2.0–2.5 g/L, the production solver caps
gypsum doses at **2.0 g/L**. Beyond that concentration gypsum simply will not
dissolve at room temperature regardless of what the NNLS optimum says. The
clamp is a hard physical constraint applied after the solve, not during it.

---

## 6. The Solver Math

### Problem statement

Given:

- **target** — the desired ion profile (mg/L)
- **source** — the ion profile of the starting water (mg/L; all zeros for distilled)
- **salts** — a palette of available food-grade salts

Find: **x** (g/L of each salt) such that the salt additions bring the source
water as close as possible to the target, with all doses non-negative.

### The ion × salt matrix A

The key data structure is the **contribution matrix** A where:

```
A[ion][salt] = mg of ion contributed per gram of salt per litre
```

Derivation: one gram of a salt contains `1000 / saltMolarMass` millimoles.
Each millimole releases `stoichiometry` millimoles of the ion. Each millimole
of ion weighs `ionMolarMass` mg. Therefore:

```
A[ion][salt] = 1000 × stoich(salt, ion) × ionMolarMass(ion) / saltMolarMass(salt)
```

Units are **mg ion · g⁻¹ salt · L⁻¹**, so when you multiply by x (g/L), the
product A · x gives mg/L — ion concentrations. This is exact stoichiometry with
no fudge factors.

### The linear system

The **per-ion deficit** b is what the salts must supply:

```
b[ion] = target[ion] − source[ion]   (mg/L)
```

The forward model says: `A · x = b`. We want the salt doses x that minimise
the squared residual `‖A · x − b‖²`.

### Why NNLS, not ordinary least squares

You cannot remove a salt from distilled water — salt doses must be ≥ 0.
Ordinary unconstrained least squares (OLS) ignores this and will happily
return negative doses when the system is over-determined or when the source
water already exceeds the target on some ion. **Non-negative least squares
(NNLS)** is the correct formulation.

Waterforge implements NNLS via the **Lawson–Hanson active-set algorithm**
(Lawson & Hanson 1974, _Solving Least Squares Problems_, Prentice-Hall). The
algorithm partitions variables into:

- **Passive set P** — variables free to take positive values
- **Active set Z** — variables held at zero

It iterates:

1. Compute the gradient w = Aᵀ(b − Ax). The entry w[j] says how much freeing
   variable j would reduce the residual.
2. If the largest w[j] among active variables is ≤ tolerance, the
   Karush–Kuhn–Tucker (KKT) optimality conditions hold → done.
3. Move the variable with the largest w[j] from Z to P.
4. Solve the unconstrained least-squares problem on P (via normal equations +
   Gaussian elimination with partial pivoting).
5. If all passive solutions are positive, accept and loop. Otherwise, step
   toward the solution only as far as feasibility allows (Wolfe line search on
   the active constraint), clamp variables that hit zero back into Z.

The system sizes here are tiny (at most 8 salts × 7 ions), so the O(n²) normal
equations are numerically adequate.

### After the solve

Once NNLS returns x (doses in g/L):

1. Apply the **gypsum ceiling clamp** (cap at 2.0 g/L).
2. Compute the **result profile** by applying the forward model to the clamped
   doses and adding the source water.
3. Compute **readouts**: TDS, sulfate:chloride ratio, charge residual.
4. Check **saturation indices** for gypsum and calcite; emit warnings at SI ≥ 0.
5. **Scale** the per-litre doses to the requested batch volume (litres or US gallons).

---

## References

- Lawson, C.L. and Hanson, R.J. (1974). _Solving Least Squares Problems_.
  Prentice-Hall. (The Lawson–Hanson NNLS algorithm.)
- Lersch, M. (Khymos). Mineral water recipes and methodology.
  [khymos.org](https://khymos.org/). (Source method and profile data;
  CC-BY-SA-4.0.)
- Stumm, W. and Morgan, J.J. (1996). _Aquatic Chemistry_, 3rd ed. Wiley.
  (Carbonate equilibria, Ksp values, activity corrections.)
- Langelier, W.F. (1936). The analytical control of anti-corrosion water
  treatment. _J. AWWA_ 28(10):1500–1521. (Saturation index background.)
