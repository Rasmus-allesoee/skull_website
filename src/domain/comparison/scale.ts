import type {
  ComparisonMeasurementKey,
  Measurement,
} from "@/domain/content/types";

import type {
  MeasurementDifference,
  ScalePresentation,
  SkullComparisonRecord,
} from "./types";

const equalityTolerance = 0.05;

const directionWords: Record<
  ComparisonMeasurementKey,
  { smaller: string; larger: string; equal: string }
> = {
  skullLength: { smaller: "shorter", larger: "longer", equal: "Same length" },
  skullWidth: { smaller: "narrower", larger: "wider", equal: "Same width" },
  skullHeight: { smaller: "lower", larger: "higher", equal: "Same height" },
  skullMass: { smaller: "lighter", larger: "heavier", equal: "Same mass" },
  craniumWidth: {
    smaller: "narrower",
    larger: "wider",
    equal: "Same width",
  },
  mandibleLength: {
    smaller: "shorter",
    larger: "longer",
    equal: "Same length",
  },
};

export function getMeasuredValue(measurement: Measurement): number | null {
  return measurement.status === "measured" ||
    measurement.status === "approximate"
    ? measurement.value
    : null;
}

export function getScalePresentation(
  record: SkullComparisonRecord,
  largestLengthMm: number,
  targetOrientation: SkullComparisonRecord["image"]["orientation"],
): ScalePresentation {
  const length = getMeasuredValue(record.measurements.skullLength);
  if (length === null || length <= 0 || largestLengthMm <= 0) {
    throw new Error("A positive maximum skull length is required for scaling.");
  }

  const { subjectBounds, width, height, orientation } = record.image;
  return {
    relativeLengthPercent: (length / largestLengthMm) * 100,
    subjectAspectRatio: subjectBounds.width / subjectBounds.height,
    canvasWidthPercent: (width / subjectBounds.width) * 100,
    canvasHeightPercent: (height / subjectBounds.height) * 100,
    canvasLeftPercent: (-subjectBounds.x / subjectBounds.width) * 100,
    canvasTopPercent: (-subjectBounds.y / subjectBounds.height) * 100,
    flipHorizontally: orientation !== targetOrientation,
  };
}

export function calculateMeasurementDifference(
  key: ComparisonMeasurementKey,
  primary: Measurement,
  comparison: Measurement,
): MeasurementDifference {
  const primaryValue = getMeasuredValue(primary);
  const comparisonValue = getMeasuredValue(comparison);
  const approximate =
    primary.status === "approximate" || comparison.status === "approximate";
  const unit = primary.unit === "g" ? "g" : "mm";

  if (
    primaryValue === null ||
    comparisonValue === null ||
    comparisonValue <= 0 ||
    primary.unit !== comparison.unit
  ) {
    return {
      key,
      direction: "unavailable",
      approximate,
      difference: null,
      ratio: null,
      unit,
      text: "Not recorded",
      ratioText: null,
    };
  }

  const difference = primaryValue - comparisonValue;
  const ratio = primaryValue / comparisonValue;
  if (Math.abs(difference) < equalityTolerance) {
    return {
      key,
      direction: "equal",
      approximate,
      difference: 0,
      ratio,
      unit,
      text: directionWords[key].equal,
      ratioText: "1×",
    };
  }

  const direction = difference > 0 ? "larger" : "smaller";
  const approximationMark = approximate ? "~" : "";
  return {
    key,
    direction,
    approximate,
    difference,
    ratio,
    unit,
    text: `${approximationMark}${formatMagnitude(Math.abs(difference))} ${unit} ${directionWords[key][direction]}`,
    ratioText: `${formatRatio(ratio)}×`,
  };
}

export function comparisonSearchText(record: SkullComparisonRecord): string {
  return [
    record.label,
    record.scientificName,
    record.specimenId,
    ...record.aliases,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("en");
}

function formatMagnitude(value: number): string {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatRatio(value: number): string {
  if (Math.abs(value - 1) < 0.0005) return "1";
  if (value < 1) return value.toFixed(2);
  return Number(value.toFixed(2)).toString();
}
