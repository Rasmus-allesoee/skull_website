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

    const lateral = measurementReference.diagrams.find(
      ({ id }) => id === "lateral-skull",
    )!;
    const lateralOne = lateral.occurrences.find(({ number }) => number === 1)!;
    const lateralTwo = lateral.occurrences.find(({ number }) => number === 2)!;
    expect(lateral.viewport).toEqual([350, 250, 5650, 3000]);
    expect(lateralOne.extensions).toContainEqual([599, 568, 599, 2030]);
    expect(lateralOne.extensions).toContainEqual([5443, 568, 5443, 1591]);
    expect(lateralTwo.line[0]).toBe(599);
    expect(lateralTwo.extensions).toEqual([[5216, 848, 5216, 2496]]);

    const mandible = measurementReference.diagrams.find(
      ({ id }) => id === "mandible-lateral",
    )!;
    const mandibularToothrow = mandible.occurrences.find(
      ({ number }) => number === 11,
    )!;
    expect(mandibularToothrow.line[2]).toBe(3913);
    expect(mandibularToothrow.extensions).toEqual([[1198, 1514, 1198, 2110]]);
  }, 60_000);
});
