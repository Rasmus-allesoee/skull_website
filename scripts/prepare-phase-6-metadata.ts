import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";

import { specimenHeaders } from "../src/domain/content/schemas";
import { buildContent } from "./lib/content";
import { fromRepositoryRoot } from "./lib/paths";

await import("./audit-phase-6-migration");

type CsvRow = Record<string, string> & {
  specimen_id: string;
  species_name: string;
  class: string;
  is_type_or_reference_specimen: string;
  condition: string;
  sex: string;
  teeth_completeness: string;
  skeleton_completeness: string;
  body_mass_g: string;
  body_mass_g_status: string;
  acquisition_source: string;
  acquisition_date: string;
  acquisition_date_precision: string;
  country_code: string;
  latitude: string;
  longitude: string;
  coordinate_precision: string;
  coordinate_uncertainty_m: string;
  owner_credit: string;
  collection_history: string;
  defleshing_method: string;
  defleshing_duration_days: string;
  degreasing_agents: string;
  degreasing_duration_days: string;
  whitening_method: string;
  whitening_duration_days: string;
  whitening_duration_hours_status: string;
  preparation_notes: string;
};

interface PublishedMapping {
  raw_key: string;
  canonical_specimen_id: string;
  distinguishing_features: string | null;
  age_class: string;
  age_detail: string | null;
  location_label: string;
  body_mass_g?: string;
  trauma_description?: string;
}

interface MigrationConfig {
  specimens: { published: PublishedMapping[] };
}

interface MeasurementField {
  field: string;
  profiles: readonly ("mammal" | "bird")[];
}

const measurementFields: readonly MeasurementField[] = [
  { field: "skull_length_mm", profiles: ["mammal", "bird"] },
  { field: "condylobasal_length_mm", profiles: ["mammal"] },
  { field: "skull_width_mm", profiles: ["mammal"] },
  { field: "skull_height_mm", profiles: ["mammal"] },
  { field: "skull_mass_g", profiles: ["mammal", "bird"] },
  { field: "cranium_width_mm", profiles: ["mammal", "bird"] },
  { field: "cranium_height_mm", profiles: ["bird"] },
  { field: "rostrum_width_mm", profiles: ["mammal"] },
  { field: "interorbital_width_mm", profiles: ["mammal", "bird"] },
  { field: "postorbital_width_mm", profiles: ["mammal"] },
  { field: "orbital_width_mm", profiles: ["bird"] },
  { field: "bill_length_mm", profiles: ["bird"] },
  { field: "bill_width_mm", profiles: ["bird"] },
  { field: "bill_height_mm", profiles: ["bird"] },
  { field: "mandible_length_mm", profiles: ["mammal", "bird"] },
  { field: "maxillary_tooth_row_length_mm", profiles: ["mammal"] },
  { field: "mandibular_tooth_row_length_mm", profiles: ["mammal"] },
  { field: "mandible_ramus_height_mm", profiles: ["mammal"] },
  { field: "mandible_body_height_mm", profiles: ["mammal"] },
  { field: "maxillary_canine_length_mm", profiles: ["mammal"] },
  { field: "mandibular_canine_length_mm", profiles: ["mammal"] },
];

const config = JSON.parse(
  await readFile(
    fromRepositoryRoot("scripts/phase-6-migration-audit.json"),
    "utf8",
  ),
) as MigrationConfig;

