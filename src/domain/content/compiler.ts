import type { ParsedRow } from "./csv";
import type {
  MediaSource,
  RawSpecimen,
  RawTaxon,
  TaxonomySnapshot,
} from "./schemas";
import type {
  CompiledCollection,
  Diagnostic,
  Measurement,
  MeasurementKey,
  MeasurementStatus,
  MeasurementUnit,
  MediaAsset,
  PartialDate,
  SpecimenRecord,
  TaxonProfile,
  TaxonRecord,
} from "./types";
import { canonicalViews, ValidationError } from "./types";

export interface CompilationInput {
  taxa: ParsedRow<RawTaxon>[];
  specimens: ParsedRow<RawSpecimen>[];
  profiles: TaxonProfile[];
  media: MediaAsset[];
  mediaSources: MediaSource[];
  taxonomySnapshots: TaxonomySnapshot[];
}

export interface CompilationResult {
  collection: CompiledCollection;
  warnings: Diagnostic[];
}

const taxonIdPattern = /^TAX-\d{4,}$/;
const specimenIdPattern = /^SPEC-\d{4,}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function compileCollection(input: CompilationInput): CompilationResult {
  const diagnostics: Diagnostic[] = [];
  const warnings: Diagnostic[] = [];
  const taxa = input.taxa.map((row) => transformTaxon(row, diagnostics));
  const specimens = input.specimens.map((row) =>
    transformSpecimen(row, diagnostics),
  );

  validateUniqueValues(
    taxa,
    (taxon) => taxon.taxonId,
    "content/taxa/taxa.csv",
    "taxon_id",
    diagnostics,
  );
  validateUniqueValues(
    taxa,
    (taxon) => taxon.slug,
    "content/taxa/taxa.csv",
    "slug",
    diagnostics,
  );
  validateUniqueValues(
    specimens,
    (specimen) => specimen.specimenId,
    "content/specimens/specimens.csv",
    "specimen_id",
    diagnostics,
  );

  const taxaById = new Map(taxa.map((taxon) => [taxon.taxonId, taxon]));
  const specimensById = new Map(
    specimens.map((specimen) => [specimen.specimenId, specimen]),
  );
  const profilesByTaxon = new Map(
    input.profiles.map((profile) => [profile.taxonId, profile]),
  );
  const mediaSourcesBySpecimen = new Map(
    input.mediaSources.map((source) => [source.specimen_id, source]),
  );
  const snapshotsById = new Map(
    input.taxonomySnapshots.map((snapshot) => [snapshot.snapshot_id, snapshot]),
  );

  for (const taxon of taxa) {
    const source = "content/taxa/taxa.csv";
    const defaultSpecimen = specimensById.get(taxon.defaultSpecimenId);

    if (taxon.publicationStatus === "published") {
      if (!defaultSpecimen) {
        diagnostics.push({
          source,
          key: taxon.taxonId,
          field: "default_specimen_id",
          value: taxon.defaultSpecimenId,
          rule: "Published taxon default specimen does not exist",
          suggestion:
            "Link one existing published specimen from the same taxon.",
        });
      } else if (
        defaultSpecimen.taxonId !== taxon.taxonId ||
        defaultSpecimen.publicationStatus !== "published"
      ) {
        diagnostics.push({
          source,
          key: taxon.taxonId,
          field: "default_specimen_id",
          value: taxon.defaultSpecimenId,
          rule: "Published taxon default must be a published specimen linked back to the same taxon",
          suggestion:
            "Correct the taxon link or select a valid published default.",
        });
      }

      const profile = profilesByTaxon.get(taxon.taxonId);
      if (!profile || profile.reviewStatus !== "reviewed") {
        diagnostics.push({
          source: `content/profiles/${taxon.taxonId}.mdx`,
          key: taxon.taxonId,
          rule: "Phase 2 published taxon requires a reviewed cited profile",
          suggestion: "Add and review the taxon profile before publication.",
        });
      }

      if (!taxon.taxonomySnapshotId) {
        diagnostics.push({
          source,
          key: taxon.taxonId,
          field: "taxonomy_snapshot_id",
          rule: "Published taxon has no reviewed taxonomy snapshot",
          suggestion: "Run taxonomy:refresh and accept the reviewed snapshot.",
        });
      } else {
        validateTaxonomySnapshot(
          taxon,
          snapshotsById.get(taxon.taxonomySnapshotId),
          diagnostics,
        );
      }
    }
  }

  for (const specimen of specimens) {
    const source = "content/specimens/specimens.csv";
    const taxon = taxaById.get(specimen.taxonId);
    if (!taxon) {
      diagnostics.push({
        source,
        key: specimen.specimenId,
        field: "taxon_id",
        value: specimen.taxonId,
        rule: "Specimen links to a missing taxon",
        suggestion: "Use an existing stable taxon ID.",
      });
      continue;
    }

    if (
      specimen.publicationStatus === "published" &&
      taxon.publicationStatus !== "published"
    ) {
      diagnostics.push({
        source,
        key: specimen.specimenId,
        field: "publication_status",
        rule: "Published specimen links to an unpublished taxon",
        suggestion:
          "Publish the reviewed taxon or keep the specimen in review.",
      });
    }

    const assets = input.media.filter(
      (asset) => asset.specimenId === specimen.specimenId,
    );
    const mediaSource = mediaSourcesBySpecimen.get(specimen.specimenId);
    if (specimen.publicationStatus === "published") {
      if (!assets.some((asset) => asset.view === "lateral")) {
        diagnostics.push({
          source,
          key: specimen.specimenId,
          field: "media",
          rule: "Published specimen is missing the required lateral asset",
          suggestion: "Process a canonical lateral PNG into a public WebP.",
        });
      }
      if (!mediaSource) {
        diagnostics.push({
          source: `content/media/${specimen.specimenId}.json`,
          key: specimen.specimenId,
          rule: "Published specimen is missing curated media metadata",
          suggestion: "Add alt text for every canonical asset.",
        });
      }
    }

    const missingViews = canonicalViews.filter(
      (view) => !assets.some((asset) => asset.view === view),
    );
    if (missingViews.length > 0 && assets.length > 0) {
      warnings.push({
        source,
        key: specimen.specimenId,
        field: "media",
        value: missingViews,
        rule: "Optional canonical views are missing",
        suggestion:
          "Add them when available; the exhibit will show an incomplete state.",
      });
    }
  }

  const currentSlugs = new Set(taxa.map((taxon) => taxon.slug));
  const previousSlugs = new Set<string>();
  for (const taxon of taxa) {
    for (const previousSlug of taxon.previousSlugs) {
      if (currentSlugs.has(previousSlug) || previousSlugs.has(previousSlug)) {
        diagnostics.push({
          source: "content/taxa/taxa.csv",
          key: taxon.taxonId,
          field: "previous_slugs",
          value: previousSlug,
          rule: "Previous slug collides with a current or previous slug",
          suggestion: "Use a unique explicit redirect alias.",
        });
      }
      previousSlugs.add(previousSlug);
    }
  }

  for (const profile of input.profiles) {
    if (!taxaById.has(profile.taxonId)) {
      diagnostics.push({
        source: `content/profiles/${profile.taxonId}.mdx`,
        key: profile.taxonId,
        rule: "Profile links to a missing taxon",
        suggestion:
          "Correct the stable taxon ID or remove the orphaned profile.",
      });
    }
  }

  for (const asset of input.media) {
    if (!specimensById.has(asset.specimenId)) {
      diagnostics.push({
        source: asset.publicPath,
        key: asset.specimenId,
        rule: "Media asset links to a missing specimen",
        suggestion:
          "Correct the immutable specimen ID and reprocess the asset.",
      });
    }
  }
  validateUniqueValues(
    input.media,
    (asset) => `${asset.specimenId}:${asset.view}`,
    ".generated/media-manifest.json",
    "specimen_id + view",
    diagnostics,
  );

  if (diagnostics.length > 0) {
    throw new ValidationError("Collection compilation failed", diagnostics);
  }

  return {
    collection: {
      schemaVersion: 1,
      taxa: taxa.sort((a, b) => a.taxonId.localeCompare(b.taxonId)),
      specimens: specimens.sort((a, b) =>
        a.specimenId.localeCompare(b.specimenId),
      ),
      media: [...input.media].sort(
        (a, b) =>
          a.specimenId.localeCompare(b.specimenId) ||
          canonicalViews.indexOf(a.view) - canonicalViews.indexOf(b.view),
      ),
      profiles: [...input.profiles].sort((a, b) =>
        a.taxonId.localeCompare(b.taxonId),
      ),
    },
    warnings,
  };
}

