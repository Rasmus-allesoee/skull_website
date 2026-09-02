# Content and data model

**Status:** Approved contract; schema version 4, class-aware measurements, and generated search projection implemented

**Last reviewed:** 2026-09-02

## 1. Purpose

This document defines how taxonomic identities, physical specimens, measurements, provenance, preparation, editorial profiles, citations, and media relate. It is the contract between human-maintained content and the application.

The current `agent_context/skulls_meta.csv` is an incomplete illustrative working sheet. The partial `agent_context/metadata_csv/*.csv` exports include useful bird-measurement evidence but also legacy row IDs, helper columns, incomplete taxonomy, and unreviewed publication fields. None is a production input or may dictate identity. Phase 2 used only the user-selected row with source `ID = 1` as evidence for a manually curated representative record; Phase 6 ingests reviewed normalized exports after stable IDs, public notes, rights, and image filenames are complete.

## 2. Sources of truth

| Source | Owns | Does not own |
|---|---|---|
| `content/taxa/taxa.csv` | Identity, names, rank, hierarchy, taxonomy references, slug, default specimen, publication state | Physical measurements, acquisition, preparation |
| `content/specimens/specimens.csv` | One physical skull, biology, condition/observations, provenance, preparation, measurements, rights, publication state | Shared species prose or hierarchy definitions |
| `content/profiles/{taxon-id}.mdx` | Optional review-gated overview and skull-identification prose | Record fields that need filtering or validation |
| `content/guides/*.mdx` | Cited editorial guides | Taxon/specimen facts |
| `content/media/{specimen-id}.json` | Canonical views, lateral orientation, alt text, credit, and rights declarations | Pixel-derived dimensions/bounds |
| `content/references/{reference-id}.json` | Stable comparison-reference identity, display/search terms, approximate measurements, default state, orientation, credit, and rights | Specimen/taxon identity or universal biological claims |
| `content/home/home-media.json` | Stable Home-only editorial thumbnail identities, public paths, alt text, credit, and reserved-rights state | Specimen identity, source pixels, or preparation instructions |
| Media manifests generated from public assets | Dimensions, canonical view, path, subject bounds, alpha-derived Home hit path, technical validation | Rights/provenance source decisions |
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

Phase 2 fixed the committed header order in `src/domain/content/schemas.ts` and added strict executable validation. Phase 2.1 deliberately extended that order and advanced generated `CompiledCollection.schemaVersion` from 1 to 2. Phase 2.2 advanced the compiled contract to version 3 for lateral orientation and comparison-reference records without changing either CSV header. Phase 3 advances it to version 4 and expands only the canonical `specimens.csv` header with reviewed mammal/bird measurement value-status pairs. Schema/header changes require the change-management process in section 18; do not create ad-hoc production CSV variants or parallel class-specific specimen tables.

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

The executable Phase 2 schema preserves these semantics. `src/domain/content/schemas.ts` is the machine-readable header and controlled-value contract; this document owns their meaning.

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
| `condition` | enum | Yes | `excellent`, `good`, `fair`, `poor`, `fragmentary`, or `not_recorded`; the UI presents the first five as levels 1–5 |
| `distinguishing_features` | public string | No | Factual visible condition detail; no private notes |

### Biological context

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `sex` | enum | No | `female`, `male`, `intersex`, `unknown`, or `not_recorded` |
| `age_class` | enum | No | `juvenile`, `subadult`, `young_adult`, `adult`, `old_adult`, `indeterminate`, or `not_recorded` |
| `age_detail` | public string | No | Evidence or more precise age statement |
| `pathology_status` | enum | No | `yes`, `no`, or `not_recorded`; independent of physical condition |
| `pathology_description` | public string | Conditional | Required when pathology is `yes`; otherwise empty |
| `trauma_status` | enum | No | `yes`, `no`, or `not_recorded`; bite marks, projectile damage, or other observed trauma |
| `trauma_description` | public string | Conditional | Required when trauma is `yes`; otherwise empty |
| `teeth_completeness` | enum | No | `complete`, `partially_complete`, `incomplete`, or `not_recorded` |
| `skeleton_completeness` | enum | No | `full`, `partial`, `none`, or `not_recorded` |
| `body_mass_g` | measurement | No | Animal body mass, separate from skull mass |

