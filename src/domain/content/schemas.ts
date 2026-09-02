import { z } from "zod";

import { canonicalViews, publicationStatuses } from "./types";

const cell = z.string();

export const taxonHeaders = [
  "taxon_id",
  "slug",
  "scientific_name",
  "taxon_rank",
  "identification_qualifier",
  "identification_confidence",
  "taxonomic_status",
  "english_name",
  "danish_name",
  "aliases",
  "class_name",
  "class_slug",
  "order_name",
  "order_slug",
  "family_name",
  "family_slug",
  "genus_name",
  "genus_slug",
  "gbif_taxon_key",
  "col_taxon_id",
  "taxonomy_checked_on",
  "taxonomy_snapshot_id",
  "default_specimen_id",
  "previous_slugs",
  "publication_status",
  "published_on",
  "updated_on",
] as const;

export const specimenHeaders = [
  "specimen_id",
  "taxon_id",
  "publication_status",
  "is_type_or_reference_specimen",
  "condition",
  "distinguishing_features",
  "sex",
  "age_class",
  "age_detail",
  "pathology_status",
  "pathology_description",
  "trauma_status",
  "trauma_description",
  "teeth_completeness",
  "skeleton_completeness",
  "body_mass_g",
  "body_mass_g_status",
  "acquisition_source",
  "acquisition_date",
  "acquisition_date_precision",
  "location_label",
  "country_code",
  "latitude",
  "longitude",
  "coordinate_precision",
  "coordinate_uncertainty_m",
  "collector_credit",
  "owner_credit",
  "collection_history",
  "defleshing_method",
  "defleshing_duration_days",
  "defleshing_duration_days_status",
  "degreasing_agents",
  "degreasing_duration_days",
  "degreasing_duration_days_status",
  "whitening_method",
  "hydrogen_peroxide_percent",
  "hydrogen_peroxide_percent_status",
  "whitening_duration_hours",
  "whitening_duration_hours_status",
  "preparation_notes",
  "photographed_on",
  "photographed_on_precision",
  "uploaded_on",
  "skull_length_mm",
  "skull_length_mm_status",
  "condylobasal_length_mm",
  "condylobasal_length_mm_status",
  "skull_width_mm",
  "skull_width_mm_status",
  "skull_height_mm",
  "skull_height_mm_status",
  "skull_mass_g",
  "skull_mass_g_status",
  "cranium_width_mm",
  "cranium_width_mm_status",
  "cranium_height_mm",
  "cranium_height_mm_status",
  "rostrum_width_mm",
  "rostrum_width_mm_status",
  "interorbital_width_mm",
  "interorbital_width_mm_status",
  "orbital_width_mm",
  "orbital_width_mm_status",
  "bill_length_mm",
  "bill_length_mm_status",
  "bill_width_mm",
  "bill_width_mm_status",
  "bill_height_mm",
  "bill_height_mm_status",
  "mandible_length_mm",
  "mandible_length_mm_status",
  "maxillary_tooth_row_length_mm",
  "maxillary_tooth_row_length_mm_status",
  "mandibular_tooth_row_length_mm",
  "mandibular_tooth_row_length_mm_status",
  "mandible_ramus_height_mm",
  "mandible_ramus_height_mm_status",
  "mandible_body_height_mm",
  "mandible_body_height_mm_status",
  "maxillary_canine_length_mm",
  "maxillary_canine_length_mm_status",
  "mandibular_canine_length_mm",
  "mandibular_canine_length_mm_status",
  "specimen_credit",
  "data_rights",
  "media_credit",
  "media_rights",
  "public_notes",
  "source_references",
] as const;

export const rawTaxonSchema = z.strictObject({
  taxon_id: cell,
  slug: cell,
  scientific_name: cell,
  taxon_rank: z.enum(["subspecies", "species", "genus"]),
  identification_qualifier: z.enum([
    "confirmed",
    "probable",
    "uncertain",
    "sp",
  ]),
  identification_confidence: z.enum(["high", "medium", "low", "unassessed"]),
  taxonomic_status: z.enum([
    "accepted",
    "synonym",
    "unresolved",
    "not_checked",
  ]),
  english_name: cell,
  danish_name: cell,
  aliases: cell,
  class_name: cell,
  class_slug: cell,
  order_name: cell,
  order_slug: cell,
  family_name: cell,
  family_slug: cell,
  genus_name: cell,
  genus_slug: cell,
  gbif_taxon_key: cell,
  col_taxon_id: cell,
  taxonomy_checked_on: cell,
  taxonomy_snapshot_id: cell,
  default_specimen_id: cell,
  previous_slugs: cell,
  publication_status: z.enum(publicationStatuses),
  published_on: cell,
  updated_on: cell,
});

