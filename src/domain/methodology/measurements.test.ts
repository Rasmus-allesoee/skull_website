import { describe, expect, it } from "vitest";

import { buildContent } from "../../../scripts/lib/content";

describe("measurement reference compiler", () => {
  it("links 21 definitions to five diagrams and every registered occurrence", async () => {
    const { measurementReference } = await buildContent();
    expect(
      measurementReference.definitions.map(({ number }) => number),
    ).toEqual(Array.from({ length: 21 }, (_, index) => index + 1));
    expect(measurementReference.diagrams).toHaveLength(5);
    expect(measurementReference.occurrenceCount).toBe(24);

    const occurrences = measurementReference.diagrams.flatMap((diagram) =>
      diagram.occurrences.map((occurrence) => ({
        diagramId: diagram.id,
        number: occurrence.number,
      })),
    );
    expect(occurrences.filter(({ number }) => number === 1)).toHaveLength(3);
    expect(occurrences.filter(({ number }) => number === 2)).toHaveLength(2);
    for (const definition of measurementReference.definitions) {
      expect(
        occurrences.some(({ number }) => number === definition.number),
      ).toBe(true);
    }
  }, 60_000);
});
