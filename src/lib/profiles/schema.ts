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

import { PROFILE_CATEGORIES, PROFILE_TRAITS } from './types'

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
      description:
        'SOURCE dissolved CO₂ in mg/L, as reported by a spring/source analysis (water as it emerges). Distinct from carbonation_target (bottled fizz); never derive one from the other.',
    },
    carbonation_style: {
      type: 'string',
      enum: ['still', 'sparkling'],
      description:
        'Whether the water is bottled still or sparkling. Absent = unknown (does not imply still). A first-class field, separate from any traits metadata.',
    },
    carbonation_target: {
      type: 'object',
      description:
        'Target/bottled carbonation to reproduce the product, with its own unit and provenance. Absent = not authoritatively sourced; do not estimate from co2.',
      required: ['value', 'unit', 'provenance'],
      additionalProperties: false,
      properties: {
        value: {
          type: 'number',
          minimum: 0,
          description: 'Target carbonation magnitude, expressed in `unit`.',
        },
        unit: {
          type: 'string',
          enum: ['volumes', 'gPerL'],
          description:
            'Unit the value is expressed in: "volumes" of CO₂ or "gPerL" (g/L). Required when carbonation_target is present.',
        },
        provenance: {
          type: 'object',
          description:
            'Where the carbonation figure came from and how reliable it is — same authoritative-sourcing bar as ion data.',
          required: ['verified', 'source', 'source_date'],
          additionalProperties: false,
          properties: {
            verified: {
              type: 'boolean',
              description:
                'Whether the carbonation figure has been cross-checked against a primary source.',
            },
            source: {
              type: 'string',
              minLength: 1,
              description:
                'Human-readable description of the carbonation data source.',
            },
            source_date: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description:
                'Date the carbonation source was published or accessed (YYYY-MM-DD).',
            },
          },
        },
      },
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
    country: {
      type: 'string',
      description: 'Country of origin (e.g. "France"). A geographic fact.',
    },
    locality: {
      type: 'string',
      description:
        'Locality / region or spring source (e.g. "Évian-les-Bains").',
    },
    description: {
      type: 'string',
      description:
        'Short, neutral prose description (~1–2 sentences, soft cap ~240 chars). Our own editorial summary — never copied bottler marketing.',
    },
    category: {
      type: 'string',
      enum: [...PROFILE_CATEGORIES],
      description:
        'High-level category. Unknown values are rejected. One of: bottled, brewing, coffee, synthetic.',
    },
    traits: {
      type: 'array',
      description:
        'Editorially-assigned descriptive traits for browsing/filtering (not auto-computed from ions). Each item must be a known trait; unknown values are rejected.',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: [...PROFILE_TRAITS],
      },
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