function transformTaxon(
  row: ParsedRow<RawTaxon>,
  diagnostics: Diagnostic[],
): TaxonRecord {
  const raw = row.data;
  validatePattern(raw.taxon_id, taxonIdPattern, row, "taxon_id", diagnostics);
  validatePattern(raw.slug, slugPattern, row, "slug", diagnostics);
  validatePattern(raw.class_slug, slugPattern, row, "class_slug", diagnostics);
  validatePattern(raw.genus_slug, slugPattern, row, "genus_slug", diagnostics);
  validatePairedFields(
    raw.order_name,
    raw.order_slug,
    row,
    "order",
    diagnostics,
  );
  validatePairedFields(
    raw.family_name,
    raw.family_slug,
    row,
    "family",
    diagnostics,
  );
  if (raw.order_slug) {
    validatePattern(
      raw.order_slug,
      slugPattern,
      row,
      "order_slug",
      diagnostics,
    );
  }
  if (raw.family_slug) {
    validatePattern(
      raw.family_slug,
      slugPattern,
      row,
      "family_slug",
      diagnostics,
    );
  }

  for (const field of [
    "taxon_id",
    "slug",
    "scientific_name",
    "class_name",
    "class_slug",
    "genus_name",
    "genus_slug",
    "default_specimen_id",
  ] as const) {
    requireValue(raw[field], row, field, diagnostics);
  }
  validatePattern(
    raw.default_specimen_id,
    specimenIdPattern,
    row,
    "default_specimen_id",
    diagnostics,
  );

  if (raw.taxon_rank === "genus" && raw.identification_qualifier !== "sp") {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: raw.taxon_id,
      field: "identification_qualifier",
      value: raw.identification_qualifier,
      rule: "Genus-level exhibit taxa must use the 'sp' qualifier",
      suggestion: "Use sp or provide a supported species-level identification.",
    });
  }

  if (raw.taxonomic_status !== "not_checked") {
    requireIsoDate(
      raw.taxonomy_checked_on,
      row,
      "taxonomy_checked_on",
      diagnostics,
    );
    requireValue(
      raw.taxonomy_snapshot_id,
      row,
      "taxonomy_snapshot_id",
      diagnostics,
    );
  }

  const gbifTaxonKey = parseOptionalNumber(
    raw.gbif_taxon_key,
    row,
    "gbif_taxon_key",
    diagnostics,
    { integer: true, positive: true },
  );
  const publishedOn = parseOptionalIsoDate(
    raw.published_on,
    row,
    "published_on",
    diagnostics,
  );
  const updatedOn = parseOptionalIsoDate(
    raw.updated_on,
    row,
    "updated_on",
    diagnostics,
  );
  validatePublicText(raw.english_name, row, "english_name", diagnostics);
  validatePublicText(raw.danish_name, row, "danish_name", diagnostics);

  return {
    taxonId: raw.taxon_id,
    slug: raw.slug,
    scientificName: raw.scientific_name,
    rank: raw.taxon_rank,
    identificationQualifier: raw.identification_qualifier,
    identificationConfidence: raw.identification_confidence,
    taxonomicStatus: raw.taxonomic_status,
    names: {
      english: nullable(raw.english_name),
      danish: nullable(raw.danish_name),
      aliases: parseList(raw.aliases),
    },
    hierarchy: {
      className: raw.class_name,
      classSlug: raw.class_slug,
      orderName: nullable(raw.order_name),
      orderSlug: nullable(raw.order_slug),
      familyName: nullable(raw.family_name),
      familySlug: nullable(raw.family_slug),
      genusName: raw.genus_name,
      genusSlug: raw.genus_slug,
    },
    externalIds: {
      gbifTaxonKey,
      catalogueOfLifeTaxonId: nullable(raw.col_taxon_id),
    },
    taxonomyCheckedOn: nullable(raw.taxonomy_checked_on),
    taxonomySnapshotId: nullable(raw.taxonomy_snapshot_id),
    defaultSpecimenId: raw.default_specimen_id,
    previousSlugs: parseList(raw.previous_slugs),
    publicationStatus: raw.publication_status,
    publishedOn,
    updatedOn,
  };
}

