import { describe, expect, it } from "vitest";

import type { ComparisonViewCalibration } from "@/domain/content/types";

import {
  getCalibratedCanvasSize,
  getCalibrationPixelsPerMillimetre,
} from "./calibration";

const calibration: ComparisonViewCalibration = {
  measurementKey: "skullLength",
  span: { kind: "subject-bounds-width" },
  pixelSpan: 1_000,
};

describe("comparison calibration", () => {
  it("derives source pixels per millimetre from a reviewed span", () => {
    expect(
      getCalibrationPixelsPerMillimetre(calibration, {
        status: "measured",
        value: 200,
        unit: "mm",
      }),
    ).toBe(5);
  });

  it("keeps equal physical spans equal across different source canvases", () => {
    const first = getCalibratedCanvasSize({
      sourceWidth: 1_600,
      sourceHeight: 800,
      calibration,
      measurement: { status: "measured", value: 200, unit: "mm" },
      worldPixelsPerMillimetre: 2,
    });
    const second = getCalibratedCanvasSize({
      sourceWidth: 3_200,
      sourceHeight: 2_000,
      calibration: { ...calibration, pixelSpan: 2_000 },
      measurement: { status: "measured", value: 200, unit: "mm" },
      worldPixelsPerMillimetre: 2,
    });

    expect(first?.width).toBe(640);
    expect(second?.width).toBe(640);
    expect(first?.pixelsPerMillimetre).toBe(5);
    expect(second?.pixelsPerMillimetre).toBe(10);
  });

  it("rejects missing, non-applicable, non-positive, and unit-mismatched values", () => {
    expect(
      getCalibrationPixelsPerMillimetre(calibration, {
        status: "not_recorded",
        value: null,
        unit: "mm",
      }),
    ).toBeNull();
    expect(
      getCalibrationPixelsPerMillimetre(calibration, {
        status: "not_applicable",
        value: null,
        unit: "mm",
      }),
    ).toBeNull();
    expect(
      getCalibrationPixelsPerMillimetre(calibration, {
        status: "measured",
        value: 0,
        unit: "mm",
      }),
    ).toBeNull();
    expect(
      getCalibrationPixelsPerMillimetre(calibration, {
        status: "measured",
        value: 200,
        unit: "g",
      }),
    ).toBeNull();
  });
});