Condition records preservation/completeness, while pathology and trauma record separate observations. Natural abnormalities, age-related tooth loss, and developmental features do not lower condition by themselves. `not_recorded` is required unless the specimen was actually assessed; absence of a note must never be compiled as `no`, `complete`, or `none`.

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

### Skull measurements and class profiles

All numeric values are non-negative decimal numbers in canonical units. Every field has an adjacent `_status` field. The compiler derives a specimen's `mammal`, `bird`, or fallback `other` profile from its linked taxon's canonical class rather than trusting a duplicate class column on the specimen row.

| Field | Unit | Profiles | Meaning |
|---|---|---|---|
| `skull_length_mm` | mm | All | Approved total skull-length landmark pair |
| `skull_mass_g` | g | All | Prepared skull/mandible configuration defined in methodology |
| `cranium_width_mm` | mm | All | Approved cranium-width landmark pair |
| `mandible_length_mm` | mm | All | Approved maximum mandible-length landmark pair |
| `condylobasal_length_mm` | mm | Mammal | Anterior premaxilla to posterior occipital-condyle landmark pair |
| `skull_width_mm` | mm | Mammal | Approved maximum skull-width landmark pair |
| `skull_height_mm` | mm | Mammal | Approved skull-height landmark pair |
| `rostrum_width_mm` | mm | Mammal | Recorded transverse rostrum width |
| `maxillary_tooth_row_length_mm` | mm | Mammal | Recorded upper-jaw tooth-row length |
| `mandibular_tooth_row_length_mm` | mm | Mammal | Recorded lower-jaw tooth-row length |
| `mandible_ramus_height_mm` | mm | Mammal | Straight-line ramus height |
| `mandible_body_height_mm` | mm | Mammal | Mandibular body height at the final molar |
| `maxillary_canine_length_mm` | mm | Mammal | Exposed/defined upper-canine measurement |
| `mandibular_canine_length_mm` | mm | Mammal | Exposed/defined lower-canine measurement |
| `cranium_height_mm` | mm | Bird | Approved vertical cranium-height record |
| `interorbital_width_mm` | mm | Bird | Recorded minimum width between the orbits |
| `orbital_width_mm` | mm | Bird | Recorded transverse orbit width |
| `bill_length_mm` | mm | Bird | Approved bill-length landmark pair |
| `bill_width_mm` | mm | Bird | Approved transverse bill-width record |
| `bill_height_mm` | mm | Bird | Approved vertical bill-height record |

Profile rules:

- `Mammalia` (including approved slugs `mammal`, `mammals`, or `mammalia`) resolves to `mammal`; `Aves` (including `bird`, `birds`, or `aves`) resolves to `bird`; every other class resolves to the conservative shared-field `other` profile until reviewed.
- An applicable field may be `measured`, `approximate`, or `not_recorded`; it must not use `not_applicable` merely because no value was entered.
- A field outside the resolved profile must have a blank value and `not_applicable` status. This makes accidental mammal fields on birds—and bird fields on mammals—blocking diagnostics.
- Mammal primary presentation uses maximum length/width/height, cranium width, maximum mandible length, and prepared mass. Bird primary presentation uses maximum length, bill length/width/height, cranium width/height, orbital width, maximum mandible length, and prepared mass. Less central applicable values remain progressively disclosed.
- `body_mass_g` remains biological context shared by all profiles and is not confused with prepared skull mass.

These landmark names are executable field labels, not a complete anatomical protocol. Exact landmark illustrations and reproducible measurement instructions still require owner-supplied real-skull imagery plus cited methodology review.

### Rights, credit, and notes

| Field | Type | Required for published | Meaning |
|---|---|---:|---|
| `specimen_credit` | public string | Yes | Structured record/specimen credit; owner is displayed from `owner_credit` |
| `data_rights` | enum | Yes | Initially `all_rights_reserved`; later licenses require explicit review |
| `media_credit` | public string | Yes | Default photographer name, overridable per asset later; UI prefixes it with `Photo:` |
| `media_rights` | enum | Yes | Initially `all_rights_reserved` |
| `public_notes` | public string | No | Reviewed facts suitable for publication |
| `source_references` | citation-key list | No | Structured references for record-specific claims |

No column named simply `notes` is allowed in the public CSV because it encourages accidental export of private working commentary. Private notes remain outside the repository.

## 7. Conceptual domain types