function transformSpecimen(
  row: ParsedRow<RawSpecimen>,
  diagnostics: Diagnostic[],
): SpecimenRecord {
  const raw = row.data;
  validatePattern(
    raw.specimen_id,
    specimenIdPattern,
    row,
    "specimen_id",
    diagnostics,
  );
  validatePattern(raw.taxon_id, taxonIdPattern, row, "taxon_id", diagnostics);

  for (const field of [
    "specimen_id",
    "taxon_id",
    "owner_credit",
    "specimen_credit",
    "media_credit",
  ] as const) {
    requireValue(raw[field], row, field, diagnostics);
  }

  for (const field of [
    "distinguishing_features",
    "age_detail",
    "location_label",
    "collector_credit",
    "owner_credit",
    "collection_history",
    "preparation_notes",
    "specimen_credit",
    "media_credit",
    "public_notes",
  ] as const) {
    validatePublicText(raw[field], row, field, diagnostics);
  }

  const latitude = parseOptionalNumber(
    raw.latitude,
    row,
    "latitude",
    diagnostics,
  );
  const longitude = parseOptionalNumber(
    raw.longitude,
    row,
    "longitude",
    diagnostics,
  );
  const uncertaintyM = parseOptionalNumber(
    raw.coordinate_uncertainty_m,
    row,
    "coordinate_uncertainty_m",
    diagnostics,
    { nonNegative: true },
  );
  validateCoordinates(raw, latitude, longitude, uncertaintyM, row, diagnostics);

  if (raw.country_code && !/^[A-Z]{2}$/.test(raw.country_code)) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: raw.specimen_id,
      field: "country_code",
      value: raw.country_code,
      rule: "Country code must be blank or ISO 3166-1 alpha-2 uppercase",
      suggestion: "Use a two-letter code such as DK.",
    });
  }

  const acquisitionDate = parsePartialDate(
    raw.acquisition_date,
    raw.acquisition_date_precision,
    row,
    "acquisition_date",
    diagnostics,
  );
  const photographedOn = parsePartialDate(
    raw.photographed_on,
    raw.photographed_on_precision,
    row,
    "photographed_on",
    diagnostics,
  );
  const uploadedOn = parseOptionalIsoDate(
    raw.uploaded_on,
    row,
    "uploaded_on",
    diagnostics,
  );

  const measurements: Record<MeasurementKey, Measurement> = {
    bodyMass: parseMeasurement(
      raw.body_mass_g,
      raw.body_mass_g_status,
      "g",
      row,
      "body_mass_g",
      diagnostics,
    ),
    skullLength: parseMeasurement(
      raw.skull_length_mm,
      raw.skull_length_mm_status,
      "mm",
      row,
      "skull_length_mm",
      diagnostics,
    ),
    condylobasalLength: parseMeasurement(
      raw.condylobasal_length_mm,
      raw.condylobasal_length_mm_status,
      "mm",
      row,
      "condylobasal_length_mm",
      diagnostics,
    ),
    skullWidth: parseMeasurement(
      raw.skull_width_mm,
      raw.skull_width_mm_status,
      "mm",
      row,
      "skull_width_mm",
      diagnostics,
    ),
    skullHeight: parseMeasurement(
      raw.skull_height_mm,
      raw.skull_height_mm_status,
      "mm",
      row,
      "skull_height_mm",
      diagnostics,
    ),
    skullMass: parseMeasurement(
      raw.skull_mass_g,
      raw.skull_mass_g_status,
      "g",
      row,
      "skull_mass_g",
      diagnostics,
    ),
    craniumWidth: parseMeasurement(
      raw.cranium_width_mm,
      raw.cranium_width_mm_status,
      "mm",
      row,
      "cranium_width_mm",
      diagnostics,
    ),
    mandibleLength: parseMeasurement(
      raw.mandible_length_mm,
      raw.mandible_length_mm_status,
      "mm",
      row,
      "mandible_length_mm",
      diagnostics,
    ),
    mandibularToothRowLength: parseMeasurement(
      raw.mandibular_tooth_row_length_mm,
      raw.mandibular_tooth_row_length_mm_status,
      "mm",
      row,
      "mandibular_tooth_row_length_mm",
      diagnostics,
    ),
    mandibleRamusHeight: parseMeasurement(
      raw.mandible_ramus_height_mm,
      raw.mandible_ramus_height_mm_status,
      "mm",
      row,
      "mandible_ramus_height_mm",
      diagnostics,
    ),
    mandibleBodyHeight: parseMeasurement(
      raw.mandible_body_height_mm,
      raw.mandible_body_height_mm_status,
      "mm",
      row,
      "mandible_body_height_mm",
      diagnostics,
    ),
    maxillaryCanineLength: parseMeasurement(
      raw.maxillary_canine_length_mm,
      raw.maxillary_canine_length_mm_status,
      "mm",
      row,
      "maxillary_canine_length_mm",
      diagnostics,
    ),
    mandibularCanineLength: parseMeasurement(
      raw.mandibular_canine_length_mm,
      raw.mandibular_canine_length_mm_status,
      "mm",
      row,
      "mandibular_canine_length_mm",
      diagnostics,
    ),
  };

  const defleshingMethods = parseControlledList(
    raw.defleshing_method,
    [
      "maceration",
      "dermestid_beetles",
      "simmering",
      "manual",
      "natural",
      "other",
      "not_recorded",
    ],
    row,
    "defleshing_method",
    diagnostics,
  );
  const degreasingAgents = parseControlledList(
    raw.degreasing_agents,
    ["dish_soap", "ammonia", "acetone", "other", "none", "not_recorded"],
    row,
    "degreasing_agents",
    diagnostics,
  );
  const whiteningMethods = parseControlledList(
    raw.whitening_method,
    ["hydrogen_peroxide", "none", "other", "not_recorded"],
    row,
    "whitening_method",
    diagnostics,
  );

  return {
    specimenId: raw.specimen_id,
    taxonId: raw.taxon_id,
    publicationStatus: raw.publication_status,
    isTypeOrReferenceSpecimen: raw.is_type_or_reference_specimen === "true",
    condition: raw.condition,
    distinguishingFeatures: nullable(raw.distinguishing_features),
    sex: raw.sex,
    ageClass: raw.age_class,
    ageDetail: nullable(raw.age_detail),
    acquisitionSource: raw.acquisition_source,
    acquisitionDate,
    location: {
      label: nullable(raw.location_label),
      countryCode: nullable(raw.country_code),
      latitude,
      longitude,
      precision: raw.coordinate_precision,
      uncertaintyM,
    },
    collectorCredit: nullable(raw.collector_credit),
    ownerCredit: raw.owner_credit,
    collectionHistory: nullable(raw.collection_history),
    preparation: {
      defleshing: {
        method: defleshingMethods,
        duration: parseMeasurement(
          raw.defleshing_duration_days,
          raw.defleshing_duration_days_status,
          "days",
          row,
          "defleshing_duration_days",
          diagnostics,
        ),
      },
      degreasing: {
        method: degreasingAgents,
        duration: parseMeasurement(
          raw.degreasing_duration_days,
          raw.degreasing_duration_days_status,
          "days",
          row,
          "degreasing_duration_days",
          diagnostics,
        ),
      },
      whitening: {
        method: whiteningMethods,
        duration: parseMeasurement(
          raw.whitening_duration_hours,
          raw.whitening_duration_hours_status,
          "hours",
          row,
          "whitening_duration_hours",
          diagnostics,
        ),
        hydrogenPeroxidePercent: parseMeasurement(
          raw.hydrogen_peroxide_percent,
          raw.hydrogen_peroxide_percent_status,
          "percent",
          row,
          "hydrogen_peroxide_percent",
          diagnostics,
        ),
      },
      notes: nullable(raw.preparation_notes),
    },
    photographedOn,
    uploadedOn,
    measurements,
    rights: {
      specimenCredit: raw.specimen_credit,
      dataRights: raw.data_rights,
      mediaCredit: raw.media_credit,
      mediaRights: raw.media_rights,
    },
    publicNotes: nullable(raw.public_notes),
    sourceReferences: parseList(raw.source_references),
  };
}

