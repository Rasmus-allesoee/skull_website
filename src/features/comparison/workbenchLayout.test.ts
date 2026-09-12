import { describe, expect, it } from "vitest";

import {
  arrangeComparisonLayers,
  comparisonWorldHeight,
  comparisonWorldWidth,
  getFittedComparisonCamera,
  type ComparisonLayerGeometry,
} from "./workbenchLayout";

const layers: ComparisonLayerGeometry[] = [
  {
    key: "a:lateral",
    subjectId: "a",
    subjectIndex: 0,
    view: "lateral",
    width: 240,
    height: 160,
  },
  {
    key: "b:lateral",
    subjectId: "b",
    subjectIndex: 1,
    view: "lateral",
    width: 300,
    height: 180,
  },
];

const multiViewLayers: ComparisonLayerGeometry[] = [
  ...layers,
  {
    key: "a:frontal",
    subjectId: "a",
    subjectIndex: 0,
    view: "frontal",
    width: 120,
    height: 180,
  },
  {
    key: "b:frontal",
    subjectId: "b",
    subjectIndex: 1,
    view: "frontal",
    width: 150,
    height: 210,
  },
  {
    key: "c:lateral",
    subjectId: "c",
    subjectIndex: 2,
    view: "lateral",
    width: 220,
    height: 130,
  },
];

describe("comparison workbench layout", () => {
  it("builds deterministic in-world placements for every arrangement", () => {
    for (const arrangement of [
      "by-specimen",
      "by-view",
      "side-by-side",
      "overlay-pair",
      "vertical-stack",
    ] as const) {
      const result = arrangeComparisonLayers(layers, arrangement, ["a", "b"]);
      expect(Object.keys(result)).toEqual(["a:lateral", "b:lateral"]);
      for (const placement of Object.values(result)) {
        expect(Number.isFinite(placement.x)).toBe(true);
        expect(Number.isFinite(placement.y)).toBe(true);
        expect(placement.z).toBeGreaterThan(0);
      }
    }
  });

  it("centres a matching directed pair in overlay mode", () => {
    const result = arrangeComparisonLayers(layers, "overlay-pair", ["a", "b"]);
    expect(result["a:lateral"]?.x).toBe(
      comparisonWorldWidth / 2 - layers[0]!.width / 2,
    );
    expect(result["b:lateral"]?.y).toBe(
      comparisonWorldHeight / 2 - layers[1]!.height / 2,
    );
  });

  it("overlays every subject within each matching view group", () => {
    const result = arrangeComparisonLayers(multiViewLayers, "overlay-pair", [
      "a",
      "b",
    ]);
    expect(result["a:lateral"]?.x).toBe(
      result["b:lateral"]!.x +
        (multiViewLayers[1]!.width - multiViewLayers[0]!.width) / 2,
    );
    expect(result["a:lateral"]?.x).toBe(
      result["c:lateral"]!.x +
        (multiViewLayers[4]!.width - multiViewLayers[0]!.width) / 2,
    );
    expect(result["a:frontal"]?.x).toBe(
      result["b:frontal"]!.x +
        (multiViewLayers[3]!.width - multiViewLayers[2]!.width) / 2,
    );
    expect(result["a:frontal"]?.y).toBe(
      result["b:frontal"]!.y +
        (multiViewLayers[3]!.height - multiViewLayers[2]!.height) / 2,
    );
    expect(result["a:lateral"]?.y).not.toBe(result["a:frontal"]?.y);
  });

  it("fits the arrangement within the camera zoom limits", () => {
    const placements = arrangeComparisonLayers(layers, "side-by-side", null);
    const camera = getFittedComparisonCamera(layers, placements, {
      width: 900,
      height: 500,
    });
    expect(camera.zoom).toBeGreaterThanOrEqual(0.25);
    expect(camera.zoom).toBeLessThanOrEqual(20);
    expect(Number.isFinite(camera.x)).toBe(true);
    expect(Number.isFinite(camera.y)).toBe(true);
  });
});
