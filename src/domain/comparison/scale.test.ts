import { describe, expect, it } from "vitest";

import type { Measurement } from "@/domain/content/types";

import {
  calculateMeasurementDifference,
  getComparisonDifferenceRows,
  getScalePresentation,
} from "./scale";
import type { SkullComparisonRecord } from "./types";

const measured = (value: number, unit: "mm" | "g" = "mm"): Measurement => ({
  status: "measured",
  value,
  unit,
});
const notApplicable = (): Measurement => ({
  status: "not_applicable",
  value: null,
  unit: "mm",
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
  href: null,
  aliases: [],
  note: null,
  measurementProfile: "mammal",
  measurements: {
    skullLength: measured(length),
    skullWidth: measured(1),
    skullHeight: measured(1),
    skullMass: measured(1, "g"),
    craniumWidth: measured(1),
    mandibleLength: measured(1),
    billLength: notApplicable(),
    billWidth: notApplicable(),
    billHeight: notApplicable(),
    craniumHeight: notApplicable(),
    orbitalWidth: notApplicable(),
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

  it("resolves mammal, bird, and cross-class difference suites", () => {
    const mammalRows = getComparisonDifferenceRows("mammal", "mammal");
    const birdRows = getComparisonDifferenceRows("bird", "bird");
    const birdToMammal = getComparisonDifferenceRows("bird", "mammal");
    const mammalToBird = getComparisonDifferenceRows("mammal", "bird");

    expect(mammalRows).toHaveLength(6);
    expect(mammalRows.map((item) => item.label)).toEqual([
      "Max length",
      "Max width",
      "Max height",
      "Cranium width",
      "Max mandible length",
      "Prepared skull mass",
    ]);
    expect(birdRows).toHaveLength(9);
    expect(birdRows.map((item) => item.label)).toContain("Bill height");
    expect(birdToMammal).toHaveLength(6);
    expect(birdToMammal[1]).toEqual(
      expect.objectContaining({
        label: "Width (orbital ↔ max)",
        primaryKey: "orbitalWidth",
        comparisonKey: "skullWidth",
      }),
    );
    expect(mammalToBird[2]).toEqual(
      expect.objectContaining({
        label: "Height (cranium ↔ skull)",
        primaryKey: "skullHeight",
        comparisonKey: "craniumHeight",
      }),
    );
  });
});