function validateTaxonomySnapshot(
  taxon: TaxonRecord,
  snapshot: TaxonomySnapshot | undefined,
  diagnostics: Diagnostic[],
) {
  const source = taxon.taxonomySnapshotId
    ? `content/taxonomy/snapshots/${taxon.taxonomySnapshotId}.json`
    : "content/taxonomy/snapshots";
  if (!snapshot) {
    diagnostics.push({
      source,
      key: taxon.taxonId,
      rule: "Referenced taxonomy snapshot does not exist",
      suggestion: "Create the exact snapshot or correct taxonomy_snapshot_id.",
    });
    return;
  }

  const requiresReview =
    classifyTaxonomyMatch(snapshot.match) !== "exact_accepted";
  if (snapshot.review.state !== "accepted") {
    diagnostics.push({
      source,
      key: taxon.taxonId,
      field: "review.state",
      value: snapshot.review.state,
      rule: "Published taxonomy snapshot has not been accepted",
      suggestion:
        "Review the match and record an accepted or rejected decision.",
    });
  }
  if (snapshot.query.taxon_id !== taxon.taxonId) {
    diagnostics.push({
      source,
      key: taxon.taxonId,
      field: "query.taxon_id",
      value: snapshot.query.taxon_id,
      rule: "Taxonomy snapshot belongs to a different local taxon",
      suggestion: "Refresh taxonomy for the correct immutable ID.",
    });
  }
  if (
    snapshot.match.canonical_name !== taxon.scientificName ||
    snapshot.match.class !== taxon.hierarchy.className ||
    snapshot.match.order !== taxon.hierarchy.orderName ||
    snapshot.match.family !== taxon.hierarchy.familyName ||
    snapshot.match.genus !== taxon.hierarchy.genusName
  ) {
    diagnostics.push({
      source,
      key: taxon.taxonId,
      field: "match",
      rule: "Reviewed taxonomy snapshot conflicts with the curated record",
      suggestion:
        "Resolve the hierarchy deliberately; never rewrite it silently.",
    });
  }
  if (requiresReview && !snapshot.review.notes.trim()) {
    diagnostics.push({
      source,
      key: taxon.taxonId,
      field: "review.notes",
      rule: "Non-exact taxonomy outcome needs a documented review rationale",
      suggestion:
        "Record why the fuzzy, synonym, conflict, or rank outcome is accepted.",
    });
  }
}