The concrete TypeScript types in `src/domain/content/types.ts` express, without weakening, these shapes:

```ts
type PublicationStatus = "draft" | "review" | "published" | "archived";

type MeasurementProfile = "mammal" | "bird" | "other";

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
  condition: "excellent" | "good" | "fair" | "poor" | "fragmentary" | "not_recorded";
  pathology: { status: "yes" | "no" | "not_recorded"; description: string | null };
  trauma: { status: "yes" | "no" | "not_recorded"; description: string | null };
  teethCompleteness: "complete" | "partially_complete" | "incomplete" | "not_recorded";
  skeletonCompleteness: "full" | "partial" | "none" | "not_recorded";
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
  hitPath?: string; // normalized alpha-derived SVG path for Home hit testing
  orientation: "left" | "right" | null;
  alt: string;
  credit: string;
  rights: string;
  publicPath: string;
}

interface ComparisonReferenceRecord {
  referenceId: string;
  label: string;
  isDefault: boolean;
  aliases: string[];
  note: string;
  measurementProfile: MeasurementProfile;
  measurements: Record<ComparisonMeasurementKey, Measurement>;
  media: {
    width: number;
    height: number;
    subjectBounds: { x: number; y: number; width: number; height: number };
    orientation: "left" | "right";
    alt: string;
    credit: string;
    rights: "all_rights_reserved";
    publicPath: string;
  };
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
- `not_applicable` is validated against the linked taxon's measurement profile; it is not a generic synonym for blank.
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

### Generated catalog-search projection

`pnpm content:build` projects published canonical records into a versioned artifact; it never accepts search-only source rows.

- `rank` documents contain the canonical class/order/family/genus name, slug, descendant taxon IDs, stable rank URL, and a deterministic published representative lateral image when one exists.
- `taxon` documents contain curated English/scientific/Danish display values, taxon ID, aliases/previous slugs, hierarchy text, stable taxon URL, default lateral asset, and reviewed profile text only when such prose exists.
- `specimen` documents contain the immutable specimen ID, linked taxon names/aliases/hierarchy, exact nested URL, and that specimen's canonical lateral asset.
- Matching-only values use NFKD/diacritic, case, punctuation, and whitespace normalization. Display labels and URLs remain untouched.
- Draft/archived taxa, specimens, and profiles are absent. The artifact cannot assign identity, change taxonomy, or make a record publishable.
- `.generated/search-documents.json` and `public/generated/catalog-search-v1.json` are ignored replaceable copies of the same deterministic document set. They are validated by schema/version at load and never hand-edited.

## 11. Editorial profiles and citations

One optional profile file is keyed by taxon ID, for example `content/profiles/TAX-0001.mdx`.

Expected frontmatter:

```yaml
taxon_id: TAX-0001
review_status: draft
last_reviewed: 2026-08-12
summary: Concise internal profile state or reviewed page description.
citations: []
```

A reviewed profile replaces the empty citation list with entries such as:

```yaml
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

- Profiles are optional. A published taxon and specimen do not require an editorial profile.
- A `draft` profile retains the four canonical headings but may have empty sections and an empty citation list; it is compiled for authoring checks and omitted from the public page.
- Only `reviewed` profiles may render publicly. They require at least one citation; their Overview, Skull identification, and Comparison notes sections must be non-empty, useful, and supported where claims require it.
- Species-level external facts require citations near the claim.
- Specimen observations are labelled as observations and remain in structured/public specimen fields where filterable.
- MDX components are allowlisted; arbitrary scripts and raw HTML are forbidden.
- References use stable primary/authoritative sources where possible and include access dates for web sources.
- Missing profile prose must not block or add placeholder copy to a valid specimen display.

## 12. Guide content

Guide MDX uses explicit title, slug, summary, review date, safety-review status, and citations. Preparation guidance must distinguish documented practice from established safety guidance. Chemical concentrations, animal handling, disease, legal collection rules, and disposal claims require current authoritative review before publication. The Phase 2.1 static `/guides/skull-preparation` outline is intentionally not guide MDX and cannot be mistaken for reviewed procedural content.

### Measurement methodology reference