export const rawSpecimenSchema = z.strictObject({
  specimen_id: cell,
  taxon_id: cell,
  publication_status: z.enum(publicationStatuses),
  is_type_or_reference_specimen: z.enum(["true", "false"]),
  condition: z.enum([
    "excellent",
    "good",
    "fair",
    "poor",
    "fragmentary",
    "not_recorded",
  ]),
  distinguishing_features: cell,
  sex: z.enum(["female", "male", "intersex", "unknown", "not_recorded"]),
  age_class: z.enum([
    "juvenile",
    "subadult",
    "young_adult",
    "adult",
    "old_adult",
    "indeterminate",
    "not_recorded",
  ]),
  age_detail: cell,
  pathology_status: observationStatusSchema(),
  pathology_description: cell,
  trauma_status: observationStatusSchema(),
  trauma_description: cell,
  teeth_completeness: z.enum([
    "complete",
    "partially_complete",
    "incomplete",
    "not_recorded",
  ]),
  skeleton_completeness: z.enum(["full", "partial", "none", "not_recorded"]),
  body_mass_g: cell,
  body_mass_g_status: measurementStatusSchema(),
  acquisition_source: z.enum([
    "roadkill",
    "beach_washup",
    "hunting",
    "found_remains",
    "captive",
    "donation",
    "other",
    "unknown",
  ]),
  acquisition_date: cell,
  acquisition_date_precision: datePrecisionSchema(),
  location_label: cell,
  country_code: cell,
  latitude: cell,
  longitude: cell,
  coordinate_precision: z.enum(["exact", "approximate", "unknown"]),
  coordinate_uncertainty_m: cell,
  collector_credit: cell,
  owner_credit: cell,
  collection_history: cell,
  defleshing_method: cell,
  defleshing_duration_days: cell,
  defleshing_duration_days_status: measurementStatusSchema(),
  degreasing_agents: cell,
  degreasing_duration_days: cell,
  degreasing_duration_days_status: measurementStatusSchema(),
  whitening_method: cell,
  hydrogen_peroxide_percent: cell,
  hydrogen_peroxide_percent_status: measurementStatusSchema(),
  whitening_duration_hours: cell,
  whitening_duration_hours_status: measurementStatusSchema(),
  preparation_notes: cell,
  photographed_on: cell,
  photographed_on_precision: datePrecisionSchema(),
  uploaded_on: cell,
  skull_length_mm: cell,
  skull_length_mm_status: measurementStatusSchema(),
  condylobasal_length_mm: cell,
  condylobasal_length_mm_status: measurementStatusSchema(),
  skull_width_mm: cell,
  skull_width_mm_status: measurementStatusSchema(),
  skull_height_mm: cell,
  skull_height_mm_status: measurementStatusSchema(),
  skull_mass_g: cell,
  skull_mass_g_status: measurementStatusSchema(),
  cranium_width_mm: cell,
  cranium_width_mm_status: measurementStatusSchema(),
  cranium_height_mm: cell,
  cranium_height_mm_status: measurementStatusSchema(),
  rostrum_width_mm: cell,
  rostrum_width_mm_status: measurementStatusSchema(),
  interorbital_width_mm: cell,
  interorbital_width_mm_status: measurementStatusSchema(),
  orbital_width_mm: cell,
  orbital_width_mm_status: measurementStatusSchema(),
  bill_length_mm: cell,
  bill_length_mm_status: measurementStatusSchema(),
  bill_width_mm: cell,
  bill_width_mm_status: measurementStatusSchema(),
  bill_height_mm: cell,
  bill_height_mm_status: measurementStatusSchema(),
  mandible_length_mm: cell,
  mandible_length_mm_status: measurementStatusSchema(),
  maxillary_tooth_row_length_mm: cell,
  maxillary_tooth_row_length_mm_status: measurementStatusSchema(),
  mandibular_tooth_row_length_mm: cell,
  mandibular_tooth_row_length_mm_status: measurementStatusSchema(),
  mandible_ramus_height_mm: cell,
  mandible_ramus_height_mm_status: measurementStatusSchema(),
  mandible_body_height_mm: cell,
  mandible_body_height_mm_status: measurementStatusSchema(),
  maxillary_canine_length_mm: cell,
  maxillary_canine_length_mm_status: measurementStatusSchema(),
  mandibular_canine_length_mm: cell,
  mandibular_canine_length_mm_status: measurementStatusSchema(),
  specimen_credit: cell,
  data_rights: z.enum(["all_rights_reserved"]),
  media_credit: cell,
  media_rights: z.enum(["all_rights_reserved"]),
  public_notes: cell,
  source_references: cell,
});

const lateralMediaSourceAssetSchema = z.strictObject({
  view: z.literal("lateral"),
  alt: z.string().min(1),
  orientation: z.enum(["left", "right"]),
});

const nonLateralMediaSourceAssetSchema = z.strictObject({
  view: z.enum(canonicalViews.filter((view) => view !== "lateral")),
  alt: z.string().min(1),
});

export const mediaSourceSchema = z.strictObject({
  schema_version: z.literal(2),
  specimen_id: z.string(),
  assets: z
    .array(
      z.discriminatedUnion("view", [
        lateralMediaSourceAssetSchema,
        nonLateralMediaSourceAssetSchema,
      ]),
    )
    .min(1),
});

