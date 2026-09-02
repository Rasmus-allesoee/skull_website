import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { parseStrictCsv } from "../../src/domain/content/csv";
import {
  comparisonReferenceSourceSchema,
  mediaAssetSchema,
  mediaSourceSchema,
  rawSpecimenSchema,
  specimenHeaders,
} from "../../src/domain/content/schemas";
import type {
  ComparisonMeasurementKey,
  ComparisonReferenceRecord,
  Diagnostic,
  Measurement,
  LateralOrientation,
  MediaAsset,
  SubjectBounds,
} from "../../src/domain/content/types";
import {
  canonicalViews,
  comparisonMeasurementKeys,
  formatDiagnostics,
  isMeasurementApplicable,
  ValidationError,
} from "../../src/domain/content/types";
import { fromRepositoryRoot } from "./paths";

const alphaThreshold = 8;
const hitPathGridSize = 64;
const maxDimension = 3200;
const minDimension = 1200;
const maxMasterBytes = 5 * 1024 * 1024;
const mediaReviewBytes = 500 * 1024 * 1024;

export interface MediaValidationResult {
  assets: MediaAsset[];
  comparisonReferences: ComparisonReferenceRecord[];
  totalBytes: number;
}

export async function validatePublicMedia(options?: {
  writeManifest?: boolean;
}): Promise<MediaValidationResult> {
  const diagnostics: Diagnostic[] = [];
  const sourceDirectory = fromRepositoryRoot("content", "media");
  const sourceFiles = (await readdir(sourceDirectory))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const specimenCsvPath = fromRepositoryRoot(
    "content",
    "specimens",
    "specimens.csv",
  );
  const specimenRows = parseStrictCsv({
    text: await readFile(specimenCsvPath, "utf8"),
    source: "content/specimens/specimens.csv",
    headers: specimenHeaders,
    schema: rawSpecimenSchema,
  });
  const specimenRights = new Map(
    specimenRows.map((row) => [
      row.data.specimen_id,
      {
        credit: row.data.media_credit,
        rights: row.data.media_rights,
      },
    ]),
  );

  const assets: MediaAsset[] = [];
  const expectedPublicFiles = new Set<string>();
  for (const sourceFile of sourceFiles) {
    const sourcePath = path.join(sourceDirectory, sourceFile);
    let sourceJson: unknown;
    try {
      sourceJson = JSON.parse(await readFile(sourcePath, "utf8"));
    } catch (error) {
      diagnostics.push({
        source: `content/media/${sourceFile}`,
        rule: error instanceof Error ? error.message : "Invalid JSON",
        suggestion: "Correct the JSON syntax and retry.",
      });
      continue;
    }

    const sourceResult = mediaSourceSchema.safeParse(sourceJson);
    if (!sourceResult.success) {
      for (const issue of sourceResult.error.issues) {
        diagnostics.push({
          source: `content/media/${sourceFile}`,
          field: issue.path.join("."),
          rule: issue.message,
          suggestion: "Use the canonical media metadata schema.",
        });
      }
      continue;
    }

    const mediaSource = sourceResult.data;
    if (sourceFile !== `${mediaSource.specimen_id}.json`) {
      diagnostics.push({
        source: `content/media/${sourceFile}`,
        field: "specimen_id",
        value: mediaSource.specimen_id,
        rule: "Media source filename must equal the immutable specimen ID",
        suggestion: `Rename this source to ${mediaSource.specimen_id}.json.`,
      });
    }

    const duplicateViews = mediaSource.assets
      .map((asset) => asset.view)
      .filter((view, index, views) => views.indexOf(view) !== index);
    if (duplicateViews.length > 0) {
      diagnostics.push({
        source: `content/media/${sourceFile}`,
        field: "assets.view",
        value: duplicateViews,
        rule: "A specimen may have only one asset per canonical view",
        suggestion: "Remove the duplicate view metadata.",
      });
    }

    const rights = specimenRights.get(mediaSource.specimen_id);
    if (!rights?.credit || rights.rights !== "all_rights_reserved") {
      diagnostics.push({
        source: "content/specimens/specimens.csv",
        key: mediaSource.specimen_id,
        field: "media_credit/media_rights",
        rule: "Media credit and rights must be explicit before publication",
        suggestion: "Add reviewed credit and all_rights_reserved rights state.",
      });
      continue;
    }

    for (const sourceAsset of mediaSource.assets) {
      const basename = `${mediaSource.specimen_id}__${sourceAsset.view}.webp`;
      const relativePath = path.join(
        "public",
        "media",
        "specimens",
        mediaSource.specimen_id,
        basename,
      );
      const absolutePath = fromRepositoryRoot(relativePath);
      expectedPublicFiles.add(relativePath);
      const asset = await inspectPublicAsset({
        absolutePath,
        relativePath,
        specimenId: mediaSource.specimen_id,
        view: sourceAsset.view,
        alt: sourceAsset.alt,
        orientation:
          sourceAsset.view === "lateral" ? sourceAsset.orientation : null,
        credit: rights.credit,
        diagnostics,
      });
      if (asset) assets.push(asset);
    }
  }

  const comparisonReferences = await validateComparisonReferences(diagnostics);

  const actualFiles = await listWebpFiles(
    fromRepositoryRoot("public", "media", "specimens"),
  );
  for (const absolutePath of actualFiles) {
    const relativePath = path.relative(fromRepositoryRoot(), absolutePath);
    if (!expectedPublicFiles.has(relativePath)) {
      diagnostics.push({
        source: relativePath,
        rule: "Public specimen media is not declared by a curated source manifest",
        suggestion:
          "Add reviewed media metadata or remove the orphan derivative.",
      });
    }
  }

  const totalBytes =
    assets.reduce((sum, asset) => sum + asset.bytes, 0) +
    comparisonReferences.reduce(
      (sum, reference) => sum + reference.media.bytes,
      0,
    );
  if (totalBytes >= mediaReviewBytes) {
    diagnostics.push({
      source: "public/media",
      value: totalBytes,
      rule: "Committed public media reached the 500 MB architecture review trigger",
      suggestion: "Review CDN/object-store migration before adding more media.",
    });
  }

  if (diagnostics.length > 0) {
    throw new ValidationError("Media validation failed", diagnostics);
  }

  const sortedAssets = assets.sort(
    (a, b) =>
      a.specimenId.localeCompare(b.specimenId) ||
      canonicalViews.indexOf(a.view) - canonicalViews.indexOf(b.view),
  );
  for (const asset of sortedAssets) mediaAssetSchema.parse(asset);

  if (options?.writeManifest) {
    const generatedDirectory = fromRepositoryRoot(".generated");
    await mkdir(generatedDirectory, { recursive: true });
    await writeFile(
      path.join(generatedDirectory, "media-manifest.json"),
      `${JSON.stringify(sortedAssets, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(generatedDirectory, "comparison-reference-manifest.json"),
      `${JSON.stringify(comparisonReferences, null, 2)}\n`,
      "utf8",
    );
  }

  return { assets: sortedAssets, comparisonReferences, totalBytes };
}

async function inspectPublicAsset(options: {
  absolutePath: string;
  relativePath: string;
  specimenId: string;
  view: MediaAsset["view"];
  alt: string;
  orientation: LateralOrientation | null;
  credit: string;
  diagnostics: Diagnostic[];
}): Promise<MediaAsset | null> {
  const {
    absolutePath,
    relativePath,
    specimenId,
    view,
    alt,
    orientation,
    credit,
    diagnostics,
  } = options;
  const inspected = await inspectTransparentWebp({
    absolutePath,
    relativePath,
    key: specimenId,
    diagnostics,
    includeHitPath: true,
    missingSuggestion:
      "Run pnpm media:process from canonical staged PNG inputs.",
  });
  if (!inspected) return null;

  return {
    specimenId,
    view,
    ...inspected,
    orientation,
    alt,
    credit,
    rights: "all_rights_reserved",
  };
}

async function validateComparisonReferences(
  diagnostics: Diagnostic[],
): Promise<ComparisonReferenceRecord[]> {
  const sourceDirectory = fromRepositoryRoot("content", "references");
  let sourceFiles: string[] = [];
  try {
    sourceFiles = (await readdir(sourceDirectory))
      .filter((file) => file.endsWith(".json"))
      .sort();
  } catch {
    diagnostics.push({
      source: "content/references",
      rule: "Comparison-reference source directory is missing",
      suggestion: "Restore the canonical reference configuration directory.",
    });
    return [];
  }

  const records: ComparisonReferenceRecord[] = [];
  const expectedPublicFiles = new Set<string>();
  const seenIds = new Set<string>();

  for (const sourceFile of sourceFiles) {
    const sourceLabel = `content/references/${sourceFile}`;
    let sourceJson: unknown;
    try {
      sourceJson = JSON.parse(
        await readFile(path.join(sourceDirectory, sourceFile), "utf8"),
      );
    } catch (error) {
      diagnostics.push({
        source: sourceLabel,
        rule: error instanceof Error ? error.message : "Invalid JSON",
        suggestion: "Correct the JSON syntax and retry.",
      });
      continue;
    }

    const result = comparisonReferenceSourceSchema.safeParse(sourceJson);
    if (!result.success) {
      for (const issue of result.error.issues) {
        diagnostics.push({
          source: sourceLabel,
          field: issue.path.join("."),
          rule: issue.message,
          suggestion: "Use the canonical comparison-reference schema.",
        });
      }
      continue;
    }

    const source = result.data;
    if (sourceFile !== `${source.reference_id}.json`) {
      diagnostics.push({
        source: sourceLabel,
        field: "reference_id",
        value: source.reference_id,
        rule: "Reference source filename must equal the stable reference ID",
        suggestion: `Rename this source to ${source.reference_id}.json.`,
      });
    }
    if (seenIds.has(source.reference_id)) {
      diagnostics.push({
        source: sourceLabel,
        field: "reference_id",
        value: source.reference_id,
        rule: "Comparison-reference IDs must be unique",
        suggestion: "Use one stable ID for each curated reference.",
      });
      continue;
    }
    seenIds.add(source.reference_id);

    const expectedPath = `/media/references/${source.reference_id}.webp`;
    if (source.asset.public_path !== expectedPath) {
      diagnostics.push({
        source: sourceLabel,
        field: "asset.public_path",
        value: source.asset.public_path,
        rule: "Reference public path must derive from its stable reference ID",
        suggestion: `Use ${expectedPath}.`,
      });
      continue;
    }

    const relativePath = path.join(
      "public",
      ...source.asset.public_path.slice(1).split("/"),
    );
    expectedPublicFiles.add(relativePath);
    const inspected = await inspectTransparentWebp({
      absolutePath: fromRepositoryRoot(relativePath),
      relativePath,
      key: source.reference_id,
      diagnostics,
      missingSuggestion:
        "Run pnpm media:process:reference from the approved staged PNG.",
    });
    if (!inspected) continue;

    const sourceFields: Record<
      ComparisonMeasurementKey,
      keyof typeof source.measurements
    > = {
      skullLength: "skull_length_mm",
      skullWidth: "skull_width_mm",
      skullHeight: "skull_height_mm",
      billLength: "bill_length_mm",
      billWidth: "bill_width_mm",
      billHeight: "bill_height_mm",
      skullMass: "skull_mass_g",
      craniumWidth: "cranium_width_mm",
      craniumHeight: "cranium_height_mm",
      orbitalWidth: "orbital_width_mm",
      mandibleLength: "mandible_length_mm",
    };
    const measurements = Object.fromEntries(
      comparisonMeasurementKeys.map((key) => {
        const unit = key === "skullMass" ? "g" : "mm";
        const value = source.measurements[sourceFields[key]];
        let measurement: Measurement;
        if (!isMeasurementApplicable(key, source.measurement_profile)) {
          measurement = { status: "not_applicable", value: null, unit };
        } else if (value === undefined) {
          measurement = { status: "not_recorded", value: null, unit };
        } else {
          measurement = { status: "approximate", value, unit };
        }
        return [key, measurement];
      }),
    ) as ComparisonReferenceRecord["measurements"];
    records.push({
      referenceId: source.reference_id,
      label: source.label,
      isDefault: source.is_default,
      aliases: source.aliases,
      note: source.note,
      measurementProfile: source.measurement_profile,
      measurements,
      media: {
        ...inspected,
        orientation: source.asset.orientation,
        alt: source.asset.alt,
        credit: source.asset.credit,
        rights: source.asset.rights,
      },
    });
  }

  const actualFiles = await listWebpFiles(
    fromRepositoryRoot("public", "media", "references"),
  );
  for (const absolutePath of actualFiles) {
    const relativePath = path.relative(fromRepositoryRoot(), absolutePath);
    if (!expectedPublicFiles.has(relativePath)) {
      diagnostics.push({
        source: relativePath,
        rule: "Public reference media is not declared by a curated source",
        suggestion: "Add reviewed reference metadata or remove the orphan.",
      });
    }
  }

  const defaultReferences = records.filter((reference) => reference.isDefault);
  if (defaultReferences.length !== 1) {
    diagnostics.push({
      source: "content/references",
      field: "is_default",
      value: defaultReferences.map((reference) => reference.referenceId),
      rule: "Exactly one comparison reference must be the default",
      suggestion: "Mark only the reviewed default reference as is_default.",
    });
  }

  return records.sort((a, b) => a.referenceId.localeCompare(b.referenceId));
}

interface InspectedTransparentWebp {
  width: number;
  height: number;
  bytes: number;
  subjectBounds: SubjectBounds;
  publicPath: string;
  hitPath?: string;
}

async function inspectTransparentWebp(options: {
  absolutePath: string;
  relativePath: string;
  key: string;
  diagnostics: Diagnostic[];
  includeHitPath?: boolean;
  missingSuggestion: string;
}): Promise<InspectedTransparentWebp | null> {
  const {
    absolutePath,
    relativePath,
    key,
    diagnostics,
    includeHitPath = false,
    missingSuggestion,
  } = options;
  let fileStats;
  try {
    fileStats = await stat(absolutePath);
  } catch {
    diagnostics.push({
      source: relativePath,
      key,
      field: "media",
      rule: "Declared public derivative is missing",
      suggestion: missingSuggestion,
    });
    return null;
  }

  try {
    const image = sharp(absolutePath, { failOn: "error" });
    const metadata = await image.metadata();
    if (
      metadata.format !== "webp" ||
      metadata.width === undefined ||
      metadata.height === undefined
    ) {
      diagnostics.push({
        source: relativePath,
        rule: "Public derivative must be a readable WebP with dimensions",
        suggestion: "Reprocess the canonical source PNG with Sharp.",
      });
      return null;
    }
    if (!metadata.hasAlpha) {
      diagnostics.push({
        source: relativePath,
        field: "alpha",
        rule: "Public skull derivative must preserve transparency",
        suggestion: "Export a transparent source and reprocess it.",
      });
    }
    if (
      Math.max(metadata.width, metadata.height) > maxDimension ||
      Math.max(metadata.width, metadata.height) < minDimension
    ) {
      diagnostics.push({
        source: relativePath,
        field: "dimensions",
        value: `${metadata.width}x${metadata.height}`,
        rule: `Public master must be between ${minDimension} and ${maxDimension} px on its longest edge`,
        suggestion:
          "Reprocess from the high-resolution source using the media command.",
      });
    }
    if (metadata.space !== "srgb") {
      diagnostics.push({
        source: relativePath,
        field: "colour_space",
        value: metadata.space,
        rule: "Public derivative pixels must be normalized to sRGB",
        suggestion: "Run the Sharp media processor again.",
      });
    }
    if (metadata.exif || metadata.iptc || metadata.xmp) {
      diagnostics.push({
        source: relativePath,
        field: "metadata",
        rule: "EXIF, GPS-bearing EXIF, IPTC, or XMP metadata remains embedded",
        suggestion: "Strip all metadata during public derivative generation.",
      });
    }
    if (fileStats.size > maxMasterBytes) {
      diagnostics.push({
        source: relativePath,
        field: "bytes",
        value: fileStats.size,
        rule: "Public WebP master exceeds the 5 MB per-asset budget",
        suggestion:
          "Review framing and compression without degrading the exhibit.",
      });
    }

    const { data, info } = await image.ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });
    const alpha = info.channels - 1;
    const corners = [
      alpha,
      (info.width - 1) * info.channels + alpha,
      (info.height - 1) * info.width * info.channels + alpha,
      (info.height * info.width - 1) * info.channels + alpha,
    ];
    if (corners.some((offset) => (data[offset] ?? 255) > alphaThreshold)) {
      diagnostics.push({
        source: relativePath,
        field: "alpha_edges",
        rule: "One or more image corners are not transparent",
        suggestion:
          "Review the cutout edge and transparent canvas before publishing.",
      });
    }
    const subjectBounds = calculateSubjectBounds(
      data,
      info.width,
      info.height,
      info.channels,
    );
    if (!subjectBounds) {
      diagnostics.push({
        source: relativePath,
        field: "subject_bounds",
        rule: "No non-transparent subject pixels were found",
        suggestion: "Use a valid transparent skull cutout.",
      });
      return null;
    }

    return {
      width: metadata.width,
      height: metadata.height,
      bytes: fileStats.size,
      subjectBounds,
      ...(includeHitPath
        ? { hitPath: calculateSubjectHitPath(data, info, subjectBounds) }
        : {}),
      publicPath: `/${relativePath
        .replace(/^public\//, "")
        .split(path.sep)
        .join("/")}`,
    };
  } catch (error) {
    diagnostics.push({
      source: relativePath,
      rule:
        error instanceof Error
          ? error.message
          : "Sharp could not inspect image",
      suggestion: "Reprocess from a valid canonical PNG source.",
    });
    return null;
  }
}

/**
 * Build a compact, normalized SVG path from the alpha mask inside the
 * registered subject bounds. Horizontal cell runs keep transparent gaps
 * transparent, which lets a lower-depth specimen remain reachable through a
 * foreground skull's open anatomy instead of falling behind its rectangle.
 */
function calculateSubjectHitPath(
  data: Uint8Array,
  info: { width: number; height: number; channels: number },
  bounds: SubjectBounds,
): string {
  const occupied = Array.from({ length: hitPathGridSize }, () =>
    Array<boolean>(hitPathGridSize).fill(false),
  );
  const alphaChannel = info.channels - 1;
  const maxX = Math.min(info.width, bounds.x + bounds.width);
  const maxY = Math.min(info.height, bounds.y + bounds.height);

  for (let y = bounds.y; y < maxY; y += 1) {
    for (let x = bounds.x; x < maxX; x += 1) {
      const alpha =
        data[(y * info.width + x) * info.channels + alphaChannel] ?? 0;
      if (alpha <= alphaThreshold) continue;
      const gridX = Math.min(
        hitPathGridSize - 1,
        Math.floor(((x - bounds.x) * hitPathGridSize) / bounds.width),
      );
      const gridY = Math.min(
        hitPathGridSize - 1,
        Math.floor(((y - bounds.y) * hitPathGridSize) / bounds.height),
      );
      occupied[gridY]![gridX] = true;
    }
  }

  const path: string[] = [];
  for (let gridY = 0; gridY < hitPathGridSize; gridY += 1) {
    let runStart = -1;
    for (let gridX = 0; gridX <= hitPathGridSize; gridX += 1) {
      const isOccupied =
        gridX < hitPathGridSize && occupied[gridY]![gridX] === true;
      if (isOccupied && runStart < 0) {
        runStart = gridX;
        continue;
      }
      if (isOccupied || runStart < 0) continue;

      const x0 = (runStart / hitPathGridSize) * 100;
      const x1 = (gridX / hitPathGridSize) * 100;
      const y0 = (gridY / hitPathGridSize) * 100;
      const y1 = ((gridY + 1) / hitPathGridSize) * 100;
      path.push(
        `M${x0.toFixed(2)} ${y0.toFixed(2)}H${x1.toFixed(2)}V${y1.toFixed(2)}H${x0.toFixed(2)}Z`,
      );
      runStart = -1;
    }
  }

  return path.join(" ");
}

export function calculateSubjectBounds(
  data: Uint8Array,
  width: number,
  height: number,
  channels: number,
): SubjectBounds | null {
  const alphaChannel = channels - 1;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * channels + alphaChannel] ?? 0;
      if (alpha <= alphaThreshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return maxX < minX || maxY < minY
    ? null
    : {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      };
}

async function listWebpFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listWebpFiles(item)));
    if (entry.isFile() && entry.name.endsWith(".webp")) files.push(item);
  }
  return files.sort();
}

export function printValidationError(error: unknown): never {
  if (error instanceof ValidationError) {
    console.error(formatDiagnostics(error.diagnostics));
    process.exit(1);
  }
  throw error;
}
