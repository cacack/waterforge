// JSON Schema (draft 2020-12) describing the Profile data model.
//
// This schema is the authoritative machine-readable contract for Waterforge
// profile data files. It is kept in sync with the TS types in `./types.ts` —
// the TS types are the source of truth; this schema is derived from them and
// used for data-file validation, docs generation, and importer tooling.
//
// The schema is exported as a plain JS object so it can be used at runtime
// (e.g. by validation functions or a future JSON-Schema validator) without
// bundling a dedicated schema library.

/** JSON Schema (draft 2020-12) for a Waterforge mineral-water Profile. */
export const PROFILE_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://waterforge.app/schemas/profile.json',
  title: 'WaterforgeProfile',
  description:
    'A named mineral-water profile: ion concentrations (mg/L), optional supplemental measurements, alkalinity unit convention, and provenance.',
  type: 'object',
  required: ['name', 'ions', 'provenance'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      description: 'Canonical name of the water (e.g. "Evian", "Volvic").',
    },
    ions: {
      type: 'object',
      description:
        'Ion concentrations in mg/L. All ions are optional; missing ions are treated as zero by the solver.',
      additionalProperties: false,
      properties: {
        Ca: {
          type: 'number',
          minimum: 0,
          description: 'Calcium (Ca²⁺) in mg/L.',
        },
        Mg: {
          type: 'number',
          minimum: 0,
          description: 'Magnesium (Mg²⁺) in mg/L.',
        },
        Na: {
          type: 'number',
          minimum: 0,
          description: 'Sodium (Na⁺) in mg/L.',
        },
        K: {
          type: 'number',
          minimum: 0,
          description: 'Potassium (K⁺) in mg/L.',
        },
        HCO3: {
          type: 'number',
          minimum: 0,
          description:
            'Bicarbonate / alkalinity in mg/L. Unit is declared by `alkalinity_unit` — check that field before using this value.',
        },
        SO4: {
          type: 'number',
          minimum: 0,
          description: 'Sulfate (SO₄²⁻) in mg/L.',
        },
        Cl: {
          type: 'number',
          minimum: 0,
          description: 'Chloride (Cl⁻) in mg/L.',
        },
      },
    },
    alkalinity_unit: {
      type: 'string',
      enum: ['as_HCO3', 'as_CaCO3'],
      description:
        'Unit in which ions.HCO3 is expressed. Required when ions.HCO3 is present. "as_HCO3" is the engine canonical form; "as_CaCO3" requires ×1.219 conversion.',
    },
    co2: {
      type: 'number',
      minimum: 0,
      description: 'Dissolved CO₂ in mg/L, as reported.',
    },
    ph: {
      type: 'number',
      minimum: 0,
      maximum: 14,
      description: 'pH, as reported.',
    },
    tds: {
      type: 'number',
      minimum: 0,
      description:
        'Total dissolved solids in mg/L, as reported. May differ from the sum of the seven tracked ions.',
    },
    comment: {
      type: 'string',
      description:
        'Free-text annotation (measurement method notes, seasonal variation, etc.).',
    },
    url: {
      type: 'string',
      format: 'uri',
      description: 'URL to the primary source or product page.',
    },
    provenance: {
      type: 'object',
      description: 'Where the ion values came from and how reliable they are.',
      required: ['verified', 'source', 'source_date'],
      additionalProperties: false,
      properties: {
        verified: {
          type: 'boolean',
          description:
            'Whether the data has been cross-checked against a primary source. Treated as false when absent.',
        },
        source: {
          type: 'string',
          minLength: 1,
          description:
            'Human-readable description of the data source (publication, URL, label scan, etc.).',
        },
        source_date: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
          description:
            'Date the source data was published or accessed (YYYY-MM-DD). Allows consumers to detect stale data.',
        },
      },
    },
  },
} as const
