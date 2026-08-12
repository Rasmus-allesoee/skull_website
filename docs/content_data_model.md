# Content and data model

**Status:** Approved contract; executable schemas begin in Phase 2

**Last reviewed:** 2026-08-12

## 1. Purpose

This document defines how taxonomic identities, physical specimens, measurements, provenance, preparation, editorial profiles, citations, and media relate. It is the contract between human-maintained content and the application.

The current `agent_context/skulls_meta.csv` is an incomplete illustrative working sheet. It must not be copied into production, published, or allowed to dictate this schema. Phase 6 ingests a reviewed replacement export after stable IDs, public notes, and image filenames are complete.

## 2. Sources of truth

| Source | Owns | Does not own |
|---|---|---|
| `content/taxa/taxa.csv` | Identity, names, rank, hierarchy, taxonomy references, slug, default specimen, publication state | Physical measurements, acquisition, preparation |
| `content/specimens/specimens.csv` | One physical skull, biology, provenance, preparation, measurements, rights, publication state | Shared species prose or hierarchy definitions |
| `content/profiles/{taxon-id}.mdx` | Cited overview and skull-identification prose | Record fields that need filtering or validation |
| `content/guides/*.mdx` | Cited editorial guides | Taxon/specimen facts |
| Media manifest generated from public assets | Dimensions, canonical view, path, subject bounds, technical validation | Rights/provenance source decisions |
| Reviewed taxonomy snapshot | External match evidence and review state | Immutable local identity or curated vernacular names |

Compiled JSON, search indexes, and GeoJSON are generated views. They are never edited as sources.

## 3. File and encoding contract

- CSV files are UTF-8 with a single header row and LF line endings.
- Column names use lower-case ASCII `snake_case`.
- Values are trimmed at import boundaries; meaningful internal whitespace is preserved.
- Decimal numbers use a period and no thousands separators.
- Canonical units are encoded in column names (`_mm`, `_g`, `_days`).
- Multi-value controlled fields use semicolons with no meaning assigned to item order unless documented.
- Spreadsheet formulas are resolved to values before export; formula text is invalid input.
- CSV injection characters in free text are escaped on any future re-export.
- Rows have stable explicit IDs; row position is never identity.
- Unknown extra columns fail validation so misspelled headers are not silently ignored.

Phase 2 will add committed header templates and executable validation. Until then, do not create ad-hoc production CSVs.

## 4. Identity, slugs, and references

### Taxon IDs

Format: `TAX-` plus four or more zero-padded ASCII digits, for example `TAX-0001`.

- Assigned once by the curator/tooling.
- Never derived from scientific name.
- Never reused after deletion or merging.
- Preserved through re-identification; a material split/merge is a reviewed migration.

### Specimen IDs

Format: `SPEC-` plus four or more zero-padded ASCII digits, for example `SPEC-0001`.

- Identifies one physical prepared skull/associated mandible set.
- Printed labels and image filenames should use the same ID.
- Never changes when taxonomy, ownership wording, or measurements are corrected.
- Never reused.

### Public slugs

- Lower-case ASCII words separated by hyphens.
- Curated and unique among published taxa.
- Stable after publication; scientific-name changes use display data plus explicit redirect aliases.
- Specimens use immutable IDs in nested URLs rather than a second mutable slug.

### External identifiers

GBIF and Catalogue of Life identifiers are nullable verification references. They may change or disagree and are never used as relational keys.

## 5. `taxa.csv` contract

The executable schema may refine names during Phase 2, but it must preserve these semantics.