- `content/methodology/measurement-definitions.csv` is the canonical 21-row definition source for `/methodology`, with the exact ordered headers `Number`, `Measurement`, and `Exact landmarks / method`.
- `content/methodology/measurement-reference.json` owns five stable diagram IDs, public media declarations, original canvas dimensions, one non-destructive in-bounds presentation viewport per diagram, and 24 independently addressable SVG occurrences. Definition numbers are unique; occurrences may repeat a number across distinct views.
- Build validation requires definitions 1–21 exactly once, at least one occurrence for every definition, one definition for every occurrence, unique per-view numbers, non-zero in-bounds geometry and viewports, explicit credit/rights, and five declared WebP derivatives. Source verification additionally covers the owner-corrected lateral and mandible dashed guides.
- This reference model defines terminology and illustrated landmarks; it does not add or migrate specimen measurement values and never changes the unified `specimens.csv` profile contract.
- The profile-specific specimen guide remains the concise index of stored fields. A shared label does not by itself prove that a legacy stored value followed every more detailed landmark shown on `/methodology`; value-level reconciliation remains part of the audited migration when source evidence requires it.
- Source-only parentheticals have been removed from the published definition descriptions; any future source attribution remains owner-provided context until it is promoted to a reviewed citation record. Do not invent URLs, authors, or stronger protocol claims without reviewed sources.
- Raw and annotated source PNGs remain ignored under `agent_context/measurement_page/`. Only unannotated processed derivatives are public; the annotated images are positional evidence and must never be displayed or committed as production media.

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
- A schema-version-2 specimen media declaration records an explicit `left`/`right` orientation for the lateral asset. Other views have no lateral orientation value. Runtime heuristics must not guess direction.
- No common names, scientific names, spaces, Danish letters, or mutable slugs in filenames.
- The processing command converts to sRGB, normalizes orientation, strips metadata, validates transparency and dimensions, calculates subject bounds, and writes a maximum 3200 px transparent WebP at quality 90/alpha 100.
- Lateral is mandatory. Missing optional views generate authoring warnings; unexpected view tokens are errors.
- Every asset resolves to a specimen and has alt text, credit, rights, dimensions, and deterministic sort order.

Methodology reference derivatives use stable diagram IDs under `public/media/methodology/`. They preserve the registered source aspect ratio, transparency, and sRGB pixels; strip EXIF/IPTC/XMP; stay within the 1200–3200 px longest-edge contract and 5 MB per-file budget; and are validated against the canonical methodology declaration. Their coordinate system remains the original raw/annotated canvas rather than the smaller public pixel dimensions; the declared presentation viewport crops only layout-time empty canvas and never rewrites the derivative.

Home editorial derivatives use stable IDs and declared paths under `public/media/home/`. The owner-authorized Home thumbnail sources remain ignored staging input; `pnpm media:process:home` accepts the reviewed JPEG/PNG sources, normalizes orientation, converts to sRGB, fits each image inside a 1200 px longest edge without stretching or cropping, and strips EXIF/GPS/ICC/IPTC/XMP. Normal content and media validation checks all declared derivatives and generates the typed Home manifest; the browser never reads the source files or `agent_context`.

Phase 3.2 corrected the committed lateral/oblique pixels for SPEC-0003, SPEC-0013, and SPEC-0018 by rebuilding exactly those six changed derivatives from the already right-facing clean masters through the 104-entry staging map and ordinary processor. No display-time filename/flip exception or manual WebP edit was introduced. The regenerated manifest recomputes subject bounds, so galleries, cards, suggestions, and comparisons share the corrected framing wherever each canonical asset is used.

Alt text describes the useful view and visible specimen condition without repeating the nearby name mechanically. Decorative duplicates use empty alt only when the same information is already adjacent and the image adds no independent function.

### Comparison references and calibrated eligibility

