import type {
  ComparisonViewCalibration,
  Measurement,
} from "@/domain/content/types";

export interface CalibratedCanvasSize {
  width: number;
  height: number;
  pixelsPerMillimetre: number;
}

export function getCalibrationPixelsPerMillimetre(
  calibration: ComparisonViewCalibration,
  measurement: Measurement,
): number | null {
  if (
    (measurement.status !== "measured" &&
      measurement.status !== "approximate") ||
    measurement.value === null ||
    measurement.value <= 0 ||
    measurement.unit !== "mm" ||
    !Number.isFinite(calibration.pixelSpan) ||
    calibration.pixelSpan <= 0
  ) {
    return null;
  }

  return calibration.pixelSpan / measurement.value;
}

export function getCalibratedCanvasSize(options: {
  sourceWidth: number;
  sourceHeight: number;
  calibration: ComparisonViewCalibration;
  measurement: Measurement;
  worldPixelsPerMillimetre: number;
}): CalibratedCanvasSize | null {
  const {
    sourceWidth,
    sourceHeight,
    calibration,
    measurement,
    worldPixelsPerMillimetre,
  } = options;
  const pixelsPerMillimetre = getCalibrationPixelsPerMillimetre(
    calibration,
    measurement,
  );
  if (
    pixelsPerMillimetre === null ||
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    worldPixelsPerMillimetre <= 0
  ) {
    return null;
  }

  return {
    width: (sourceWidth / pixelsPerMillimetre) * worldPixelsPerMillimetre,
    height: (sourceHeight / pixelsPerMillimetre) * worldPixelsPerMillimetre,
    pixelsPerMillimetre,
  };
}
