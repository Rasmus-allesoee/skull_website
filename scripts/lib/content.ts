import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { compileCollection } from "../../src/domain/content/compiler";
import { parseStrictCsv } from "../../src/domain/content/csv";
import { parseProfile } from "../../src/domain/content/profile";
import {
  mediaSourceSchema,
  rawSpecimenSchema,
  rawTaxonSchema,
  specimenHeaders,
  taxonHeaders,
  taxonomySnapshotSchema,
} from "../../src/domain/content/schemas";
import type {
  CompiledCollection,
  Diagnostic,
} from "../../src/domain/content/types";
import {
  formatDiagnostics,
  ValidationError,
} from "../../src/domain/content/types";
import { buildCatalogSearchArtifact } from "../../src/domain/search/documents";
import { buildMapProjection } from "../../src/domain/map/projection";
import type { MeasurementReference } from "../../src/domain/methodology/types";
import type { HomeMediaManifest } from "../../src/domain/home/types";
import { validatePublicMedia } from "./media";
import { loadHomeMedia } from "./home-media";
import { loadMeasurementReference } from "./measurements";
import { fromRepositoryRoot } from "./paths";

export interface ContentBuildResult {
  collection: CompiledCollection;
  searchDocumentCount: number;
  mapRecordCount: number;
  mappedRecordCount: number;
  measurementReference: MeasurementReference;
  measurementMediaBytes: number;
  homeMedia: HomeMediaManifest;
  warnings: Diagnostic[];
}

export async function buildContent(options?: {
  writeArtifact?: boolean;
}): Promise<ContentBuildResult> {
  const taxonPath = fromRepositoryRoot("content", "taxa", "taxa.csv");
  const specimenPath = fromRepositoryRoot(
    "content",
    "specimens",
    "specimens.csv",
  );
  const taxa = parseStrictCsv({
    text: await readFile(taxonPath, "utf8"),
    source: "content/taxa/taxa.csv",
    headers: taxonHeaders,
    schema: rawTaxonSchema,
  });
  const specimens = parseStrictCsv({
    text: await readFile(specimenPath, "utf8"),
    source: "content/specimens/specimens.csv",
    headers: specimenHeaders,
    schema: rawSpecimenSchema,
  });
  const profiles = await loadProfiles();
  const mediaSources = await loadValidatedJsonDirectory(
    "content/media",
    mediaSourceSchema,
  );
  const taxonomySnapshots = await loadValidatedJsonDirectory(
    "content/taxonomy/snapshots",
    taxonomySnapshotSchema,
  );
  const { assets, comparisonReferences } = await validatePublicMedia({
    writeManifest: true,
  });
  const {
    reference: measurementReference,
    publicMediaBytes: measurementMediaBytes,
  } = await loadMeasurementReference();
  const homeMedia = await loadHomeMedia();
  const result = compileCollection({
    taxa,
    specimens,
    profiles,
    media: assets,
    mediaSources,
    comparisonReferences,
    taxonomySnapshots,
  });
  const searchArtifact = buildCatalogSearchArtifact(result.collection);
  const mapProjection = buildMapProjection(result.collection);

  if (options?.writeArtifact) {
    const generatedDirectory = fromRepositoryRoot(".generated");
    const publicGeneratedDirectory = fromRepositoryRoot("public", "generated");
    await mkdir(generatedDirectory, { recursive: true });
    await mkdir(publicGeneratedDirectory, { recursive: true });
    await writeFile(
      path.join(generatedDirectory, "collection.json"),
      `${JSON.stringify(result.collection, null, 2)}\n`,
      "utf8",
    );
    const serializedSearchArtifact = `${JSON.stringify(searchArtifact, null, 2)}\n`;
    await writeFile(
      path.join(generatedDirectory, "search-documents.json"),
      serializedSearchArtifact,
      "utf8",
    );
    await writeFile(
      path.join(publicGeneratedDirectory, "catalog-search-v1.json"),
      serializedSearchArtifact,
      "utf8",
    );
    await writeFile(
      path.join(generatedDirectory, "map-records-v2.json"),
      `${JSON.stringify(mapProjection, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(generatedDirectory, "measurement-reference-v1.json"),
      `${JSON.stringify(measurementReference, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(generatedDirectory, "home-media-v1.json"),
      `${JSON.stringify(homeMedia, null, 2)}\n`,
      "utf8",
    );
  }

  return {
    ...result,
    searchDocumentCount: searchArtifact.documents.length,
    mapRecordCount: mapProjection.records.length,
    mappedRecordCount: mapProjection.geoJson.features.length,
    measurementReference,
    measurementMediaBytes,
    homeMedia,
  };
}

async function loadProfiles() {
  const directory = fromRepositoryRoot("content", "profiles");
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".mdx"))
    .sort();
  return Promise.all(
    files.map(async (file) =>
      parseProfile(
        await readFile(path.join(directory, file), "utf8"),
        `content/profiles/${file}`,
      ),
    ),
  );
}

async function loadValidatedJsonDirectory<T>(
  relativeDirectory: string,
  schema: {
    safeParse: (input: unknown) =>
      | { success: true; data: T }
      | {
          success: false;
          error: { issues: { path: PropertyKey[]; message: string }[] };
        };
  },
): Promise<T[]> {
  const directory = fromRepositoryRoot(relativeDirectory);
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const diagnostics: Diagnostic[] = [];
  const values: T[] = [];

  for (const file of files) {
    const source = `${relativeDirectory}/${file}`;
    let json: unknown;
    try {
      json = JSON.parse(await readFile(path.join(directory, file), "utf8"));
    } catch (error) {
      diagnostics.push({
        source,
        rule: error instanceof Error ? error.message : "Invalid JSON",
        suggestion: "Correct the JSON syntax and retry.",
      });
      continue;
    }
    const result = schema.safeParse(json);
    if (result.success) {
      values.push(result.data);
    } else {
      for (const issue of result.error.issues) {
        diagnostics.push({
          source,
          field: issue.path.map(String).join("."),
          rule: issue.message,
          suggestion: "Use the documented reviewed source schema.",
        });
      }
    }
  }

  if (diagnostics.length > 0) {
    throw new ValidationError("JSON source validation failed", diagnostics);
  }
  return values;
}

export function printContentError(error: unknown): never {
  if (error instanceof ValidationError) {
    console.error(formatDiagnostics(error.diagnostics));
    process.exit(1);
  }
  throw error;
}
