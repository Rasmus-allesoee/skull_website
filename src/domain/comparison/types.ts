import type {
  ComparisonMeasurementKey,
  LateralOrientation,
  Measurement,
  MeasurementProfile,
  SubjectBounds,
} from "@/domain/content/types";

export interface SkullComparisonRecord {
  id: string;
  kind: "specimen" | "reference";
  label: string;
  isDefault: boolean;
  scientificName: string | null;
  specimenId: string | null;
  href: string | null;
  aliases: string[];
  note: string | null;
  measurementProfile: MeasurementProfile;
  measurements: Record<ComparisonMeasurementKey, Measurement>;
  image: {
    publicPath: string;
    width: number;
    height: number;
    subjectBounds: SubjectBounds;
    orientation: LateralOrientation;
    alt: string;
    credit: string;
  };
}

export interface ScalePresentation {
  relativeLengthPercent: number;
  subjectAspectRatio: number;
  canvasWidthPercent: number;
  canvasHeightPercent: number;
  canvasLeftPercent: number;
  canvasTopPercent: number;
  flipHorizontally: boolean;
}

export type DifferenceDirection = "larger" | "smaller" | "equal";

export interface ComparisonDifferenceRow {
  key: string;
  label: string;
  primaryKey: ComparisonMeasurementKey;
  comparisonKey: ComparisonMeasurementKey;
}

export interface MeasurementDifference {
  key: string;
  direction: DifferenceDirection | "unavailable";
  approximate: boolean;
  difference: number | null;
  ratio: number | null;
  unit: "mm" | "g";
  text: string;
  ratioText: string | null;
}
