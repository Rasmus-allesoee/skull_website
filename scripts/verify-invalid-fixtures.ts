import { readFile } from "node:fs/promises";

import { compileCollection } from "../src/domain/content/compiler";
import { parseStrictCsv } from "../src/domain/content/csv";
import { parseProfile } from "../src/domain/content/profile";
import {
  mediaSourceSchema,
  rawSpecimenSchema,
  rawTaxonSchema,
  specimenHeaders,
  taxonHeaders,
  taxonomySnapshotSchema,
} from "../src/domain/content/schemas";
import { ValidationError } from "../src/domain/content/types";
import { validatePublicMedia } from "./lib/media";
import { fromRepositoryRoot } from "./lib/paths";

interface Fixture {
  name: string;
  taxon_mutations: Record<string, string>;
  specimen_mutations: Record<string, string>;
  expected_rules: string[];
}

try {
  const fixture = JSON.parse(
    await readFile(
      fromRepositoryRoot("tests/fixtures/content/invalid-records.json"),
      "utf8",
    ),
  ) as Fixture;
  const taxa = parseStrictCsv({
    text: await readFile(fromRepositoryRoot("content/taxa/taxa.csv"), "utf8"),
    source: "tests/fixtures/content/invalid-taxa.csv",
    headers: taxonHeaders,
    schema: rawTaxonSchema,
  });
  const specimens = parseStrictCsv({
    text: await readFile(
      fromRepositoryRoot("content/specimens/specimens.csv"),
      "utf8",
    ),
    source: "tests/fixtures/content/invalid-specimens.csv",
    headers: specimenHeaders,
    schema: rawSpecimenSchema,
  });
  Object.assign(taxa[0]!.data, fixture.taxon_mutations);
  Object.assign(specimens[0]!.data, fixture.specimen_mutations);

  const profile = parseProfile(
    await readFile(fromRepositoryRoot("content/profiles/TAX-0001.mdx"), "utf8"),
    "content/profiles/TAX-0001.mdx",
  );
  const mediaSource = mediaSourceSchema.parse(
    JSON.parse(
      await readFile(
        fromRepositoryRoot("content/media/SPEC-0001.json"),
        "utf8",
      ),
    ),
  );
  const snapshot = taxonomySnapshotSchema.parse(
    JSON.parse(
      await readFile(
        fromRepositoryRoot(
          "content/taxonomy/snapshots/GBIF-2026-08-13-TAX-0001.json",
        ),
        "utf8",
      ),
    ),
  );
  const media = await validatePublicMedia();

  try {
    compileCollection({
      taxa,
      specimens,
      profiles: [profile],
      media: media.assets,
      mediaSources: [mediaSource],
      taxonomySnapshots: [snapshot],
    });
    throw new Error(`${fixture.name}: invalid fixture unexpectedly passed.`);
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    const rules = error.diagnostics.map((diagnostic) => diagnostic.rule);
    const missing = fixture.expected_rules.filter(
      (expected) => !rules.some((rule) => rule.includes(expected)),
    );
    if (missing.length > 0) {
      throw new Error(
        `${fixture.name}: missing expected diagnostics: ${missing.join(", ")}`,
      );
    }
    console.log(
      `Invalid fixture passed: ${fixture.expected_rules.length} actionable failures were detected.`,
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