export const mediaAssetSchema = z.strictObject({
  specimenId: z.string(),
  view: z.enum(canonicalViews),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  subjectBounds: z.strictObject({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  hitPath: z.string().min(1).optional(),
  orientation: z.enum(["left", "right"]).nullable(),
  alt: z.string().min(1),
  credit: z.string().min(1),
  rights: z.literal("all_rights_reserved"),
  publicPath: z.string().startsWith("/media/specimens/"),
});

const positiveMeasurement = z.number().positive();
const optionalPositiveMeasurement = positiveMeasurement.optional();

const comparisonReferenceMeasurementSchema = z.strictObject({
  skull_length_mm: optionalPositiveMeasurement,
  skull_width_mm: optionalPositiveMeasurement,
  skull_height_mm: optionalPositiveMeasurement,
  bill_length_mm: optionalPositiveMeasurement,
  bill_width_mm: optionalPositiveMeasurement,
  bill_height_mm: optionalPositiveMeasurement,
  skull_mass_g: optionalPositiveMeasurement,
  cranium_width_mm: optionalPositiveMeasurement,
  cranium_height_mm: optionalPositiveMeasurement,
  orbital_width_mm: optionalPositiveMeasurement,
  mandible_length_mm: optionalPositiveMeasurement,
});

export const comparisonReferenceSourceSchema = z
  .strictObject({
    schema_version: z.literal(2),
    reference_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    label: z.string().min(1),
    is_default: z.boolean(),
    aliases: z.array(z.string().min(1)),
    note: z.string().min(1),
    measurement_profile: z.enum(["mammal", "bird", "other"]),
    asset: z.strictObject({
      public_path: z.string().startsWith("/media/references/"),
      alt: z.string().min(1),
      orientation: z.enum(["left", "right"]),
      credit: z.string().min(1),
      rights: z.literal("all_rights_reserved"),
    }),
    measurements: comparisonReferenceMeasurementSchema,
  })
  .superRefine((source, context) => {
    const requiredByProfile = {
      mammal: [
        "skull_length_mm",
        "skull_width_mm",
        "skull_height_mm",
        "cranium_width_mm",
        "mandible_length_mm",
        "skull_mass_g",
      ],
      bird: [
        "skull_length_mm",
        "bill_length_mm",
        "bill_width_mm",
        "bill_height_mm",
        "cranium_width_mm",
        "cranium_height_mm",
        "orbital_width_mm",
        "mandible_length_mm",
        "skull_mass_g",
      ],
      other: [
        "skull_length_mm",
        "cranium_width_mm",
        "mandible_length_mm",
        "skull_mass_g",
      ],
    } as const;

    for (const key of requiredByProfile[source.measurement_profile]) {
      if (source.measurements[key] === undefined) {
        context.addIssue({
          code: "custom",
          path: ["measurements", key],
          message: `Measurement is required for ${source.measurement_profile} comparison references`,
        });
      }
    }
  });

export const citationSchema = z.strictObject({
  key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  authors: z.string().min(1),
  year: z.number().int().min(1500).max(2100),
  url: z.url(),
  accessed: z.iso.date(),
});

export const profileFrontmatterSchema = z
  .strictObject({
    taxon_id: z.string(),
    review_status: z.enum(["draft", "reviewed"]),
    last_reviewed: z.iso.date(),
    summary: z.string().min(1),
    citations: z.array(citationSchema),
  })
  .superRefine((profile, context) => {
    if (
      profile.review_status === "reviewed" &&
      profile.citations.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["citations"],
        message: "A reviewed profile requires at least one citation",
      });
    }
  });

export const taxonomySnapshotSchema = z.strictObject({
  schema_version: z.literal(1),
  snapshot_id: z.string(),
  provider: z.literal("GBIF Species Match API"),
  endpoint: z.url(),
  queried_on: z.iso.date(),
  query: z.strictObject({
    taxon_id: z.string(),
    scientific_name: z.string(),
  }),
  match: z.strictObject({
    usage_key: z.number().int().positive(),
    scientific_name: z.string(),
    canonical_name: z.string(),
    rank: z.string(),
    status: z.string(),
    confidence: z.number().min(0).max(100),
    match_type: z.string(),
    kingdom: z.string(),
    phylum: z.string(),
    class: z.string(),
    order: z.string(),
    family: z.string(),
    genus: z.string(),
    species: z.string(),
  }),
  review: z.strictObject({
    state: z.enum(["pending", "accepted", "rejected"]),
    reviewed_on: z.union([z.iso.date(), z.literal("")]),
    notes: z.string(),
  }),
});

function measurementStatusSchema() {
  return z.enum(["measured", "approximate", "not_recorded", "not_applicable"]);
}

function datePrecisionSchema() {
  return z.enum(["year", "month", "day", "unknown"]);
}

function observationStatusSchema() {
  return z.enum(["yes", "no", "not_recorded"]);
}

export type RawTaxon = z.infer<typeof rawTaxonSchema>;
export type RawSpecimen = z.infer<typeof rawSpecimenSchema>;
export type MediaSource = z.infer<typeof mediaSourceSchema>;
export type ComparisonReferenceSource = z.infer<
  typeof comparisonReferenceSourceSchema
>;
export type TaxonomySnapshot = z.infer<typeof taxonomySnapshotSchema>;
