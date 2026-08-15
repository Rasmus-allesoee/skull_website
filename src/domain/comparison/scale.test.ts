import { describe, expect, it } from "vitest";

import type { Measurement } from "@/domain/content/types";

import { calculateMeasurementDifference, getScalePresentation } from "./scale";
import type { SkullComparisonRecord } from "./types";

const measured = (value: number, unit: "mm" | "g" = "mm"): Measurement => ({
  status: "measured",
  value,
  unit,
});

const record = (
  id: string,
  length: number,
  canvasWidth: number,
  subjectX: number,
  subjectWidth: number,
): SkullComparisonRecord => ({
  id,
  kind: "specimen",
  label: id,
  isDefault: false,
  scientificName: null,
  specimenId: id,
  aliases: [],
  note: null,
  measurements: {
    skullLength: measured(length),
    skullWidth: measured(1),
    skullHeight: measured(1),
    skullMass: measured(1, "g"),
    craniumWidth: measured(1),
    mandibleLength: measured(1),
  },
  image: {
    publicPath: `/${id}.webp`,
    width: canvasWidth,
    height: 500,
    subjectBounds: { x: subjectX, y: 50, width: subjectWidth, height: 400 },
    orientation: "right",
    alt: id,
    credit: "Test",
  },
});

describe("true-scale comparison", () => {
  it("keeps the anatomical ratio independent of transparent canvas margins", () => {
    const raccoonDog = record("SPEC-0001", 116, 3200, 363, 2603);
    const human = record("human", 182, 1448, 283, 847);
    const primary = getScalePresentation(raccoonDog, 182, "right");
    const comparison = getScalePresentation(human, 182, "right");

    expect(
      primary.relativeLengthPercent / comparison.relativeLengthPercent,
    ).toBeCloseTo(116 / 182, 10);
    expect(primary.canvasWidthPercent).toBeCloseTo((3200 / 2603) * 100, 10);
    expect(comparison.canvasWidthPercent).toBeCloseTo((1448 / 847) * 100, 10);
    expect(primary.canvasLeftPercent).toBeCloseTo((-363 / 2603) * 100, 10);
  });

  it("flips only the presentation when lateral orientations differ", () => {
    const primary = record("primary", 100, 1000, 100, 800);
    const comparison = record("comparison", 120, 1000, 100, 800);
    comparison.image.orientation = "left";

    expect(getScalePresentation(primary, 120, "right").flipHorizontally).toBe(
      false,
    );
    expect(
      getScalePresentation(comparison, 120, "right").flipHorizontally,
    ).toBe(true);
  });

  it("formats measured and approximate directional differences consistently", () => {
    expect(
      calculateMeasurementDifference("skullLength", measured(116), {
        status: "approximate",
        value: 182,
        unit: "mm",
      }),
    ).toEqual(
      expect.objectContaining({
        direction: "smaller",
        text: "~66 mm shorter",
        ratioText: "0.64×",
      }),
    );
    expect(
      calculateMeasurementDifference("skullMass", measured(800, "g"), {
        status: "approximate",
        value: 800,
        unit: "g",
      }),
    ).toEqual(
      expect.objectContaining({
        direction: "equal",
        text: "Same mass",
        ratioText: "1×",
      }),
    );
  });

  it("does not calculate from missing values", () => {
    expect(
      calculateMeasurementDifference("skullWidth", measured(50), {
        status: "not_recorded",
        value: null,
        unit: "mm",
      }),
    ).toEqual(
      expect.objectContaining({
        direction: "unavailable",
        text: "Not recorded",
        ratio: null,
      }),
    );
  });
});