function parseCsv(text: string): CsvRow[] {
  return parse(text, {
    bom: true,
    columns: true,
    relax_column_count: false,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];
}

const rawSpecimenText = await readFile(
  fromRepositoryRoot("agent_context/metadata_csv/specimens_raw.csv"),
  "utf8",
);
const rawSpecimens = parseCsv(
  rawSpecimenText.slice(rawSpecimenText.indexOf("\n") + 1),
);
const rawBirdMeasurements = parseCsv(
  await readFile(
    fromRepositoryRoot(
      "agent_context/metadata_csv/specimens_birds_measurements_raw.csv",
    ),
    "utf8",
  ),
);
const canonicalPath = fromRepositoryRoot("content/specimens/specimens.csv");
const canonicalSpecimens = parseCsv(await readFile(canonicalPath, "utf8"));

function rawKey(row: CsvRow): string {
  return `${row.species_name}#${row.specimen_id}`;
}

const rawByKey = new Map(
  rawSpecimens.map((row) => [rawKey(row), row] as const),
);
const birdMeasurementsByKey = new Map(
  rawBirdMeasurements.map((row) => [rawKey(row), row] as const),
);
const mappingBySpecimenId = new Map(
  config.specimens.published.map(
    (mapping) => [mapping.canonical_specimen_id, mapping] as const,
  ),
);

function normalizeSex(value: string): string {
  return { F: "female", M: "male" }[value] ?? "not_recorded";
}

function normalizeCondition(value: string): string {
  return value === "perfect" ? "excellent" : value || "not_recorded";
}

function normalizeAcquisition(value: string): string {
  const normalized: Record<string, string> = {
    "Beach washup": "beach_washup",
    Cat: "other",
    Nature: "found_remains",
    Roadkill: "roadkill",
    Shed: "found_remains",
    Shot: "hunting",
    hunting: "hunting",
  };
  const result = normalized[value];
  if (!result) throw new Error(`Unsupported acquisition source: ${value}`);
  return result;
}

function normalizeDefleshing(value: string): string {
  if (value === "Maceration") return "maceration";
  if (value === "burial") return "burial";
  throw new Error(`Unsupported published defleshing method: ${value}`);
}

function normalizeDegreasing(value: string): string {
  if (!value) return "not_recorded";
  if (
    value === "dish_soap;ammonia" ||
    value === "Mix of soaps + ammonia" ||
    value === "Cheap clear soap + Ammonia"
  ) {
    return "dish_soap;ammonia";
  }
  throw new Error(`Unsupported published degreasing method: ${value}`);
}

function normalizeDate(
  value: string,
  declaredPrecision: string,
): { value: string; precision: string } {
  if (!value) return { value: "", precision: "unknown" };
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) throw new Error(`Unsupported raw date: ${value}`);
  const [, day, month, year] = match;
  if (declaredPrecision === "month") {
    return { value: `${year}-${month}`, precision: "month" };
  }
  if (day === "01" && month === "01") {
    return { value: year!, precision: "year" };
  }
  if (day === "01") {
    return { value: `${year}-${month}`, precision: "month" };
  }
  return { value: `${year}-${month}-${day}`, precision: "day" };
}

