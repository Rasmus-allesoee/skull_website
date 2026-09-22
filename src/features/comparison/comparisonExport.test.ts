import { describe, expect, it } from "vitest";

import { getEligibleSkullComparisons } from "@/data/comparison";

import { serializeComparisonMeasurements } from "./comparisonExport";

describe("comparison CSV exports", () => {
  const records = getEligibleSkullComparisons();
  const mammal = records.find(({ id }) => id === "specimen:SPEC-0001")!;
  const bird = records.find(
    ({ kind, measurementProfile }) =>
      kind === "specimen" && measurementProfile === "bird",
  )!;
  const reference = records.find(({ kind }) => kind === "reference")!;

  it("exports only selected source measurements in long format", () => {
    const csv = serializeComparisonMeasurements(
      [mammal, bird, reference],
      "long",
    );
    expect(csv).toContain("measurement,value,unit,status");
    expect(csv).toContain("skull_width_mm,");
    expect(csv).toContain("orbital_width_mm,");
    expect(csv).toContain("reference:adult-human-skull");
    expect(csv).toMatch(/reference:adult-human-skull[^\r\n]*,approximate/);
    expect(csv).not.toContain("crossWidth");
    expect(csv).not.toContain("Difference");
    expect(csv).not.toContain("×");
    expect(csv).not.toContain("not_applicable");
  });

  it("exports one wide row per subject with numeric values and status", () => {
    const csv = serializeComparisonMeasurements([mammal, bird], "wide");
    const [header, first, second] = csv
      .trim()
      .replace(/^\uFEFF/, "")
      .split("\r\n");
    expect(
      csv
        .trim()
        .replace(/^\uFEFF/, "")
        .split("\r\n"),
    ).toHaveLength(3);
    expect(header).toContain("skull_width_mm,skull_width_mm_status");
    expect(header).toContain("orbital_width_mm,orbital_width_mm_status");
    expect(first).toContain("specimen:SPEC-0001");
    expect(second).toContain(bird.id);
    expect(csv).not.toContain("Difference");
  });

  it("escapes untrusted text before opening a spreadsheet", () => {
    const csv = serializeComparisonMeasurements(
      [{ ...mammal, label: '=HYPERLINK("bad")' }],
      "wide",
    );
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
  });
});