- Comparison references have stable ASCII IDs, declaration filenames that match those IDs, and public paths derived from those IDs under `public/media/references/`.
- Exactly one reference has `is_default = true`. Phase 2.2 uses `adult-human-skull` as that default.
- The adult-human reference stores fixed approximate values: maximum length 182 mm, maximum width 124 mm, height 133 mm, prepared mass 800 g, cranium width 138 mm, and maximum mandible length 117 mm. Its note explicitly says these are representative approximate dimensions, not a universal human average.
- Reference declaration schema version 2 records `measurement_profile`. It requires that profile's complete comparison suite—six mammal, nine bird, or four shared fallback measurements—plus explicit lateral orientation, alt text, credit, rights, and a validated transparent WebP with compiled subject bounds. Fields outside the profile compile to `not_applicable`.
- An eligible specimen comparison record is the published default specimen for its taxon and has a validated lateral asset, explicit orientation, and measured maximum skull length. A missing/approximate/unusable scaling value excludes it rather than fabricating scale.
- Reference records sort before specimen records in the scoped comparison selector; the current specimen is excluded. That selector matches its eligible reference/specimen labels, names, aliases, and IDs within its own route-specific record set rather than querying the global catalog index.
- Calibrated rendering maps `subjectBounds.width` to the record's maximum skull length and applies one shared pixels-per-millimetre factor to the pair. Canvas margins never contribute to anatomical length; source aspect ratio and all anatomical endpoints remain intact.
- Approximate reference measurements retain `status = approximate` in the compiled record and display approximation markers. Ratios and differences are derived values, never source measurements.
- `note` belongs to each comparison record and renders only while that record is selected; specimen records do not inherit the adult-human wording. The difference-level approximation explanation renders only when at least one available displayed difference has an approximate source status.

Comparison difference matrices:

| Pair | Rows |
|---|---|
| Mammal ↔ mammal | Maximum length, maximum width, maximum height, cranium width, maximum mandible length, prepared skull mass |
| Bird ↔ bird | Maximum length, bill length, bill width, bill height, cranium width, cranium height, orbital width, maximum mandible length, prepared skull mass |
| Bird ↔ mammal | Maximum length; orbital width ↔ maximum width; cranium height ↔ skull height; cranium width; maximum mandible length; prepared skull mass |
| Any pair involving `other` | The four shared fields only |

Bird/mammal width and height compare different named landmarks for a practical descriptive contrast. The UI states that limitation; the mapping must never be described as homologous or silently relabelled as the same anatomical measurement.

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
- Class-profile applicability and each measurement's value/status pairing agree.
- `pathology_status = yes` and `trauma_status = yes` each require a public description; `no` or `not_recorded` forbid a description so status and prose cannot contradict.
- Notes and provenance fields are marked public-safe.

### Cross-record

- Every published default points back to the same taxon.
- Repeated class/order/family/genus name, slug, and parent relationships are consistent across all canonical taxon rows.
- A published specimen cannot link to a draft/archived taxon.
- Previous slugs do not collide with current or previous slugs.
- Media names contain only linked specimen IDs and canonical views.
- Every lateral specimen asset has explicit orientation; all non-lateral specimen assets have `orientation = null` in compiled output.
- Exactly one valid comparison reference is default and every declared reference asset passes the media contract.
- Generated search URLs and map URLs resolve to generated routes.

Errors include the source, row/key, field, invalid value, rule, and suggested correction. Warnings never replace a failure when publication integrity is at risk.

## 16. Phase 2 representative curation record

The vertical slice intentionally established identities and semantics without turning a legacy row position or filename into general import behavior:

| Evidence | Curated result | Reason |
|---|---|---|
| staging species `Nyctereutes procyonoides`, row `ID = 1` | `TAX-0001`, slug `raccoon-dog`, and physical `SPEC-0001` | Stable local identities were explicitly assigned; neither comes from a mutable name or row number |
| `01/11/2025` plus separate month/year columns | `2025-11`, precision `month` | The legacy sheet frequently uses day `01` as a placeholder; no exact day was asserted |
| coordinates plus `location_uncertainty_meters = 25000` | source point retained, precision `approximate`, 25,000 m uncertainty | Precision is source evidence, not inferred from the number of decimals |
| locality phrase `ved vadehavet` in the private narrative | public label `Wadden Sea region, Denmark` | Only the non-identifying locality fact was curated; personal names and anecdotal detail stayed outside Git |
| `Source = Shot` | `acquisition_source = hunting` | Canonical controlled vocabulary preserves the event meaning |
| sex/body mass `X`; whitening product diluted with water | explicit `not_recorded` states | Missing values are not zero; the product label is not misreported as the final peroxide concentration |
| age `4` | `age_class = adult`; legacy stage number not displayed as evidence | The source supports the broad class, while the owner's review requires a separately documented age-estimation method rather than an unexplained internal stage |
| `Ødelagt næsetip` plus owner review of its extent | `condition = good`; public detail `Small chip at the anterior nasal tip.` | The five-level preservation scale distinguishes a minor chip from substantial damage |
| no reviewed staging values for pathology, trauma, teeth completeness, or retained skeleton | explicit `not_recorded` states | Missing observations are not inferred as negative or complete |

