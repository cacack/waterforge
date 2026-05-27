# Reference Data

This page documents the exact numbers the Waterforge engine uses, their sources,
and the algorithms that operate on them. Everything here is derived directly from
`src/lib/chem/constants.ts` and the solver layer — no hand-tuned values.

---

## 1. Atomic and Group Weights

The engine builds all molar masses from a small set of atomic weights (standard
atomic weights from IUPAC, at the precision the source method uses):

| Element   | Symbol | Atomic weight (g/mol) |
| --------- | ------ | --------------------- |
| Calcium   | Ca     | 40.078                |
| Magnesium | Mg     | 24.305                |
| Sodium    | Na     | 22.990                |
| Potassium | K      | 39.098                |
| Sulfur    | S      | 32.060                |
| Oxygen    | O      | 15.999                |
| Hydrogen  | H      | 1.008                 |
| Carbon    | C      | 12.011                |
| Chlorine  | Cl     | 35.450                |

Derived group weights (summed from the table above — not independently quoted):

| Group       | Formula | Molar mass (g/mol) | Derivation                              |
| ----------- | ------- | ------------------ | --------------------------------------- |
| Sulfate     | SO₄     | 96.060             | S + 4 × O = 32.06 + 63.996              |
| Bicarbonate | HCO₃    | 61.017             | H + C + 3 × O = 1.008 + 12.011 + 47.997 |
| Carbonate   | CO₃     | 60.009             | C + 3 × O = 12.011 + 47.997             |
| Calcite     | CaCO₃   | 100.087            | Ca + C + 3 × O                          |

The equivalent weight of CaCO₃ (half its molar mass, because one mole of CaCO₃
carries two charge equivalents) is **50.0435 g/eq**. This value drives the
as-CaCO₃ ↔ as-HCO₃ alkalinity conversion described in the chemistry guide.

---

## 2. Ion Reference

The seven ions Waterforge tracks, with their charges and molar masses:

| Ion         | ID     | Charge | Molar mass (g/mol) |
| ----------- | ------ | ------ | ------------------ |
| Calcium     | `Ca`   | +2     | 40.078             |
| Magnesium   | `Mg`   | +2     | 24.305             |
| Sodium      | `Na`   | +1     | 22.990             |
| Potassium   | `K`    | +1     | 39.098             |
| Bicarbonate | `HCO3` | −1     | 61.017             |
| Sulfate     | `SO4`  | −2     | 96.060             |
| Chloride    | `Cl`   | −1     | 35.450             |

The canonical iteration order (used by the matrix, charge-balance, and
readout calculations) is: `Ca`, `Mg`, `Na`, `K`, `HCO3`, `SO4`, `Cl` —
cations first, then anions.

---

## 3. Salt → Ion Stoichiometry

The eight food-grade salts the engine can dose, with their formulas, molar
masses (including water of hydration), and the moles of each ion released per
mole of salt dissolved:

| Salt                           | ID                     | Formula    | Molar mass (g/mol) | Ca  | Mg  | Na  | K   | HCO₃ | SO₄ | Cl  |
| ------------------------------ | ---------------------- | ---------- | ------------------ | --- | --- | --- | --- | ---- | --- | --- |
| Gypsum                         | `gypsum`               | CaSO₄·2H₂O | 172.17             | 1   | —   | —   | —   | —    | 1   | —   |
| Epsom salt                     | `epsom`                | MgSO₄·7H₂O | 246.47             | —   | 1   | —   | —   | —    | 1   | —   |
| Table salt                     | `tableSalt`            | NaCl       | 58.44              | —   | —   | 1   | —   | —    | —   | 1   |
| Calcium chloride dihydrate     | `calciumChloride`      | CaCl₂·2H₂O | 147.01             | 1   | —   | —   | —   | —    | —   | 2   |
| Baking soda                    | `bakingSoda`           | NaHCO₃     | 84.007             | —   | —   | 1   | —   | 1    | —   | —   |
| Chalk                          | `chalk`                | CaCO₃      | 100.087            | 1   | —   | —   | —   | 2    | —   | —   |
| Magnesium chloride hexahydrate | `magnesiumChloride`    | MgCl₂·6H₂O | 203.30             | —   | 1   | —   | —   | —    | —   | 2   |
| Potassium bicarbonate          | `potassiumBicarbonate` | KHCO₃      | 100.115            | —   | —   | —   | 1   | 1    | —   | —   |

**Chalk note:** CaCO₃ is sparingly soluble in pure water but dissolves readily
in CO₂-charged water via:

```
CaCO₃ + CO₂ + H₂O → Ca²⁺ + 2 HCO₃⁻
```

The engine models chalk as yielding Ca + **2 HCO₃** (not CO₃²⁻). This keeps
the salt stoichiometrically charge-balanced (Ca²⁺ is +2; two HCO₃⁻ are −2)
and matches standard alkalinity accounting where carbonate alkalinity is
reported as bicarbonate equivalents.

### Contribution matrix entries

Each table cell translates to a matrix coefficient via:

```
A[ion][salt] = 1000 × stoich(salt, ion) × ionMolarMass(ion) / saltMolarMass(salt)
```

For example, for gypsum and Ca:
`1000 × 1 × 40.078 / 172.17 ≈ 232.8 mg Ca per g gypsum per L`

This is the value the solver uses — **mg of ion per gram of salt per litre**.

---

## 4. The Sequential Oracle Algorithm

### Purpose

