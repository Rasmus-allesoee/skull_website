import { describe, expect, it } from "vitest";

import { getEligibleSkullComparisons } from "./comparison";

describe("comparison data", () => {
  it("includes every calibrated published specimen and reviewed reference", () => {
    const records = getEligibleSkullComparisons();
    const specimens = records.filter((record) => record.kind === "specimen");
    const references = records.filter((record) => record.kind === "reference");

    expect(specimens).toHaveLength(18);
    expect(references).toHaveLength(1);
    expect(records.flatMap((record) => record.views)).toHaveLength(87);
    expect(
      specimens.filter((record) =>
        record.views.some((view) => view.view === "frontal"),
      ),
    ).toHaveLength(14);
    expect(
      records.every(
        (record) =>
          record.image.view === "lateral" &&
          record.image.orientation !== null &&
          record.image.calibration.measurementKey === "skullLength",
      ),
    ).toBe(true);
    expect(
      records
        .flatMap((record) => record.views)
        .some((view) => Object.is(view.view, "oblique")),
    ).toBe(false);
  });
});