The user-provided context establishes private ownership and original photography for this selected slice. Canonical `owner_credit`, `specimen_credit`, and `media_credit` store `Rasmus`; the page renders `Owner: Rasmus`, `Photo: Rasmus`, and the global `© 2026 Rasmus. All rights reserved.` footer. Collection data and media remain reserved under `RIGHTS.md` even though the earlier large rights panel is no longer displayed.

Phase 2.2 adds only a separate visual comparison reference; it does not identify a second collection specimen. Its ignored PNG source was processed through the reference-media command, and the committed declaration/derivative preserve explicit approximate-measurement, credit, rights, orientation, bounds, and metadata-stripping semantics.

### Phase 3 class-aware schema decision

The supplied `specimens_birds_measurements_raw.csv` demonstrated that mammal-only columns do not describe bird skulls adequately. Phase 3 therefore incorporated its nine requested bird fields into the one canonical specimen schema and added the missing mammal rostrum/maxillary-tooth-row fields seen in the broader export. Phase 3.0 did not copy any raw row value into public records. The raccoon-dog row explicitly marks bird-only fields `not_applicable` and retains unrecorded applicable mammal fields as `not_recorded`.

### Phase 3.1 review-slice migration

Phase 3.1 deliberately normalized a bounded subset of the same ignored exports after matching them to the owner's cleaned image sets. The result is 15 published taxon identities (13 species-level and two explicit genus-level `sp.` records) linked to 18 published specimens and 104 validated media assets. This is an auditable review expansion, not a declaration that all source rows are complete.

- The accepted `TAX-0002`–`TAX-0015` and `SPEC-0002`–`SPEC-0018` IDs now participate in public URLs and must not be reassigned from row order during Phase 6.
- `Gavia` and `Larus` are canonical genus names; the separate qualifier renders them as *Gavia* sp. and *Larus* sp. without changing the external taxonomy match.
- Applicable values copied from a source measurement remain `measured`. Blank applicable fields remain `not_recorded`; out-of-profile fields are `not_applicable`.
- Ambiguous body-mass units, incompatible raw tooth counts, private-style distinguishing text, and unreviewed preparation durations were not normalized into public facts.
- Explicit coordinates were retained with their supplied uncertainty semantics; no locality or EXIF geocoding occurred.
- All accepted rows use the repository's reserved rights value and the supplied owner/photographer credit. Phase 6 must still re-audit final rights and public-note decisions.
- Four published records legitimately lack an optional frontal view. The compiler reports them as warnings while lateral media remains blocking.

The complete accepted/blocked record matrix and transformation rationale are in [phase_3_1_migration_audit.md](phase_3_1_migration_audit.md).

## 17. Migration from the current draft

The draft metadata, partial `metadata_csv` exports, and staged images are input evidence, not production sources. Phase 3.1 converted only the audited review slice above. Complete migration in Phase 6 will:

1. preserve a private backup of the original working sheet and image masters;
2. reconcile every row against the Phase 3.1 accepted/blocked ledger, preserve its public IDs/URLs, and assign immutable IDs only to genuinely unmapped physical records;
3. map spreadsheet helper columns and the separate bird-measurement export into the unified reviewed schema without duplicating specimen tables;
4. convert `X`, blanks, and `N/A` without losing semantics;
5. separate private notes from curated public notes;
6. validate dates, units, coordinates, methods, rights, and credits;
7. verify taxonomy and explicitly review uncertain records;
8. rename and process images against exact specimen IDs;
9. select one default specimen per publishable taxon; and
10. keep incomplete records as drafts until they satisfy publication gates.

No bulk migration should silently “clean” biologically meaningful values. A migration report records every rejected or transformed field.

## 18. Change management

- Adding an optional field requires schema, type, documentation, tests, and rendering-state review.
- Renaming/removing a field requires a versioned migration.
- ID/URL semantics, licensing, location policy, or source-of-truth changes require an ADR.
- Controlled vocabulary changes must define how existing values migrate.
- CSV column order is kept stable for readable reviews.
- Any executable schema divergence from this approved contract must update this document and `AGENTS.md` where agents need the new rule.
