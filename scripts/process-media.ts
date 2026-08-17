import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { canonicalViews } from "../src/domain/content/types";
import { validatePublicMedia } from "./lib/media";
import { fromRepositoryRoot } from "./lib/paths";

const stagingDirectory = fromRepositoryRoot(".staging", "media");
const inputPattern = new RegExp(
  `^(SPEC-\\d{4,})__(${canonicalViews.join("|")})\\.png$`,
);

try {
  const files = (await readdir(stagingDirectory)).sort();
  const inputFiles = files.filter((file) => file.endsWith(".png"));
  if (inputFiles.length === 0) {
    throw new Error(
      "No canonical staged PNG files found. Run pnpm media:stage:phase2 first.",
    );
  }

  for (const file of inputFiles) {
    const match = inputPattern.exec(file);
    if (!match) {
      throw new Error(
        `${file}: expected {specimen-id}__{canonical-view}.png using an approved view token.`,
      );
    }
    const specimenId = match[1]!;
    const inputPath = path.join(stagingDirectory, file);
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
        `${file}: source must be a readable transparent PNG with dimensions.`,
      );
    }
    if (Math.max(inputMetadata.width, inputMetadata.height) < 1200) {
      throw new Error(
        `${file}: source is below the 1200 px minimum dimension.`,
      );
    }

    const outputDirectory = fromRepositoryRoot(
      "public",
      "media",
      "specimens",
      specimenId,
    );
    const outputPath = path.join(
      outputDirectory,
      file.replace(/\.png$/, ".webp"),
    );
    await mkdir(outputDirectory, { recursive: true });
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
      `${file} -> ${path.relative(fromRepositoryRoot(), outputPath)} (${(outputStats.size / 1024).toFixed(0)} KiB)`,
    );
  }

  const result = await validatePublicMedia({ writeManifest: true });
  console.log(
    `Validated ${result.assets.length} specimen WebP assets plus ${result.comparisonReferences.length} comparison reference (${(result.totalBytes / 1024 / 1024).toFixed(2)} MiB); sRGB, alpha, dimensions, subject bounds, and stripped metadata confirmed.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
