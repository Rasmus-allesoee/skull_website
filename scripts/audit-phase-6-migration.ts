import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";
import { z } from "zod";

import { fromRepositoryRoot } from "./lib/paths";

const sourceSchema = z.strictObject({
  path: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  expected_records: z.number().int().positive(),
  preamble_lines: z.number().int().nonnegative().optional(),
});

const publishedTaxonSchema = z.strictObject({
  scientific_name: z.string().min(1),
  canonical_taxon_id: z.string().regex(/^TAX-\d{4,}$/),
});

const rejectedTaxonSchema = z.strictObject({
  scientific_name: z.string().min(1),
  reason: z.string().min(1),
});

const publishedSpecimenSchema = z.strictObject({
  raw_key: z.string().min(1),
  canonical_specimen_id: z.string().regex(/^SPEC-\d{4,}$/),
  distinguishing_features: z.string().min(1).nullable(),
  age_class: z.enum([
    "juvenile",
    "subadult",
    "young_adult",
    "adult",
    "old_adult",
    "indeterminate",
    "not_recorded",
  ]),
  age_detail: z.string().min(1).nullable(),
  location_label: z.string().min(1),
  body_mass_g: z
    .string()
    .regex(/^\d+(?:\.\d+)?$/)
    .optional(),
  trauma_description: z.string().min(1).optional(),
});

const rejectedSpecimenSchema = z.strictObject({
  raw_key: z.string().min(1),
  reason: z.string().min(1),
});

const configSchema = z.strictObject({
  schema_version: z.literal(1),
  sources: z.strictObject({
    taxa: sourceSchema,
    specimens: sourceSchema,
    bird_measurements: sourceSchema,
    media: z.strictObject({
      path: z.string().min(1),
      expected_pngs: z.number().int().positive(),
    }),
  }),
  taxa: z.strictObject({
    published: z.array(publishedTaxonSchema),
    deferred_missing_media: z.array(z.string().min(1)),
    rejected: z.array(rejectedTaxonSchema),
  }),
  specimens: z.strictObject({
    published: z.array(publishedSpecimenSchema),
    deferred_missing_media: z.array(z.string().min(1)),
    rejected: z.array(rejectedSpecimenSchema),
  }),
});

type CsvRow = Record<string, string> & {
  scientific_name: string;
  photos: string;
  species_name: string;
  specimen_id: string;
  taxon_id: string;
};

const configPath = fromRepositoryRoot("scripts/phase-6-migration-audit.json");
const config = configSchema.parse(
  JSON.parse(await readFile(configPath, "utf8")),
);

const sourceHashes: Record<string, string> = {};

async function readVerifiedCsv(
  source: z.infer<typeof sourceSchema>,
): Promise<CsvRow[]> {
  const sourcePath = fromRepositoryRoot(source.path);
  const bytes = await readFile(sourcePath);
  const hash = createHash("sha256").update(bytes).digest("hex");
  sourceHashes[source.path] = hash;
  if (hash !== source.sha256) {
    throw new Error(
      `${source.path} does not match the reviewed SHA-256 ${source.sha256}; found ${hash}. Review the new export before changing the audit declaration.`,
    );
  }

  let text = bytes.toString("utf8");
  const preambleLines = source.preamble_lines ?? 0;
  for (let index = 0; index < preambleLines; index += 1) {
    const newline = text.indexOf("\n");
    if (newline < 0) {
      throw new Error(`${source.path} is missing its declared CSV header.`);
    }
    text = text.slice(newline + 1);
  }

  const rows = parse(text, {
    bom: true,
    columns: true,
    relax_column_count: false,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];
  if (rows.length !== source.expected_records) {
    throw new Error(
      `${source.path} contains ${rows.length} records; expected ${source.expected_records}.`,
    );
  }
  return rows;
}

function specimenKey(row: CsvRow): string {
  return `${row.species_name}#${row.specimen_id}`;
}

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  if (duplicates.size > 0) {
    throw new Error(
      `${label} contains duplicates: ${[...duplicates].join(", ")}`,
    );
  }
}

