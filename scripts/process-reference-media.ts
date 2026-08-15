import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import { z } from "zod";

import { validatePublicMedia } from "./lib/media";
import { fromRepositoryRoot } from "./lib/paths";

const sourceMapSchema = z.strictObject({
  schema_version: z.literal(1),
  source_root: z.string().min(1),
  entries: z.array(
    z.strictObject({
      reference_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      source_file: z.string().min(1),
      public_file: z
        .string()
        .regex(/^public\/media\/references\/[a-z0-9-]+\.webp$/),
    }),
  ),
});

const sourceMapPath = fromRepositoryRoot(
  "scripts",
  "phase-2-comparison-reference-source-map.json",
);

try {
  const config = sourceMapSchema.parse(
    JSON.parse(await readFile(sourceMapPath, "utf8")),
  );
  for (const entry of config.entries) {
    const expectedPublicFile = `public/media/references/${entry.reference_id}.webp`;
    if (entry.public_file !== expectedPublicFile) {
      throw new Error(
        `${entry.reference_id}: public file must be ${expectedPublicFile}.`,
      );
    }

    const inputPath = fromRepositoryRoot(config.source_root, entry.source_file);
    const outputPath = fromRepositoryRoot(entry.public_file);
    const inputMetadata = await sharp(inputPath, {
      failOn: "error",
    }).metadata();
    if (
      inputMetadata.format !== "png" ||
      !inputMetadata.hasAlpha ||
      !inputMetadata.width ||
      !inputMetadata.height
    ) {
      throw new Error(
        `${entry.source_file}: source must be a readable transparent PNG with dimensions.`,
      );
    }
    if (Math.max(inputMetadata.width, inputMetadata.height) < 1200) {
      throw new Error(
        `${entry.source_file}: source is below the 1200 px minimum dimension.`,
      );
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(inputPath, { failOn: "error" })
      .rotate()
      .toColourspace("srgb")
      .resize({
        width: 3200,
        height: 3200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    console.log(
      `${entry.source_file} -> ${entry.public_file} (${(outputStats.size / 1024).toFixed(0)} KiB)`,
    );
  }

  const result = await validatePublicMedia({ writeManifest: true });
  console.log(
    `Validated ${result.comparisonReferences.length} comparison reference and ${result.assets.length} specimen assets; transparency, sRGB, subject bounds, and stripped metadata confirmed.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