export function classifyTaxonomyMatch(match: {
  match_type: string;
  status: string;
  rank: string;
  confidence: number;
}): "exact_accepted" | "requires_review" {
  return match.match_type === "EXACT" &&
    match.status === "ACCEPTED" &&
    match.rank === "SPECIES" &&
    match.confidence >= 95
    ? "exact_accepted"
    : "requires_review";
}

function parseMeasurement(
  rawValue: string,
  status: MeasurementStatus,
  unit: MeasurementUnit,
  row: ParsedRow<RawSpecimen>,
  field: string,
  diagnostics: Diagnostic[],
): Measurement {
  if (status === "not_recorded" || status === "not_applicable") {
    if (rawValue !== "") {
      diagnostics.push({
        source: row.source,
        row: row.row,
        key: row.data.specimen_id,
        field,
        value: rawValue,
        rule: `${status} measurement must not contain a numeric value`,
        suggestion: "Clear the value or use measured/approximate status.",
      });
    }
    return { status, value: null, unit };
  }

  const value = Number(rawValue);
  if (rawValue === "" || !Number.isFinite(value) || value < 0) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: row.data.specimen_id,
      field,
      value: rawValue,
      rule: `${status} measurement requires a finite non-negative number`,
      suggestion: "Supply a decimal value or use an explicit missing status.",
    });
    return { status, value: 0, unit };
  }

  return { status, value, unit };
}

