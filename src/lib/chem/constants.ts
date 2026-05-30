// Chemical constants for the Waterforge engine.
//
// Everything downstream (the ion x salt matrix, conversions, saturation
// indices) is derived from the atomic weights and stoichiometry declared here,
// so the numbers stay auditable: nothing is hand-tuned. Background on the ions
// and salts modelled lives in the chemistry guides under `docs/`.

/** The seven ions Waterforge tracks, by their conventional symbols. */
export type IonId = 'Ca' | 'Mg' | 'Na' | 'K' | 'HCO3' | 'SO4' | 'Cl'

/** The food-grade salts Waterforge can dose. */
export type SaltId =
  | 'gypsum'
  | 'epsom'
  | 'tableSalt'
  | 'calciumChloride'
  | 'calciumChlorideAnhydrous'
  | 'bakingSoda'
  | 'chalk'
  | 'magnesiumChloride'
  | 'potassiumBicarbonate'

// Atomic / elemental weights (g/mol). Standard atomic weights at the precision
// the source method uses; group weights below are summed from these.
export const ATOMIC_WEIGHTS = {
  Ca: 40.078,
  Mg: 24.305,
  Na: 22.99,
  K: 39.098,
  S: 32.06,
  O: 15.999,
  H: 1.008,
  C: 12.011,
  Cl: 35.45,
} as const

// Group weights derived from the atomic weights above. Summing them here (rather
// than quoting a literal) keeps the derivation visible and self-checking.
export const SO4_WEIGHT = ATOMIC_WEIGHTS.S + 4 * ATOMIC_WEIGHTS.O // 96.06
export const HCO3_WEIGHT =
  ATOMIC_WEIGHTS.H + ATOMIC_WEIGHTS.C + 3 * ATOMIC_WEIGHTS.O // 61.017
export const CO3_WEIGHT = ATOMIC_WEIGHTS.C + 3 * ATOMIC_WEIGHTS.O // 60.009
export const CACO3_WEIGHT =
  ATOMIC_WEIGHTS.Ca + ATOMIC_WEIGHTS.C + 3 * ATOMIC_WEIGHTS.O // 100.087

/** Molar mass of CaCO3, the reference compound for alkalinity expressed as-CaCO3. */
export const CACO3_MOLAR_MASS = CACO3_WEIGHT

// CaCO3 carries two equivalents of charge per mole, so its equivalent weight is
// half its molar mass. Used to convert alkalinity between as-CaCO3 and as-HCO3.
export const CACO3_EQUIVALENT_WEIGHT = CACO3_WEIGHT / 2 // 50.0435

export interface Ion {
  readonly id: IonId
  /** Ionic charge (valence with sign). */
  readonly charge: number
  /** Molar mass in g/mol. */
  readonly molarMass: number
}

export const IONS: Record<IonId, Ion> = {
  Ca: { id: 'Ca', charge: +2, molarMass: ATOMIC_WEIGHTS.Ca },
  Mg: { id: 'Mg', charge: +2, molarMass: ATOMIC_WEIGHTS.Mg },
  Na: { id: 'Na', charge: +1, molarMass: ATOMIC_WEIGHTS.Na },
  K: { id: 'K', charge: +1, molarMass: ATOMIC_WEIGHTS.K },
  HCO3: { id: 'HCO3', charge: -1, molarMass: HCO3_WEIGHT },
  SO4: { id: 'SO4', charge: -2, molarMass: SO4_WEIGHT },
  Cl: { id: 'Cl', charge: -1, molarMass: ATOMIC_WEIGHTS.Cl },
}

/** Stable iteration order for ions (cations then anions). */
export const ION_ORDER: readonly IonId[] = [
  'Ca',
  'Mg',
  'Na',
  'K',
  'HCO3',
  'SO4',
  'Cl',
]

export interface Salt {
  readonly id: SaltId
  /** Human-readable name. */
  readonly name: string
  /** Chemical formula, including any water of hydration. */
  readonly formula: string
  /** Molar mass in g/mol, INCLUDING water of hydration. */
  readonly molarMass: number
  // Moles of each ion released per mole of salt dissolved. Chalk (CaCO3)
  // dissolves to Ca plus carbonate; in carbonate water chemistry that carbonate
  // is accounted as bicarbonate alkalinity (HCO3), matching the source method.
  readonly stoichiometry: Partial<Record<IonId, number>>
}

export const SALTS: Record<SaltId, Salt> = {
  gypsum: {
    id: 'gypsum',
    name: 'Gypsum',
    formula: 'CaSO4·2H2O',
    molarMass: 172.17,
    stoichiometry: { Ca: 1, SO4: 1 },
  },
  epsom: {
    id: 'epsom',
    name: 'Epsom salt',
    formula: 'MgSO4·7H2O',
    molarMass: 246.47,
    stoichiometry: { Mg: 1, SO4: 1 },
  },
  tableSalt: {
    id: 'tableSalt',
    name: 'Table salt',
    formula: 'NaCl',
    molarMass: 58.44,
    stoichiometry: { Na: 1, Cl: 1 },
  },
  calciumChloride: {
    id: 'calciumChloride',
    name: 'Calcium Chloride (Dihydrate)',
    formula: 'CaCl2·2H2O',
    molarMass: 147.01,
    stoichiometry: { Ca: 1, Cl: 2 },
  },
  calciumChlorideAnhydrous: {
    id: 'calciumChlorideAnhydrous',
    name: 'Calcium Chloride (Anhydrous)',
    // Same ions as the dihydrate; only the molar mass (no water of hydration)
    // differs, so the gram dose per unit of Ca/Cl is lower. Common in brewing
    // supply as pellets/prills (e.g. LD Carlson "Briners Choice").
    formula: 'CaCl2',
    molarMass: 110.98,
    stoichiometry: { Ca: 1, Cl: 2 },
  },
  bakingSoda: {
    id: 'bakingSoda',
    name: 'Baking soda',
    formula: 'NaHCO3',
    molarMass: 84.007,
    stoichiometry: { Na: 1, HCO3: 1 },
  },
  chalk: {
    id: 'chalk',
    name: 'Calcium Carbonate (Chalk)',
    formula: 'CaCO3',
    molarMass: 100.087,
    // Dissolves (in CO2-charged water) to calcium plus carbonate alkalinity:
    // CaCO3 + CO2 + H2O -> Ca(2+) + 2 HCO3(-). Tracked as 2 HCO3, which keeps
    // the salt charge-balanced and matches standard alkalinity accounting.
    stoichiometry: { Ca: 1, HCO3: 2 },
  },
  magnesiumChloride: {
    id: 'magnesiumChloride',
    name: 'Magnesium chloride hexahydrate',
    formula: 'MgCl2·6H2O',
    molarMass: 203.3,
    stoichiometry: { Mg: 1, Cl: 2 },
  },
  potassiumBicarbonate: {
    id: 'potassiumBicarbonate',
    name: 'Potassium bicarbonate',
    formula: 'KHCO3',
    molarMass: 100.115,
    stoichiometry: { K: 1, HCO3: 1 },
  },
}

/** Stable iteration order for salts (the source method's dosing priority). */
export const SALT_ORDER: readonly SaltId[] = [
  'gypsum',
  'epsom',
  'tableSalt',
  'calciumChloride',
  'calciumChlorideAnhydrous',
  'bakingSoda',
  'chalk',
  'magnesiumChloride',
  'potassiumBicarbonate',
]
