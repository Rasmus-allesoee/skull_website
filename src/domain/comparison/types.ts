import type {
  CanonicalView,
  ComparisonViewCalibration,
  ComparisonMeasurementKey,
  LateralOrientation,
  Measurement,
  MeasurementProfile,
  SubjectBounds,
} from "@/domain/content/types";

export type ComparisonView = Exclude<CanonicalView, "oblique">;

export interface SkullComparisonView {
  view: ComparisonView;
  publicPath: string;
  width: number;
  height: number;
  subjectBounds: SubjectBounds;
  hitPath?: string;
  orientation: LateralOrientation | null;
  calibration: ComparisonViewCalibration;
  alt: string;
  credit: string;
}

export interface SkullComparisonRecord {
  id: string;
  kind: "specimen" | "reference";
  label: string;
  isDefault: boolean;
  scientificName: string | null;
  specimenId: string | null;
  taxonId: string | null;
  genusName: string | null;
  genusSlug: string | null;
  href: string | null;
  aliases: string[];
  note: string | null;
  measurementProfile: MeasurementProfile;
  measurements: Record<ComparisonMeasurementKey, Measurement>;
  views: SkullComparisonView[];
  image: SkullComparisonView & { orientation: LateralOrientation };
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
  measurementKeys: Partial<
    Record<MeasurementProfile, ComparisonMeasurementKey>
  >;
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