function parsePartialDate(
  value: string,
  precision: "year" | "month" | "day" | "unknown",
  row: ParsedRow<RawSpecimen>,
  field: string,
  diagnostics: Diagnostic[],
): PartialDate {
  if (precision === "unknown") {
    if (value !== "") {
      diagnostics.push({
        source: row.source,
        row: row.row,
        key: row.data.specimen_id,
        field,
        value,
        rule: "Unknown date precision requires an empty date",
        suggestion: "Clear the date or provide the matching precision.",
      });
    }
    return { value: null, precision };
  }

  const patterns = {
    year: /^\d{4}$/,
    month: /^\d{4}-(0[1-9]|1[0-2])$/,
    day: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  } as const;
  if (
    !patterns[precision].test(value) ||
    !isRealPartialDate(value, precision)
  ) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: row.data.specimen_id,
      field,
      value,
      rule: `Date does not match real ${precision} precision`,
      suggestion: "Use YYYY, YYYY-MM, YYYY-MM-DD, or blank with unknown.",
    });
  }

  return { value, precision };
}

function isRealPartialDate(value: string, precision: "year" | "month" | "day") {
  if (precision !== "day") return true;
  const [year = 0, month = 0, day = 0] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateCoordinates(
  raw: RawSpecimen,
  latitude: number | null,
  longitude: number | null,
  uncertaintyM: number | null,
  row: ParsedRow<RawSpecimen>,
  diagnostics: Diagnostic[],
) {
  const hasCoordinates = latitude !== null || longitude !== null;
  if ((latitude === null) !== (longitude === null)) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: raw.specimen_id,
      field: "latitude/longitude",
      rule: "Latitude and longitude must be supplied together",
      suggestion: "Provide both coordinates or clear both.",
    });
  }
  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: raw.specimen_id,
      field: "latitude",
      value: latitude,
      rule: "Latitude is outside -90 to 90",
      suggestion: "Correct the WGS84 latitude.",
    });
  }
  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: raw.specimen_id,
      field: "longitude",
      value: longitude,
      rule: "Longitude is outside -180 to 180",
      suggestion: "Correct the WGS84 longitude.",
    });
  }
  if (
    raw.coordinate_precision === "unknown" &&
    (hasCoordinates || uncertaintyM)
  ) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: raw.specimen_id,
      field: "coordinate_precision",
      rule: "Unknown coordinate precision cannot publish a point or uncertainty",
      suggestion: "Clear coordinates or choose exact/approximate explicitly.",
    });
  }
  if (raw.coordinate_precision !== "unknown" && !hasCoordinates) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      key: raw.specimen_id,
      field: "coordinate_precision",
      rule: "Exact or approximate precision requires a coordinate pair",
      suggestion: "Provide reviewed coordinates or use unknown.",
    });
  }
}