function normalizeDuration(value: string): { value: string; status: string } {
  if (!value) return { value: "", status: "not_recorded" };
  const match = /^(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)?$/i.exec(
    value,
  );
  if (!match) throw new Error(`Unsupported duration: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "days";
  if (unit.startsWith("week")) {
    return { value: String(amount * 7), status: "approximate" };
  }
  if (unit.startsWith("month")) {
    return { value: String(amount * 30), status: "approximate" };
  }
  return { value: String(amount), status: "measured" };
}

function normalizeMissingTeeth(
  value: string,
  profile: "mammal" | "bird",
): string {
  if (profile === "bird" || value === "") return "";
  const missing = Number(value);
  if (!Number.isInteger(missing) || missing < 0) {
    throw new Error(`Invalid missing-teeth count: ${value}`);
  }
  return String(missing);
}

function positiveNumber(value: string): string | null {
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : null;
}

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

const proposed = canonicalSpecimens.map((canonical) => {
  const mapping = mappingBySpecimenId.get(canonical.specimen_id);
  if (!mapping) return canonical;
  const raw = rawByKey.get(mapping.raw_key);
  if (!raw) throw new Error(`Missing raw specimen ${mapping.raw_key}.`);
  const profile = raw.class === "bird" ? "bird" : "mammal";
  const measurements =
    profile === "bird" ? birdMeasurementsByKey.get(mapping.raw_key) : raw;
  if (!measurements) {
    throw new Error(`Missing bird measurements for ${mapping.raw_key}.`);
  }

  const next: CsvRow = { ...canonical };
  next.species_name = raw.species_name;
  next.specimen_id_raw = raw.specimen_id;
  next.is_type_or_reference_specimen =
    canonical.is_type_or_reference_specimen.toLowerCase();
  next.condition = normalizeCondition(raw.condition);
  next.distinguishing_features = mapping.distinguishing_features ?? "";
  next.sex = normalizeSex(raw.sex);
  next.age_class = mapping.age_class;
  next.age_detail = mapping.age_detail ?? "";
  next.pathology_status = "not_recorded";
  next.pathology_description = "";
  next.trauma_status = mapping.trauma_description ? "yes" : "not_recorded";
  next.trauma_description = mapping.trauma_description ?? "";
  next.missing_teeth_count = normalizeMissingTeeth(
    raw.teeth_completeness,
    profile,
  );
  next.skeleton_completeness =
    raw.skeleton_completeness === "yes" ? "full" : "none";
  next.body_mass_g = mapping.body_mass_g ?? canonical.body_mass_g;
  next.body_mass_g_status = next.body_mass_g
    ? canonical.body_mass_g_status === "approximate"
      ? "approximate"
      : "measured"
    : "not_recorded";
  next.acquisition_source = normalizeAcquisition(raw.acquisition_source);

  const acquisitionDate = normalizeDate(
    raw.acquisition_date,
    raw.acquisition_date_precision,
  );
  next.acquisition_date = acquisitionDate.value;
  next.acquisition_date_precision = acquisitionDate.precision;
  next.location_label = mapping.location_label;
  next.country_code = raw.country_code;
  next.latitude = raw.latitude;
  next.longitude = raw.longitude;
  next.coordinate_precision =
    raw.coordinate_precision ||
    (Number(raw.coordinate_uncertainty_m) > 0 ? "approximate" : "exact");
  next.coordinate_uncertainty_m = raw.coordinate_uncertainty_m;
  next.owner_credit = raw.owner_credit || canonical.owner_credit;
  next.collection_history =
    raw.collection_history || canonical.collection_history;
  next.defleshing_method = normalizeDefleshing(raw.defleshing_method);

  const defleshingDuration = normalizeDuration(raw.defleshing_duration_days);
  next.defleshing_duration_days = defleshingDuration.value;
  next.defleshing_duration_days_status = defleshingDuration.status;
  next.degreasing_agents = normalizeDegreasing(raw.degreasing_agents);
  const degreasingDuration = normalizeDuration(raw.degreasing_duration_days);
  next.degreasing_duration_days = degreasingDuration.value;
  next.degreasing_duration_days_status = degreasingDuration.status;
  next.whitening_method = raw.whitening_method
    ? "hydrogen_peroxide"
    : canonical.whitening_method;
  next.hydrogen_peroxide_percent = "";
  next.hydrogen_peroxide_percent_status = "not_recorded";
  const whiteningDays = positiveNumber(raw.whitening_duration_days);
  next.whitening_duration_hours = whiteningDays
    ? String(Number(whiteningDays) * 24)
    : "";
  next.whitening_duration_hours_status = whiteningDays
    ? raw.whitening_duration_hours_status || "measured"
    : "not_recorded";
  next.preparation_notes = raw.preparation_notes || "";

  for (const measurement of measurementFields) {
    const statusField = `${measurement.field}_status`;
    if (!measurement.profiles.includes(profile)) {
      next[measurement.field] = "";
      next[statusField] = "not_applicable";
      continue;
    }
    const sourceValue = positiveNumber(measurements[measurement.field] ?? "");
    const preservedValue = positiveNumber(canonical[measurement.field] ?? "");
    const value = sourceValue ?? preservedValue;
    next[measurement.field] = value ?? "";
    next[statusField] = value
      ? !sourceValue && canonical[statusField] === "approximate"
        ? "approximate"
        : "measured"
      : "not_recorded";
  }

  return next;
});

const serialized = `${specimenHeaders.join(",")}\n${proposed
  .map((row) =>
    specimenHeaders.map((header) => escapeCsv(row[header] ?? "")).join(","),
  )
  .join("\n")}\n`;

await buildContent({ specimenSourceText: serialized });

const diffs = proposed.flatMap((row, index) => {
  const before = canonicalSpecimens[index]!;
  return specimenHeaders.flatMap((field) =>
    before[field] === row[field]
      ? []
      : [
          {
            specimenId: row.specimen_id,
            field,
            before: before[field] || null,
            after: row[field] || null,
          },
        ],
  );
});

const generatedDirectory = fromRepositoryRoot(".generated");
await mkdir(generatedDirectory, { recursive: true });
await writeFile(
  path.join(generatedDirectory, "phase-6-proposed-specimens.csv"),
  serialized,
  "utf8",
);
await writeFile(
  path.join(generatedDirectory, "phase-6-metadata-diff.json"),
  `${JSON.stringify({ schemaVersion: 2, changes: diffs }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Prepared an ignored proposal with ${diffs.length} field changes across ${new Set(diffs.map((entry) => entry.specimenId)).size} specimens. Canonical content was not changed.`,
);