| Field | Type | Required for published | Meaning and constraints |
|---|---|---:|---|
| `taxon_id` | ID | Yes | Immutable local taxon identity |
| `slug` | slug | Yes | Stable public route segment |
| `scientific_name` | string | Yes | Display identification, italicized where appropriate |
| `taxon_rank` | enum | Yes | `subspecies`, `species`, or `genus` for publishable exhibit taxa |
| `identification_qualifier` | enum | Yes | `confirmed`, `probable`, `uncertain`, or `sp` |
| `identification_confidence` | enum | Yes | `high`, `medium`, `low`, or `unassessed` |
| `taxonomic_status` | enum | Yes | `accepted`, `synonym`, `unresolved`, or `not_checked` |
| `english_name` | string | Conditional | Required when an established English common name is used |
| `danish_name` | string | No | Curated Danish common name |
| `aliases` | string list | No | Search synonyms/alternate spellings, semicolon-separated |
| `class_name` | string | Yes | Accepted class label |
| `class_slug` | slug | Yes | Stable class route segment |
| `order_name` | string | Conditional | Accepted order when known/applicable |
| `order_slug` | slug | Conditional | Required with `order_name` |
| `family_name` | string | Conditional | Accepted family when known/applicable |
| `family_slug` | slug | Conditional | Required with `family_name` |
| `genus_name` | string | Yes | Accepted/display genus |
| `genus_slug` | slug | Yes | Stable genus route segment |
| `gbif_taxon_key` | positive integer | No | Reviewed GBIF reference |
| `col_taxon_id` | string | No | Reviewed Catalogue of Life reference |
| `taxonomy_checked_on` | ISO date | Conditional | Required when status is not `not_checked` |
| `taxonomy_snapshot_id` | string | Conditional | Links reviewed snapshot evidence |
| `default_specimen_id` | specimen ID | Yes | Exactly one linked published specimen |
| `previous_slugs` | slug list | No | Explicit redirect aliases; semicolon-separated |
| `publication_status` | enum | Yes | `draft`, `review`, `published`, or `archived` |
| `published_on` | ISO date | Conditional | Required for `published` after first release |
| `updated_on` | ISO date | Conditional | Curated public record update date, not Git timestamp |

Hierarchy fields are denormalized deliberately for readable CSV review and fast validation. The compiler verifies that repeated rank name/slug pairs are consistent across rows.

## 6. `specimens.csv` contract

### Identity and publication

| Field | Type | Required for published | Meaning and constraints |
|---|---|---:|---|
| `specimen_id` | ID | Yes | Immutable physical specimen identity |
| `taxon_id` | taxon ID | Yes | Must resolve to one taxon |
| `publication_status` | enum | Yes | `draft`, `review`, `published`, or `archived` |
| `is_type_or_reference_specimen` | boolean | No | Descriptive collection flag only; must not imply formal taxonomic type status |
| `condition` | enum | Yes | `complete`, `partial`, `damaged`, `pathological`, or `unknown` |
| `distinguishing_features` | public string | No | Factual visible features; no private notes |

### Biological context

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `sex` | enum | No | `female`, `male`, `intersex`, `unknown`, or `not_recorded` |
| `age_class` | enum | No | `juvenile`, `subadult`, `adult`, `senescent`, `unknown`, or `not_recorded` |
| `age_detail` | public string | No | Evidence or more precise age statement |
| `body_mass_g` | measurement | No | Animal body mass, separate from skull mass |

### Acquisition and provenance

| Field | Type | Required for published | Meaning |
|---|---|---:|---|
| `acquisition_source` | enum | Yes | `roadkill`, `beach_washup`, `hunting`, `found_remains`, `captive`, `donation`, `other`, or `unknown` |
| `acquisition_date` | partial date | No | `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` only |
| `acquisition_date_precision` | enum | Conditional | `year`, `month`, `day`, or `unknown`; must agree with value |
| `location_label` | public string | No | Human-readable public locality |
| `country_code` | ISO 3166-1 alpha-2 | No | Initially usually `DK` |
| `latitude` | decimal | Conditional | WGS84, range -90 to 90; paired with longitude |
| `longitude` | decimal | Conditional | WGS84, range -180 to 180; paired with latitude |
| `coordinate_precision` | enum | Conditional | `exact`, `approximate`, or `unknown` |
| `coordinate_uncertainty_m` | non-negative number | No | Optional uncertainty radius |
| `collector_credit` | public string | No | Person/source credit approved for display |
| `owner_credit` | public string | Yes | Current public owner/collection credit |
| `collection_history` | public string | No | Curated, non-sensitive provenance narrative |