function validatePattern<T>(
  value: string,
  pattern: RegExp,
  row: ParsedRow<T>,
  field: string,
  diagnostics: Diagnostic[],
) {
  if (!pattern.test(value)) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      field,
      value,
      rule: "Value does not match the stable identifier/slug format",
      suggestion: "Use the documented ASCII ID or lower-case slug format.",
    });
  }
}

function validatePairedFields<T>(
  name: string,
  slug: string,
  row: ParsedRow<T>,
  label: string,
  diagnostics: Diagnostic[],
) {
  if (Boolean(name) !== Boolean(slug)) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      field: `${label}_name/${label}_slug`,
      value: { name, slug },
      rule: "Taxonomic rank name and slug must be supplied together",
      suggestion: "Fill both fields or leave both empty.",
    });
  }
}

function requireValue<T>(
  value: string,
  row: ParsedRow<T>,
  field: string,
  diagnostics: Diagnostic[],
) {
  if (!value) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      field,
      rule: "Required value is empty",
      suggestion: "Supply the reviewed value before publication.",
    });
  }
}

function requireIsoDate<T>(
  value: string,
  row: ParsedRow<T>,
  field: string,
  diagnostics: Diagnostic[],
) {
  requireValue(value, row, field, diagnostics);
  parseOptionalIsoDate(value, row, field, diagnostics);
}

