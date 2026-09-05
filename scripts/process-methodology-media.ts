import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { measurementSourceMapSchema } from "./lib/measurement-source-map";
import { loadMeasurementReference } from "./lib/measurements";
import { fromRepositoryRoot } from "./lib/paths";

const sourceMapPath = fromRepositoryRoot(
  "scripts",
  "measurement-methodology-source-map.json",
);

try {
  const config = measurementSourceMapSchema.parse(
    JSON.parse(await readFile(sourceMapPath, "utf8")),
  );
  for (const entry of config.entries) {
    const inputPath = fromRepositoryRoot(config.source_root, entry.raw_file);
    const outputPath = fromRepositoryRoot(entry.public_file);
    const metadata = await sharp(inputPath, { failOn: "error" }).metadata();
    if (
      metadata.format !== "png" ||
      !metadata.hasAlpha ||
      !metadata.width ||
      !metadata.height
    ) {
      throw new Error(
        `${entry.raw_file}: source must be a readable transparent PNG with dimensions.`,
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
      `${entry.raw_file} -> ${entry.public_file} (${(outputStats.size / 1024).toFixed(0)} KiB)`,
    );
  }
  const { reference, publicMediaBytes } = await loadMeasurementReference();
  console.log(
    `Validated ${reference.diagrams.length} methodology derivatives (${(publicMediaBytes / 1024 / 1024).toFixed(1)} MiB); transparency, sRGB, aspect ratio, and stripped metadata confirmed.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
