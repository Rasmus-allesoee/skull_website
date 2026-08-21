import type {
  ComparisonMeasurementKey,
  Measurement,
  MeasurementProfile,
} from "@/domain/content/types";

import type {
  ComparisonDifferenceRow,
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
  billLength: { smaller: "shorter", larger: "longer", equal: "Same length" },
  billWidth: { smaller: "narrower", larger: "wider", equal: "Same width" },
  billHeight: { smaller: "lower", larger: "higher", equal: "Same height" },
  craniumHeight: {
    smaller: "lower",
    larger: "higher",
    equal: "Same height",
  },
  orbitalWidth: {
    smaller: "narrower",
    larger: "wider",
    equal: "Same width",
  },
};

const mammalRows: ComparisonDifferenceRow[] = [
  row("skullLength", "Max length"),
  row("skullWidth", "Max width"),
  row("skullHeight", "Max height"),
  row("craniumWidth", "Cranium width"),
  row("mandibleLength", "Max mandible length"),
  row("skullMass", "Prepared skull mass"),
];

const birdRows: ComparisonDifferenceRow[] = [
  row("skullLength", "Max length"),
  row("billLength", "Bill length"),
  row("billWidth", "Bill width"),
  row("billHeight", "Bill height"),
  row("craniumWidth", "Cranium width"),
  row("craniumHeight", "Cranium height"),
  row("orbitalWidth", "Orbital width"),
  row("mandibleLength", "Max mandible length"),
  row("skullMass", "Prepared skull mass"),
];

const sharedRows: ComparisonDifferenceRow[] = [
  row("skullLength", "Max length"),
  row("craniumWidth", "Cranium width"),
  row("mandibleLength", "Max mandible length"),
  row("skullMass", "Prepared skull mass"),
];

export function getComparisonDifferenceRows(
  primaryProfile: MeasurementProfile,
  comparisonProfile: MeasurementProfile,
): ComparisonDifferenceRow[] {
  if (primaryProfile === "mammal" && comparisonProfile === "mammal") {
    return mammalRows;
  }
  if (primaryProfile === "bird" && comparisonProfile === "bird") {
    return birdRows;
  }
  if (
    (primaryProfile === "mammal" && comparisonProfile === "bird") ||
    (primaryProfile === "bird" && comparisonProfile === "mammal")
  ) {
    const birdIsPrimary = primaryProfile === "bird";
    return [
      row("skullLength", "Max length"),
      {
        key: "crossWidth",
        label: "Width (orbital ↔ max)",
        primaryKey: birdIsPrimary ? "orbitalWidth" : "skullWidth",
        comparisonKey: birdIsPrimary ? "skullWidth" : "orbitalWidth",
      },
      {
        key: "crossHeight",
        label: "Height (cranium ↔ skull)",
        primaryKey: birdIsPrimary ? "craniumHeight" : "skullHeight",
        comparisonKey: birdIsPrimary ? "skullHeight" : "craniumHeight",
      },
      row("craniumWidth", "Cranium width"),
      row("mandibleLength", "Max mandible length"),
      row("skullMass", "Prepared skull mass"),
    ];
  }
  return sharedRows;
}

export function isCrossClassMeasurementPair(
  primaryProfile: MeasurementProfile,
  comparisonProfile: MeasurementProfile,
): boolean {
  return (
    (primaryProfile === "mammal" && comparisonProfile === "bird") ||
    (primaryProfile === "bird" && comparisonProfile === "mammal")
  );
}

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
  outputKey: string = key,
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
      key: outputKey,
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
      key: outputKey,
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
    key: outputKey,
    direction,
    approximate,
    difference,
    ratio,
    unit,
    text: `${approximationMark}${formatMagnitude(Math.abs(difference))} ${unit} ${directionWords[key][direction]}`,
    ratioText: `${formatRatio(ratio)}×`,
  };
}

function row(
  key: ComparisonMeasurementKey,
  label: string,
): ComparisonDifferenceRow {
  return { key, label, primaryKey: key, comparisonKey: key };
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