function parseOptionalIsoDate<T>(
  value: string,
  row: ParsedRow<T>,
  field: string,
  diagnostics: Diagnostic[],
): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !isRealPartialDate(value, "day")) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      field,
      value,
      rule: "Date must be a real ISO calendar date",
      suggestion: "Use YYYY-MM-DD without inventing missing precision.",
    });
  }
  return value;
}

function parseOptionalNumber<T>(
  value: string,
  row: ParsedRow<T>,
  field: string,
  diagnostics: Diagnostic[],
  options: {
    integer?: boolean;
    positive?: boolean;
    nonNegative?: boolean;
  } = {},
): number | null {
  if (!value) return null;
  const number = Number(value);
  const invalid =
    !Number.isFinite(number) ||
    (options.integer === true && !Number.isInteger(number)) ||
    (options.positive === true && number <= 0) ||
    (options.nonNegative === true && number < 0);
  if (invalid) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      field,
      value,
      rule: "Numeric field has an invalid value",
      suggestion: "Use a finite decimal that satisfies the documented range.",
    });
    return null;
  }
  return number;
}

function validatePublicText<T>(
  value: string,
  row: ParsedRow<T>,
  field: string,
  diagnostics: Diagnostic[],
) {
  if (
    /^[=+@]/.test(value) ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)
  ) {
    diagnostics.push({
      source: row.source,
      row: row.row,
      field,
      value,
      rule: "Public text contains a formula prefix or forbidden control character",
      suggestion: "Replace it with reviewed plain public text.",
    });
  }
}

function parseControlledList<T>(
  value: string,
  allowed: readonly string[],
  row: ParsedRow<T>,
  field: string,
  diagnostics: Diagnostic[],
): string[] {
  const items = parseList(value);
  for (const item of items) {
    if (!allowed.includes(item)) {
      diagnostics.push({
        source: row.source,
        row: row.row,
        field,
        value: item,
        rule: "List contains an unknown controlled value",
        suggestion: `Use one of: ${allowed.join(", ")}.`,
      });
    }
  }
  return items;
}

function validateUniqueValues<T>(
  records: T[],
  getValue: (record: T) => string,
  source: string,
  field: string,
  diagnostics: Diagnostic[],
) {
  const seen = new Set<string>();
  for (const record of records) {
    const value = getValue(record);
    if (seen.has(value)) {
      diagnostics.push({
        source,
        field,
        value,
        rule: "Value must be unique",
        suggestion:
          "Assign a distinct stable value; never reuse an existing ID.",
      });
    }
    seen.add(value);
  }
}

function parseList(value: string): string[] {
  return value
    ? value
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function nullable(value: string): string | null {
  return value || null;
}
