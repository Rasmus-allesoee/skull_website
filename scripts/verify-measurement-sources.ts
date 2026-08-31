import { readFile } from "node:fs/promises";

import sharp from "sharp";

import { measurementReferenceSourceSchema } from "../src/domain/methodology/measurements";
import { measurementSourceMapSchema } from "./lib/measurement-source-map";
import { fromRepositoryRoot } from "./lib/paths";

const config = measurementSourceMapSchema.parse(
  JSON.parse(
    await readFile(
      fromRepositoryRoot("scripts", "measurement-methodology-source-map.json"),
      "utf8",
    ),
  ),
);
const reference = measurementReferenceSourceSchema.parse(
  JSON.parse(
    await readFile(
      fromRepositoryRoot(
        "content",
        "methodology",
        "measurement-reference.json",
      ),
      "utf8",
    ),
  ),
);
const feedbackCriticalExtensionKeys = new Set([
  "lateral-skull:1:0",
  "lateral-skull:1:1",
  "lateral-skull:2:0",
  "mandible-lateral:10:1",
  "mandible-lateral:11:0",
]);

for (const entry of config.entries) {
  const diagram = reference.diagrams.find(
    (candidate) => candidate.id === entry.diagram_id,
  );
  if (!diagram)
    throw new Error(`${entry.diagram_id}: canonical diagram is missing.`);
  const rawPath = fromRepositoryRoot(config.source_root, entry.raw_file);
  const annotatedPath = fromRepositoryRoot(
    config.source_root,
    entry.annotated_file,
  );
  const [raw, annotated] = await Promise.all([
    sharp(rawPath, { failOn: "error" }).ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    }),
    sharp(annotatedPath, { failOn: "error" }).ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    }),
  ]);
  if (
    raw.info.width !== annotated.info.width ||
    raw.info.height !== annotated.info.height ||
    raw.info.width !== diagram.coordinate_width ||
    raw.info.height !== diagram.coordinate_height
  ) {
    throw new Error(
      `${entry.diagram_id}: raw, annotated, and coordinate dimensions must match exactly.`,
    );
  }

  let unchanged = 0;
  let changed = 0;
  for (let offset = 0; offset < raw.data.length; offset += raw.info.channels) {
    const difference = Math.max(
      Math.abs((raw.data[offset] ?? 0) - (annotated.data[offset] ?? 0)),
      Math.abs((raw.data[offset + 1] ?? 0) - (annotated.data[offset + 1] ?? 0)),
      Math.abs((raw.data[offset + 2] ?? 0) - (annotated.data[offset + 2] ?? 0)),
    );
    if (difference <= 8) unchanged += 1;
    else changed += 1;
  }
  const unchangedPercent = (unchanged / (unchanged + changed)) * 100;
  if (unchangedPercent < 97) {
    throw new Error(
      `${entry.diagram_id}: only ${unchangedPercent.toFixed(3)}% of pixels retain identity registration.`,
    );
  }

  for (const occurrence of diagram.occurrences) {
    const primaryCoverage = whiteCoverage(
      annotated.data,
      raw.data,
      annotated.info.width,
      annotated.info.channels,
      occurrence.line,
    );
    if (primaryCoverage < 0.55) {
      throw new Error(
        `${entry.diagram_id}:${occurrence.number}: primary line does not register with the annotation source (${primaryCoverage.toFixed(2)} coverage).`,
      );
    }
    for (const [extensionIndex, extension] of occurrence.extensions.entries()) {
      const extensionKey = `${entry.diagram_id}:${occurrence.number}:${extensionIndex}`;
      if (!feedbackCriticalExtensionKeys.has(extensionKey)) continue;
      const extensionCoverage = whiteCoverage(
        annotated.data,
        raw.data,
        annotated.info.width,
        annotated.info.channels,
        extension,
      );
      if (extensionCoverage < 0.25) {
        throw new Error(
          `${entry.diagram_id}:${occurrence.number}: extension ${extensionIndex + 1} does not register with the annotation source (${extensionCoverage.toFixed(2)} coverage).`,
        );
      }
    }
    const [labelX, labelY] = occurrence.label;
    if (
      redPixelCountNear(
        annotated.data,
        raw.data,
        annotated.info.width,
        annotated.info.height,
        annotated.info.channels,
        labelX,
        labelY,
      ) < 100
    ) {
      throw new Error(
        `${entry.diagram_id}:${occurrence.number}: label point does not register with red source numbering.`,
      );
    }
  }
  console.log(
    `${entry.diagram_id}: ${raw.info.width}x${raw.info.height}, identity transform, ${unchangedPercent.toFixed(3)}% unchanged outside annotation pixels, ${diagram.occurrences.length} overlays registered.`,
  );
}

function whiteCoverage(
  annotated: Buffer,
  raw: Buffer,
  width: number,
  channels: number,
  segment: readonly [number, number, number, number],
) {
  let white = 0;
  const samples = 201;
  for (let index = 0; index < samples; index += 1) {
    const progress = index / (samples - 1);
    const x = Math.round(segment[0] + (segment[2] - segment[0]) * progress);
    const y = Math.round(segment[1] + (segment[3] - segment[1]) * progress);
    let found = false;
    for (let offsetY = -10; offsetY <= 10 && !found; offsetY += 1) {
      for (let offsetX = -10; offsetX <= 10; offsetX += 1) {
        const pixel = ((y + offsetY) * width + x + offsetX) * channels;
        const red = annotated[pixel] ?? 0;
        const green = annotated[pixel + 1] ?? 0;
        const blue = annotated[pixel + 2] ?? 0;
        const difference = Math.max(
          Math.abs(red - (raw[pixel] ?? 0)),
          Math.abs(green - (raw[pixel + 1] ?? 0)),
          Math.abs(blue - (raw[pixel + 2] ?? 0)),
        );
        if (
          difference > 20 &&
          Math.min(red, green, blue) > 180 &&
          Math.max(red, green, blue) - Math.min(red, green, blue) < 45
        ) {
          found = true;
          break;
        }
      }
    }
    if (found) white += 1;
  }
  return white / samples;
}

function redPixelCountNear(
  annotated: Buffer,
  raw: Buffer,
  width: number,
  height: number,
  channels: number,
  centerX: number,
  centerY: number,
) {
  let count = 0;
  for (
    let y = Math.max(0, centerY - 180);
    y <= Math.min(height - 1, centerY + 180);
    y += 3
  ) {
    for (
      let x = Math.max(0, centerX - 180);
      x <= Math.min(width - 1, centerX + 180);
      x += 3
    ) {
      const pixel = (y * width + x) * channels;
      const red = annotated[pixel] ?? 0;
      const green = annotated[pixel + 1] ?? 0;
      const blue = annotated[pixel + 2] ?? 0;
      if (
        Math.max(
          Math.abs(red - (raw[pixel] ?? 0)),
          Math.abs(green - (raw[pixel + 1] ?? 0)),
          Math.abs(blue - (raw[pixel + 2] ?? 0)),
        ) > 20 &&
        red > 160 &&
        red > green * 2 &&
        red > blue * 2
      ) {
        count += 1;
      }
    }
  }
  return count;
}
