import { readFile, writeFile } from "node:fs/promises";

import { z } from "zod";

import { classifyTaxonomyMatch } from "../src/domain/content/compiler";
import { parseStrictCsv } from "../src/domain/content/csv";
import {
  rawTaxonSchema,
  taxonHeaders,
  taxonomySnapshotSchema,
} from "../src/domain/content/schemas";
import { fromRepositoryRoot } from "./lib/paths";

const responseSchema = z.object({
  usageKey: z.number().int().positive(),
  scientificName: z.string(),
  canonicalName: z.string(),
  rank: z.string(),
  status: z.string(),
  confidence: z.number(),
  matchType: z.string(),
  kingdom: z.string(),
  phylum: z.string(),
  class: z.string(),
  order: z.string(),
  family: z.string(),
  genus: z.string(),
  species: z.string().optional().default(""),
});

const taxonId = readArgument("--taxon-id");
const dryRun = process.argv.includes("--dry-run");
if (!taxonId) {
  console.error(
    "Usage: pnpm taxonomy:refresh -- --taxon-id TAX-0001 [--dry-run]",
  );
  process.exit(1);
}

try {
  const taxa = parseStrictCsv({
    text: await readFile(fromRepositoryRoot("content/taxa/taxa.csv"), "utf8"),
    source: "content/taxa/taxa.csv",
    headers: taxonHeaders,
    schema: rawTaxonSchema,
  });
  const taxon = taxa.find((row) => row.data.taxon_id === taxonId);
  if (!taxon) throw new Error(`No taxon found for ${taxonId}.`);

  const endpoint = "https://api.gbif.org/v1/species/match";
  const url = new URL(endpoint);
  url.searchParams.set("name", taxon.data.scientific_name);
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`GBIF returned ${response.status} ${response.statusText}.`);
  }
  const match = responseSchema.parse(await response.json());
  const date = new Date().toISOString().slice(0, 10);
  const snapshotId = `GBIF-${date}-${taxonId}`;
  const snapshot = taxonomySnapshotSchema.parse({
    schema_version: 1,
    snapshot_id: snapshotId,
    provider: "GBIF Species Match API",
    endpoint,
    queried_on: date,
    query: {
      taxon_id: taxonId,
      scientific_name: taxon.data.scientific_name,
    },
    match: {
      usage_key: match.usageKey,
      scientific_name: match.scientificName,
      canonical_name: match.canonicalName,
      rank: match.rank,
      status: match.status,
      confidence: match.confidence,
      match_type: match.matchType,
      kingdom: match.kingdom,
      phylum: match.phylum,
      class: match.class,
      order: match.order,
      family: match.family,
      genus: match.genus,
      species: match.species,
    },
    review: {
      state: "pending",
      reviewed_on: "",
      notes: "",
    },
  });
  const classification = classifyTaxonomyMatch(snapshot.match);

  if (dryRun) {
    console.log(JSON.stringify(snapshot, null, 2));
    console.log(
      `Dry run: ${classification}; no source file or curated taxon field was changed.`,
    );
  } else {
    const output = fromRepositoryRoot(
      "content",
      "taxonomy",
      "snapshots",
      `${snapshotId}.json`,
    );
    await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    console.log(
      `Wrote pending snapshot ${snapshotId} (${classification}). Review is required before linking or accepting it; taxa.csv was not changed.`,
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

function readArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}