The **sequential oracle** (`src/lib/solver/oracle.ts`) is a deterministic,
spreadsheet-style reference solver that mirrors the original Lersch/Khymos
method. It provides a known-good baseline against which the production NNLS
solver can be golden-tested.

### Algorithm

1. Compute the **deficit** per ion: `deficit[ion] = target[ion] − source[ion]`.
2. Walk the salt palette in a fixed priority order (the `SALT_ORDER` from
   `constants.ts`).
3. For each salt, look up its **driver ion** — the ion the salt is primarily
   chosen to supply.
4. Dose enough of that salt to close the driver-ion deficit: `grams = deficit[driver] / A[driver][salt]`. If the deficit is already zero or negative, skip (dose = 0).
5. Subtract everything the dose contributes from the running deficits of **all** ions (not just the driver), so subsequent salts see the updated picture.

### Driver ions by salt

| Salt                   | Driver ion |
| ---------------------- | ---------- |
| `gypsum`               | Ca         |
| `epsom`                | Mg         |
| `tableSalt`            | Na         |
| `calciumChloride`      | Ca         |
| `bakingSoda`           | HCO₃       |
| `chalk`                | HCO₃       |
| `magnesiumChloride`    | Mg         |
| `potassiumBicarbonate` | K          |

### Priority order

The salts are processed in this fixed order (the `SALT_ORDER` constant):

1. `gypsum`
2. `epsom`
3. `tableSalt`
4. `calciumChloride`
5. `bakingSoda`
6. `chalk`
7. `magnesiumChloride`
8. `potassiumBicarbonate`

This order follows the Lersch/Khymos source method. For a fully-determined
target (where each driver ion is supplied by at most one active salt, and the
palette is chosen so each driver is not over-satisfied before its salt runs),
the greedy oracle reproduces the target exactly and identically to the NNLS
solver.

### Why two solvers?

| Property           | NNLS solver           | Sequential oracle        |
| ------------------ | --------------------- | ------------------------ |
| Guarantees x ≥ 0   | Yes, by construction  | Yes, clips at zero       |
| Minimises residual | Yes, globally optimal | Greedy (locally optimal) |
| Deterministic      | Yes                   | Yes                      |
| Palettes           | Any                   | Fixed SALT_ORDER         |
| Purpose            | Production answer     | Golden test reference    |

### Recipe-selection policy

When several salts can source the same ion (gypsum and Epsom both supply SO₄;
NaCl, CaCl₂ and MgCl₂ all supply Cl), the system is **underdetermined** — many
non-negative recipes hit the same target, and plain NNLS returns the minimum-
L2-norm one, which splits the dose across redundant salts and depends on the
palette's column order.

The production `solve()` resolves this with a deterministic, priority-ordered
greedy support selection layered on NNLS (a **lexicographic objective: best fit
first, then priority/sparsity**): NNLS fixes the optimal residual `r*`, then the
solver walks `SALT_ORDER` adding salts only until `r*` is reached and prunes any
salt whose removal does not raise the residual above `r*`. The result is the
highest-priority _minimal_ salt set that still attains the optimal fit —
deterministic regardless of input ordering, and still exact when the target is
achievable. See **ADR 0009**.

---

## 5. Ion Profile Data Model

### `IonProfile`

The core data type for ion concentrations throughout the engine is:

```typescript
type IonProfile = Partial<Record<IonId, number>>
```

- Keys are `IonId` values: `'Ca' | 'Mg' | 'Na' | 'K' | 'HCO3' | 'SO4' | 'Cl'`.
- Values are **mg/L** (milligrams per litre).
- Missing keys are treated as **zero** throughout the engine — there is no
  distinction between "not present" and "0 mg/L".

This type is used for:

- **Target profiles** — the desired finished water ion concentrations.
- **Source water profiles** — ions already present in the starting water
  (all zeros for distilled water, the default).
- **Result profiles** — the ion concentrations the recipe is expected to
  produce once the doses dissolve in the source water.

### `SaltDose`

Salt doses are stored as:

```typescript
type SaltDose = Partial<Record<SaltId, number>>
```

- Values are **grams per litre** (g/L) in `dosePerLitre`, or **total grams**
  (for the requested batch volume) in `recipe`.
- Missing salts are zero.

### Full solve result

The `solve()` function returns a `SolveResult`:

```typescript
interface SolveResult {
  recipe: SaltDose // grams per batch (scaled to batch volume)
  dosePerLitre: SaltDose // grams per litre (unscaled)
  resultProfile: IonProfile // expected finished water (mg/L)
  readouts: Readouts // TDS, SO4:Cl ratio, charge residual
  warnings: SaturationWarning[] // gypsum / calcite SI warnings
}
```

**Note:** A formal JSON schema for persisted and shareable profile data
(covering named profiles, source-water descriptors, and batch metadata) is
planned for M1. This section documents only the in-engine TypeScript types
that exist today.

---

## References

- Lersch, M. (Khymos). Mineral water recipes.
  [khymos.org](https://khymos.org/). (Salt priority order and driver-ion
  assignments; CC-BY-SA-4.0.)
- IUPAC Commission on Atomic Weights and Isotopic Abundances (2021). Standard
  atomic weights. [iupac.org](https://iupac.org/). (Atomic weights used in
  `constants.ts`.)
- Lawson, C.L. and Hanson, R.J. (1974). _Solving Least Squares Problems_.
  Prentice-Hall. (NNLS algorithm.)
