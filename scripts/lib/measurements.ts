import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { parseStrictCsv } from "../../src/domain/content/csv";
import type { Diagnostic } from "../../src/domain/content/types";
import { ValidationError } from "../../src/domain/content/types";
import {
  compileMeasurementReference,
  measurementDefinitionHeaders,
  measurementDefinitionRowSchema,
  measurementReferenceSourceSchema,
} from "../../src/domain/methodology/measurements";
import type { MeasurementReference } from "../../src/domain/methodology/types";
import { fromRepositoryRoot } from "./paths";

const publicMediaDirectory = fromRepositoryRoot(
  "public",
  "media",
  "methodology",
);

export async function loadMeasurementReference(): Promise<{
  reference: MeasurementReference;
  publicMediaBytes: number;
}> {
  const definitionSource = "content/methodology/measurement-definitions.csv";
  const referenceSource = "content/methodology/measurement-reference.json";
  const definitions = parseStrictCsv({
    text: await readFile(
      fromRepositoryRoot(...definitionSource.split("/")),
      "utf8",
    ),
    source: definitionSource,
    headers: measurementDefinitionHeaders,
    schema: measurementDefinitionRowSchema,
  });
  let sourceJson: unknown;
  try {
    sourceJson = JSON.parse(
      await readFile(fromRepositoryRoot(...referenceSource.split("/")), "utf8"),
    );
  } catch (error) {
    throw new ValidationError("Measurement reference source failed", [
      {
        source: referenceSource,
        rule:
          error instanceof Error
            ? error.message
            : "Measurement reference JSON is unreadable",
        suggestion: "Restore valid canonical JSON and retry.",
      },
    ]);
  }
  const sourceResult = measurementReferenceSourceSchema.safeParse(sourceJson);
  if (!sourceResult.success) {
    throw new ValidationError(
      "Measurement reference source failed",
      sourceResult.error.issues.map((issue) => ({
        source: referenceSource,
        field: issue.path.map(String).join("."),
        rule: issue.message,
        suggestion:
          "Use the documented measurement reference schema and registered source coordinates.",
      })),
    );
  }
  const source = sourceResult.data;
  const reference = compileMeasurementReference({ definitions, source });
  const diagnostics: Diagnostic[] = [];
  const expectedFiles = new Set<string>();
  let publicMediaBytes = 0;

  for (const diagram of reference.diagrams) {
    const relativePath = path.join(
      "public",
      ...diagram.publicPath.slice(1).split("/"),
    );
    expectedFiles.add(relativePath);
    const absolutePath = fromRepositoryRoot(relativePath);
    try {
      const [metadata, fileStats] = await Promise.all([
        sharp(absolutePath, { failOn: "error" }).metadata(),
        stat(absolutePath),
      ]);
      publicMediaBytes += fileStats.size;
      if (
        metadata.format !== "webp" ||
        !metadata.width ||
        !metadata.height ||
        !metadata.hasAlpha
      ) {
        diagnostics.push({
          source: relativePath,
          key: diagram.id,
          field: "media",
          rule: "Methodology media must be a readable transparent WebP",
          suggestion:
            "Run pnpm media:process:methodology from the reviewed raw PNG.",
        });
        continue;
      }
      const longestEdge = Math.max(metadata.width, metadata.height);
      if (longestEdge < 1200 || longestEdge > 3200) {
        diagnostics.push({
          source: relativePath,
          field: "dimensions",
          value: `${metadata.width}x${metadata.height}`,
          rule: "Methodology derivatives must be 1200–3200 px on their longest edge",
          suggestion:
            "Regenerate the web-ready derivative with the methodology media command.",
        });
      }
      const sourceRatio = diagram.coordinateWidth / diagram.coordinateHeight;
      const publicRatio = metadata.width / metadata.height;
      if (Math.abs(sourceRatio - publicRatio) > 0.001) {
        diagnostics.push({
          source: relativePath,
          field: "aspect_ratio",
          value: `${metadata.width}x${metadata.height}`,
          rule: "Public derivative aspect ratio must preserve the registered source canvas",
          suggestion:
            "Resize with fit inside and without cropping or stretching.",
        });
      }
      if (metadata.space !== "srgb") {
        diagnostics.push({
          source: relativePath,
          field: "colour_space",
          value: metadata.space,
          rule: "Methodology derivatives must be normalized to sRGB",
          suggestion: "Run the Sharp methodology media processor again.",
        });
      }
      if (metadata.exif || metadata.iptc || metadata.xmp) {
        diagnostics.push({
          source: relativePath,
          field: "metadata",
          rule: "EXIF, IPTC, or XMP metadata remains embedded",
          suggestion: "Strip metadata with the methodology media processor.",
        });
      }
      if (fileStats.size > 5 * 1024 * 1024) {
        diagnostics.push({
          source: relativePath,
          field: "bytes",
          value: fileStats.size,
          rule: "Methodology derivative exceeds the 5 MB per-image budget",
          suggestion: "Review lossless framing and WebP compression.",
        });
      }
    } catch (error) {
      diagnostics.push({
        source: relativePath,
        key: diagram.id,
        field: "media",
        rule:
          error instanceof Error
            ? error.message
            : "Declared methodology derivative is unavailable",
        suggestion:
          "Run pnpm media:process:methodology from the reviewed raw PNG.",
      });
    }
  }

  try {
    for (const file of await readdir(publicMediaDirectory)) {
      if (!file.endsWith(".webp")) continue;
      const relativePath = path.join("public", "media", "methodology", file);
      if (!expectedFiles.has(relativePath)) {
        diagnostics.push({
          source: relativePath,
          rule: "Public methodology media is not declared by the canonical reference source",
          suggestion:
            "Declare the reviewed image or remove the orphan derivative.",
        });
      }
    }
  } catch (error) {
    diagnostics.push({
      source: "public/media/methodology",
      rule:
        error instanceof Error
          ? error.message
          : "Methodology media directory is unavailable",
      suggestion: "Run pnpm media:process:methodology.",
    });
  }

  if (diagnostics.length > 0) {
    throw new ValidationError(
      "Measurement media validation failed",
      diagnostics,
    );
  }
  return { reference, publicMediaBytes };
}
