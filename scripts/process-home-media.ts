import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import { z } from "zod";

import { loadHomeMedia } from "./lib/home-media";
import { fromRepositoryRoot } from "./lib/paths";

const sourceMapSchema = z.strictObject({
  schema_version: z.literal(1),
  source_root: z.string().min(1),
  entries: z.array(
    z.strictObject({
      asset_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      source_file: z.string().min(1),
      public_file: z.string().regex(/^public\/media\/home\/[a-z0-9-]+\.webp$/),
    }),
  ),
});

try {
  const sourceMap = sourceMapSchema.parse(
    JSON.parse(
      await readFile(
        fromRepositoryRoot("scripts", "home-media-source-map.json"),
        "utf8",
      ),
    ),
  );

  for (const entry of sourceMap.entries) {
    const expectedPublicFile = `public/media/home/${entry.asset_id}.webp`;
    if (entry.public_file !== expectedPublicFile) {
      throw new Error(
        `${entry.asset_id}: public file must be ${expectedPublicFile}.`,
      );
    }
    const inputPath = fromRepositoryRoot(
      sourceMap.source_root,
      entry.source_file,
    );
    const outputPath = fromRepositoryRoot(entry.public_file);
    const inputMetadata = await sharp(inputPath, {
      failOn: "error",
    }).metadata();
    if (
      !["jpeg", "png"].includes(inputMetadata.format ?? "") ||
      !inputMetadata.width ||
      !inputMetadata.height
    ) {
      throw new Error(
        `${entry.source_file}: source must be a readable JPEG or PNG with dimensions.`,
      );
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(inputPath, { failOn: "error" })
      .rotate()
      .toColourspace("srgb")
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        position: "centre",
        withoutEnlargement: true,
      })
      .webp({ quality: 86, alphaQuality: 100, smartSubsample: true })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    console.log(
      `${entry.source_file} -> ${entry.public_file} (${(outputStats.size / 1024).toFixed(0)} KiB)`,
    );
  }

  const manifest = await loadHomeMedia();
  console.log(
    `Validated ${manifest.assets.length} Home media assets; WebP format and stripped metadata confirmed.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