Coordinates are published only from explicit reviewed fields. The compiler never extracts them from EXIF or guesses them from `location_label`.

### Preparation and publication history

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `defleshing_method` | enum list | No | `maceration`, `dermestid_beetles`, `simmering`, `manual`, `natural`, `other`, `not_recorded` |
| `defleshing_duration_days` | measurement | No | Duration when recorded |
| `degreasing_agents` | enum list | No | `dish_soap`, `ammonia`, `acetone`, `other`, `none`, `not_recorded` |
| `degreasing_duration_days` | measurement | No | Duration when recorded |
| `whitening_method` | enum | No | `hydrogen_peroxide`, `none`, `other`, `not_recorded` |
| `hydrogen_peroxide_percent` | measurement | Conditional | Required only when safely and reliably recorded |
| `whitening_duration_hours` | measurement | No | Duration when recorded |
| `preparation_notes` | public string | No | Curated observations, not procedural safety advice |
| `photographed_on` | partial date | No | Capture date/precision preserved |
| `uploaded_on` | ISO date | Conditional | Public site record creation date after launch |

### Skull measurements

All numeric values are non-negative decimal numbers in canonical units. Each supports a companion status where needed.

| Field | Unit | Meaning |
|---|---|---|
| `skull_length_mm` | mm | Approved total skull-length landmark pair |
| `skull_width_mm` | mm | Approved maximum skull-width landmark pair |
| `skull_height_mm` | mm | Approved height landmark pair |
| `skull_mass_g` | g | Prepared skull/mandible configuration defined in methodology |
| `cranium_width_mm` | mm | Approved cranium-width landmark pair |
| `mandible_length_mm` | mm | Approved mandible-length landmark pair |
| `maxillary_canine_length_mm` | mm | Exposed/defined upper canine measurement |
| `mandibular_canine_length_mm` | mm | Exposed/defined lower canine measurement |

The final landmark names and diagrams must be tested against real data in Phase 2 before headers become executable. Measurement status semantics are defined in section 8.

### Rights, credit, and notes

| Field | Type | Required for published | Meaning |
|---|---|---:|---|
| `specimen_credit` | public string | Yes | Display credit for the record/specimen |
| `data_rights` | enum | Yes | Initially `all_rights_reserved`; later licenses require explicit review |
| `media_credit` | public string | Yes | Default photography credit, overridable per asset later |
| `media_rights` | enum | Yes | Initially `all_rights_reserved` |
| `public_notes` | public string | No | Reviewed facts suitable for publication |
| `source_references` | citation-key list | No | Structured references for record-specific claims |

No column named simply `notes` is allowed in the public CSV because it encourages accidental export of private working commentary. Private notes remain outside the repository.

## 7. Conceptual domain types

The concrete Phase 2 TypeScript types must express, not weaken, these shapes:

```ts
type PublicationStatus = "draft" | "review" | "published" | "archived";

type Measurement =
  | { status: "measured"; value: number; unit: "mm" | "g" | "days" | "hours" | "percent" }
  | { status: "approximate"; value: number; unit: "mm" | "g" | "days" | "hours" | "percent" }
  | { status: "not_recorded"; value: null; unit: string }
  | { status: "not_applicable"; value: null; unit: string };

type PartialDate =
  | { value: `${number}`; precision: "year" }
  | { value: `${number}-${number}`; precision: "month" }
  | { value: `${number}-${number}-${number}`; precision: "day" }
  | { value: null; precision: "unknown" };

interface TaxonRecord {
  taxonId: string;
  slug: string;
  scientificName: string;
  rank: "subspecies" | "species" | "genus";
  names: { english: string | null; danish: string | null; aliases: string[] };
  hierarchy: TaxonomicHierarchy;
  defaultSpecimenId: string;
  publicationStatus: PublicationStatus;
}

interface Specimen {
  specimenId: string;
  taxonId: string;
  measurements: Record<MeasurementKey, Measurement>;
  location: SpecimenLocation;
  preparation: PreparationRecord;
  rights: RightsRecord;
  publicationStatus: PublicationStatus;
}

interface MediaAsset {
  specimenId: string;
  view: CanonicalView;
  width: number;
  height: number;
  subjectBounds: { x: number; y: number; width: number; height: number };
  alt: string;
  credit: string;
  rights: string;
  publicPath: string;
}
```