function assertExactCoverage(
  actualValues: string[],
  declaredValues: string[],
  label: string,
): void {
  assertUnique(actualValues, `${label} source`);
  assertUnique(declaredValues, `${label} declaration`);
  const actual = new Set(actualValues);
  const declared = new Set(declaredValues);
  const missing = [...actual].filter((value) => !declared.has(value));
  const unknown = [...declared].filter((value) => !actual.has(value));
  if (missing.length > 0 || unknown.length > 0) {
    throw new Error(
      `${label} disposition is incomplete. Missing: ${missing.join(", ") || "none"}. Unknown: ${unknown.join(", ") || "none"}.`,
    );
  }
}

const [rawTaxa, rawSpecimens, rawBirdMeasurements] = await Promise.all([
  readVerifiedCsv(config.sources.taxa),
  readVerifiedCsv(config.sources.specimens),
  readVerifiedCsv(config.sources.bird_measurements),
]);

const canonicalTaxa = parse(
  await readFile(fromRepositoryRoot("content/taxa/taxa.csv"), "utf8"),
  { bom: true, columns: true, skip_empty_lines: true, trim: true },
) as CsvRow[];
const canonicalSpecimens = parse(
  await readFile(fromRepositoryRoot("content/specimens/specimens.csv"), "utf8"),
  { bom: true, columns: true, skip_empty_lines: true, trim: true },
) as CsvRow[];

const declaredTaxa = [
  ...config.taxa.published.map((entry) => entry.scientific_name),
  ...config.taxa.deferred_missing_media,
  ...config.taxa.rejected.map((entry) => entry.scientific_name),
];
assertExactCoverage(
  rawTaxa.map((row) => row.scientific_name),
  declaredTaxa,
  "Raw taxon",
);

const declaredSpecimens = [
  ...config.specimens.published.map((entry) => entry.raw_key),
  ...config.specimens.deferred_missing_media,
  ...config.specimens.rejected.map((entry) => entry.raw_key),
];
assertExactCoverage(
  rawSpecimens.map(specimenKey),
  declaredSpecimens,
  "Raw specimen",
);

const canonicalTaxaById = new Map(
  canonicalTaxa.map((row) => [row.taxon_id, row]),
);
for (const mapping of config.taxa.published) {
  const canonical = canonicalTaxaById.get(mapping.canonical_taxon_id);
  if (!canonical) {
    throw new Error(`Missing canonical taxon ${mapping.canonical_taxon_id}.`);
  }
  const expectedName = mapping.scientific_name.replace(/ sp\.$/, "");
  if (canonical.scientific_name !== expectedName) {
    throw new Error(
      `${mapping.canonical_taxon_id} is ${canonical.scientific_name}, not ${mapping.scientific_name}.`,
    );
  }
}

const canonicalSpecimensById = new Map(
  canonicalSpecimens.map((row) => [row.specimen_id, row]),
);
assertUnique(
  config.specimens.published.map((entry) => entry.canonical_specimen_id),
  "Published canonical specimen mapping",
);
for (const mapping of config.specimens.published) {
  if (!canonicalSpecimensById.has(mapping.canonical_specimen_id)) {
    throw new Error(
      `Missing canonical specimen ${mapping.canonical_specimen_id}.`,
    );
  }
}

const publishedRawKeys = new Set(
  config.specimens.published.map((entry) => entry.raw_key),
);
const undeclaredPhotographed = rawSpecimens
  .filter((row) => row.photos.toLowerCase() === "yes")
  .map(specimenKey)
  .filter((key) => !publishedRawKeys.has(key));
if (undeclaredPhotographed.length > 0) {
  throw new Error(
    `Photographed raw specimens lack a published mapping: ${undeclaredPhotographed.join(", ")}`,
  );
}

