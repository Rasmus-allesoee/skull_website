import type {
  ComparisonMeasurementKey,
  Measurement,
  MeasurementProfile,
  MeasurementKey,
} from "@/domain/content/types";
import {
  isMeasurementApplicable,
  measurementDefinitions,
  measurementProfileLayouts,
} from "@/domain/content/types";

import type {
  ComparisonDifferenceRow,
  MeasurementDifference,
  ScalePresentation,
  SkullComparisonRecord,
} from "./types";

const equalityTolerance = 0.05;

const directionWords: Record<
  MeasurementKey,
  { smaller: string; larger: string; equal: string }
> = {
  skullLength: { smaller: "shorter", larger: "longer", equal: "Same length" },
  condylobasalLength: {
    smaller: "shorter",
    larger: "longer",
    equal: "Same length",
  },
  maxillaryToothRowLength: {
    smaller: "shorter",
    larger: "longer",
    equal: "Same length",
  },
  mandibularToothRowLength: {
    smaller: "shorter",
    larger: "longer",
    equal: "Same length",
  },
  mandibleRamusHeight: {
    smaller: "lower",
    larger: "higher",
    equal: "Same height",
  },
  mandibleBodyHeight: {
    smaller: "lower",
    larger: "higher",
    equal: "Same height",
  },
  maxillaryCanineLength: {
    smaller: "shorter",
    larger: "longer",
    equal: "Same length",
  },
  mandibularCanineLength: {
    smaller: "shorter",
    larger: "longer",
    equal: "Same length",
  },
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
  bodyMass: { smaller: "lighter", larger: "heavier", equal: "Same mass" },
  interorbitalWidth: {
    smaller: "narrower",
    larger: "wider",
    equal: "Same width",
  },
  rostrumWidth: {
    smaller: "narrower",
    larger: "wider",
    equal: "Same width",
  },
  postorbitalWidth: {
    smaller: "narrower",
    larger: "wider",
    equal: "Same width",
  },
};

const mammalRows: ComparisonDifferenceRow[] = [
  row("skullLength", "Max length", ["mammal"]),
  row("skullWidth", "Max width", ["mammal"]),
  row("skullHeight", "Max height", ["mammal"]),
  row("craniumWidth", "Cranium width", ["mammal"]),
  row("mandibleLength", "Max mandible length", ["mammal"]),
  row("skullMass", "Prepared skull mass", ["mammal"]),
];

const birdRows: ComparisonDifferenceRow[] = [
  row("skullLength", "Max length", ["bird"]),
  row("billLength", "Bill length", ["bird"]),
  row("billWidth", "Bill width", ["bird"]),
  row("billHeight", "Bill height", ["bird"]),
  row("craniumWidth", "Cranium width", ["bird"]),
  row("craniumHeight", "Cranium height", ["bird"]),
  row("orbitalWidth", "Orbital width", ["bird"]),
  row("mandibleLength", "Max mandible length", ["bird"]),
  row("skullMass", "Prepared skull mass", ["bird"]),
];

const sharedRows: ComparisonDifferenceRow[] = [
  row("skullLength", "Max length"),
  row("craniumWidth", "Cranium width"),
  row("mandibleLength", "Max mandible length"),
  row("skullMass", "Prepared skull mass"),
];

const mixedRows: ComparisonDifferenceRow[] = [
  row("skullLength", "Max length"),
  {
    key: "crossWidth",
    label: "Width (orbital ↔ max)",
    primaryKey: "skullWidth",
    comparisonKey: "skullWidth",
    measurementKeys: {
      mammal: "skullWidth",
      bird: "orbitalWidth",
    },
  },
  {
    key: "crossHeight",
    label: "Height (cranium ↔ skull)",
    primaryKey: "skullHeight",
    comparisonKey: "skullHeight",
    measurementKeys: {
      mammal: "skullHeight",
      bird: "craniumHeight",
    },
  },
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
    return mixedRows.map((rowDefinition) => ({
      ...rowDefinition,
      primaryKey:
        rowDefinition.measurementKeys[primaryProfile] ??
        rowDefinition.primaryKey,
      comparisonKey:
        rowDefinition.measurementKeys[comparisonProfile] ??
        rowDefinition.comparisonKey,
    }));
  }
  return sharedRows;
}

export function getComparisonMeasurementSections(
  profiles: MeasurementProfile[],
): {
  primary: ComparisonDifferenceRow[];
  additional: ComparisonDifferenceRow[];
} {
  const uniqueProfiles = [...new Set(profiles)];
  if (uniqueProfiles.length === 0) return { primary: [], additional: [] };

  const hasMammal = uniqueProfiles.includes("mammal");
  const hasBird = uniqueProfiles.includes("bird");
  const primary =
    hasMammal && hasBird
      ? mixedRows
      : getComparisonDifferenceRows(uniqueProfiles[0]!, uniqueProfiles[0]!);
  const primaryKeys = new Set(
    primary.flatMap((rowDefinition) =>
      Object.values(rowDefinition.measurementKeys),
    ),
  );
  const additionalKeys = uniqueProfiles
    .flatMap((profile) => [
      ...measurementProfileLayouts[profile].primary,
      ...measurementProfileLayouts[profile].additional,
    ])
    .filter(
      (key, index, keys) =>
        !primaryKeys.has(key) && keys.indexOf(key) === index,
    );
  const additional = additionalKeys.map((key) =>
    row(
      key,
      measurementDefinitions[key].label.replace(/^Maximum /, "Max "),
      uniqueProfiles,
    ),
  );
  return { primary, additional };
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
  key: MeasurementKey,
  label: string,
  profiles: MeasurementProfile[] = ["mammal", "bird", "other"],
): ComparisonDifferenceRow {
  return {
    key,
    label,
    primaryKey: key,
    comparisonKey: key,
    measurementKeys: Object.fromEntries(
      profiles
        .filter((profile) => isMeasurementApplicable(key, profile))
        .map((profile) => [profile, key]),
    ),
  };
}

export function getComparisonRowMeasurementKey(
  rowDefinition: ComparisonDifferenceRow,
  profile: MeasurementProfile,
): ComparisonMeasurementKey | null {
  return rowDefinition.measurementKeys[profile] ?? null;
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