Public route models may format these types, but must not collapse their distinctions.

## 8. Missing, approximate, and non-applicable values

Legacy import semantics:

| Source token | Canonical meaning | Display behavior |
|---|---|---|
| empty or `X` | `not_recorded` | “Not recorded” inside a populated group |
| `N/A` | `not_applicable` | “Not applicable” |
| numeric value | `measured` | Formatted with canonical unit |
| explicit approximate numeric syntax approved by schema | `approximate` | Approximation marker plus value |

Rules:

- Missing values never become zero, `false`, or 1 January.
- Unknown records are excluded only while a corresponding numeric filter is active.
- A wholly empty optional section may be hidden; an unknown field inside a meaningful group remains visible.
- Approximation is data, not visual styling alone; assistive text must expose it.
- “Unknown” and “not recorded” can differ in controlled vocabularies when the distinction is scientifically useful, but must not proliferate inconsistently.

## 9. Partial dates

- Accept only `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` with real calendar validation.
- Store the literal partial value and precision; do not convert to a fabricated full date.
- Display locale-neutral public text such as “2024,” “August 2024,” or “12 August 2024.”
- Sorting uses the lowest possible instant only as an internal deterministic key and never implies that fabricated date publicly.
- Date ranges require an explicit later schema rather than overloading one partial date.

## 10. Taxonomy and names

- `scientific_name` is the curator's display identification after review.
- `taxon_rank`, `identification_qualifier`, confidence, and external match status remain independent.
- A record such as *Larus* sp. has rank `genus` and qualifier `sp`; it is not rendered as a confirmed species.
- Common names are curated display terms. Search aliases can include historic names, alternate spellings, and language variants but are not all displayed as accepted names.
- Danish diacritics are preserved. A normalized search field may additionally match ASCII input.
- Taxonomy refresh records evidence; a human accepts any scientific-name or hierarchy change.

## 11. Editorial profiles and citations

One optional profile file is keyed by taxon ID, for example `content/profiles/TAX-0001.mdx`.

Expected frontmatter:

```yaml
taxon_id: TAX-0001
review_status: draft
last_reviewed: 2026-08-12
summary: Concise page description.
citations:
  - key: example-reference
    title: Example title
    authors: Example author
    year: 2026
    url: https://example.org/reference
    accessed: 2026-08-12
```

Expected sections:

- overview;
- skull identification;
- comparison notes where supported; and
- references.

Rules:

- Species-level external facts require citations near the claim.
- Specimen observations are labelled as observations and remain in structured/public specimen fields where filterable.
- MDX components are allowlisted; arbitrary scripts and raw HTML are forbidden.
- References use stable primary/authoritative sources where possible and include access dates for web sources.
- Missing profile prose must not block a valid specimen exhibit; the page can state that an editorial profile is pending.

## 12. Guide content

Guide MDX uses explicit title, slug, summary, review date, safety-review status, and citations. Preparation guidance must distinguish documented practice from established safety guidance. Chemical concentrations, animal handling, disease, legal collection rules, and disposal claims require current authoritative review before publication.

## 13. Media contract

### Canonical views

| Token | Description |
|---|---|
| `lateral` | True side view; required publication hero |
| `oblique` | Lateral-frontal three-quarter view |
| `frontal` | Centered front view |
| `dorsal` | Top view of cranium |
| `ventral` | Underside/palatal view |
| `mandible-dorsal` | Dorsal/occlusal view of mandibles |