const birdMeasurementKeys = rawBirdMeasurements.map(specimenKey);
assertUnique(birdMeasurementKeys, "Bird measurement rows");
const rawSpecimenKeys = new Set(rawSpecimens.map(specimenKey));
const orphanBirdMeasurements = birdMeasurementKeys.filter(
  (key) => !rawSpecimenKeys.has(key),
);
if (orphanBirdMeasurements.length > 0) {
  throw new Error(
    `Bird measurement rows lack specimen rows: ${orphanBirdMeasurements.join(", ")}`,
  );
}

const mediaRoot = fromRepositoryRoot(config.sources.media.path);
const pngFiles = (await readdir(mediaRoot)).filter((file) =>
  file.toLowerCase().endsWith(".png"),
);
if (pngFiles.length !== config.sources.media.expected_pngs) {
  throw new Error(
    `${config.sources.media.path} contains ${pngFiles.length} PNGs; expected ${config.sources.media.expected_pngs}.`,
  );
}

const mediaMap = JSON.parse(
  await readFile(
    fromRepositoryRoot("scripts/phase-3-1-review-media-source-map.json"),
    "utf8",
  ),
) as { entries: { source_file: string; target_file: string }[] };
if (mediaMap.entries.length !== pngFiles.length) {
  throw new Error(
    `The reviewed media map contains ${mediaMap.entries.length} entries for ${pngFiles.length} PNGs.`,
  );
}
const pngSet = new Set(pngFiles);
const missingMappedSources = mediaMap.entries
  .map((entry) => entry.source_file)
  .filter((file) => !pngSet.has(file));
if (missingMappedSources.length > 0) {
  throw new Error(
    `Reviewed media sources are missing: ${missingMappedSources.join(", ")}`,
  );
}

const mediaTargetsBySpecimen = new Map<string, string[]>();
for (const entry of mediaMap.entries) {
  const specimenId = entry.target_file.split("__")[0]!;
  const targets = mediaTargetsBySpecimen.get(specimenId) ?? [];
  targets.push(entry.target_file);
  mediaTargetsBySpecimen.set(specimenId, targets);
}
for (const mapping of config.specimens.published) {
  const targets =
    mediaTargetsBySpecimen.get(mapping.canonical_specimen_id) ?? [];
  if (!targets.some((target) => target.endsWith("__lateral.png"))) {
    throw new Error(
      `${mapping.canonical_specimen_id} lacks a reviewed lateral media source.`,
    );
  }
}

const audit = {
  schemaVersion: 1,
  auditedOn: "2026-09-08",
  sourceHashes,
  inventory: {
    rawTaxa: rawTaxa.length,
    rawSpecimens: rawSpecimens.length,
    rawBirdMeasurementRows: rawBirdMeasurements.length,
    reviewedPngs: pngFiles.length,
    canonicalTaxa: canonicalTaxa.length,
    canonicalSpecimens: canonicalSpecimens.length,
  },
  dispositions: {
    taxa: {
      published: config.taxa.published.length,
      deferredMissingMedia: config.taxa.deferred_missing_media.length,
      rejected: config.taxa.rejected.length,
    },
    specimens: {
      published: config.specimens.published.length,
      deferredMissingMedia: config.specimens.deferred_missing_media.length,
      rejected: config.specimens.rejected.length,
    },
  },
  publishedMappings: config.specimens.published.map((entry) => ({
    rawKey: entry.raw_key,
    canonicalSpecimenId: entry.canonical_specimen_id,
  })),
  deferredSpecimens: config.specimens.deferred_missing_media,
  rejectedSpecimens: config.specimens.rejected,
};

const generatedDirectory = fromRepositoryRoot(".generated");
await mkdir(generatedDirectory, { recursive: true });
await writeFile(
  path.join(generatedDirectory, "phase-6-migration-audit.json"),
  `${JSON.stringify(audit, null, 2)}\n`,
  "utf8",
);

console.log(
  `Phase 6 source audit passed: ${rawTaxa.length} taxa and ${rawSpecimens.length} specimens accounted for; ${config.specimens.published.length} published mappings, ${config.specimens.deferred_missing_media.length} deferred for missing media, ${config.specimens.rejected.length} rejected; ${pngFiles.length} reviewed PNGs.`,
);
