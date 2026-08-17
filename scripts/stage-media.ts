import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import {
  canonicalViews,
  formatDiagnostics,
  ValidationError,
} from "../src/domain/content/types";
import { fromRepositoryRoot } from "./lib/paths";

const sourceMapSchema = z.strictObject({
  schema_version: z.literal(1),
  source_root: z.string(),
  staging_root: z.string(),
  entries: z.array(
    z.strictObject({
      source_file: z.string().min(1),
      target_file: z
        .string()
        .regex(
          new RegExp(`^SPEC-\\d{4,}__(?:${canonicalViews.join("|")})\\.png$`),
        ),
    }),
  ),
});

const configArgument = process.argv[2];
if (!configArgument) {
  console.error("Usage: tsx scripts/stage-media.ts <source-map.json>");
  process.exit(1);
}

try {
  const configPath = fromRepositoryRoot(configArgument);
  const config = sourceMapSchema.parse(
    JSON.parse(await readFile(configPath, "utf8")),
  );
  const sourceRoot = fromRepositoryRoot(config.source_root);
  const stagingRoot = fromRepositoryRoot(config.staging_root);
  await mkdir(stagingRoot, { recursive: true });

  for (const entry of config.entries) {
    const source = path.join(sourceRoot, entry.source_file);
    const target = path.join(stagingRoot, entry.target_file);
    await stat(source);
    await copyFile(source, target);
    console.log(
      `${entry.source_file} -> ${path.relative(fromRepositoryRoot(), target)}`,
    );
  }
  console.log(`Staged ${config.entries.length} canonical PNG inputs.`);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(formatDiagnostics(error.diagnostics));
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
}