### File naming and processing

- Staging input: `{specimen-id}__{view}.png` using ASCII lower-case tokens.
- Public derivative: `{specimen-id}__{view}.webp` under a specimen-addressable media path.
- No common names, scientific names, spaces, Danish letters, or mutable slugs in filenames.
- The processing command converts to sRGB, normalizes orientation, strips metadata, validates transparency and dimensions, calculates subject bounds, and writes a maximum 3200 px transparent WebP at quality 90/alpha 100.
- Lateral is mandatory. Missing optional views generate authoring warnings; unexpected view tokens are errors.
- Every asset resolves to a specimen and has alt text, credit, rights, dimensions, and deterministic sort order.

Alt text describes the useful view and visible specimen condition without repeating the nearby name mechanically. Decorative duplicates use empty alt only when the same information is already adjacent and the image adds no independent function.

## 14. Public location policy

The owner approved exact public coordinates when known. Therefore:

- `exact` means the entered point represents the known collection location at the recorded precision;
- `approximate` means the source itself is uncertain/generalized and must be visibly labelled;
- `unknown` means no point is generated;
- precision is never downgraded silently as privacy theatre, and never upgraded through geocoding;
- sensitive-species or contributor requests may later require an explicit policy/record exception before publication; and
- locality text and coordinate display are reviewed together for accidental private-address disclosure.

## 15. Validation rules

### All rows

- Header and encoding are valid.
- IDs, enum values, booleans, numbers, units, and dates parse without coercive guessing.
- No duplicate IDs or public slugs.
- Paired fields are complete (name/slug, latitude/longitude, date/precision).
- Public text contains no forbidden control characters, formulas, or private-field markers.

### Published taxa

- Valid stable slug, scientific identification, rank/qualifier, hierarchy, and reviewed publication state.
- Exactly one linked published default specimen.
- No duplicate accepted rank path caused by inconsistent spelling.
- Required profile/citation warnings are distinguished from blocking record errors.

### Published specimens

- Linked published taxon exists.
- Lateral media exists and all media passes validation.
- Rights and credits are explicit.
- Coordinates and precision agree; numbers are in range.
- Measurements are finite, non-negative, and use canonical semantics.
- Notes and provenance fields are marked public-safe.

### Cross-record

- Every published default points back to the same taxon.
- A published specimen cannot link to a draft/archived taxon.
- Previous slugs do not collide with current or previous slugs.
- Media names contain only linked specimen IDs and canonical views.
- Generated search URLs and map URLs resolve to generated routes.

Errors include the source, row/key, field, invalid value, rule, and suggested correction. Warnings never replace a failure when publication integrity is at risk.

## 16. Migration from the current draft

The draft metadata and staged images are input evidence, not production sources. Migration in Phase 6 will:

1. preserve a private backup of the original working sheet and image masters;
2. assign immutable taxon and specimen IDs outside image/common-name guesses;
3. map legacy columns to reviewed schema fields;
4. convert `X`, blanks, and `N/A` without losing semantics;
5. separate private notes from curated public notes;
6. validate dates, units, coordinates, methods, rights, and credits;
7. verify taxonomy and explicitly review uncertain records;
8. rename and process images against exact specimen IDs;
9. select one default specimen per publishable taxon; and
10. keep incomplete records as drafts until they satisfy publication gates.

No bulk migration should silently “clean” biologically meaningful values. A migration report records every rejected or transformed field.

## 17. Change management

- Adding an optional field requires schema, type, documentation, tests, and rendering-state review.
- Renaming/removing a field requires a versioned migration.
- ID/URL semantics, licensing, location policy, or source-of-truth changes require an ADR.
- Controlled vocabulary changes must define how existing values migrate.
- CSV column order is kept stable for readable reviews.
- Any executable schema divergence from this approved contract must update this document and `AGENTS.md` where agents need the new rule.
