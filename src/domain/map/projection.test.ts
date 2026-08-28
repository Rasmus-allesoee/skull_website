import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import type { CompiledCollection } from "@/domain/content/types";

import {
  buildMapProjection,
  createUncertaintyPolygon,
  isMappedRecord,
} from "./projection";

function collection() {
  return JSON.parse(
    readFileSync(
      path.join(process.cwd(), ".generated", "collection.json"),
      "utf8",
    ),
  ) as CompiledCollection;
}

describe("map projection", () => {
  it("deterministically projects every published record and only usable points", () => {
    const first = buildMapProjection(collection());
    const second = buildMapProjection(collection());

    expect(first).toEqual(second);
    expect(first.records).toHaveLength(18);
    expect(first.geoJson.features).toHaveLength(18);
    expect(first.records.map((record) => record.specimenId)).toEqual(
      [...first.records.map((record) => record.specimenId)].sort(),
    );
    expect(
      first.records.every((record) =>
        record.specimenHref.endsWith(record.specimenId),
      ),
    ).toBe(true);
  });

  it("keeps unknown-coordinate records in the list but out of GeoJSON", () => {
    const fixture = structuredClone(collection());
    const specimen = fixture.specimens.find(
      (candidate) => candidate.specimenId === "SPEC-0001",
    )!;
    specimen.location.latitude = null;
    specimen.location.longitude = null;
    specimen.location.precision = "unknown";
    specimen.location.uncertaintyM = null;

    const projection = buildMapProjection(fixture);
    const record = projection.records.find(
      (candidate) => candidate.specimenId === "SPEC-0001",
    )!;
    expect(isMappedRecord(record)).toBe(false);
    expect(
      projection.geoJson.features.some((feature) => feature.id === "SPEC-0001"),
    ).toBe(false);
  });

  it("creates a closed geographic uncertainty polygon only for positive approximate radii", () => {
    const projection = buildMapProjection(collection());
    const approximate = projection.records.find(
      (record) => record.specimenId === "SPEC-0001",
    )!;
    const exact = projection.records.find(
      (record) => record.specimenId === "SPEC-0003",
    )!;
    const polygon = createUncertaintyPolygon(approximate, true, 36);

    expect(polygon?.geometry.coordinates[0]).toHaveLength(37);
    expect(polygon?.geometry.coordinates[0]?.[0]).toEqual(
      polygon?.geometry.coordinates[0]?.at(-1),
    );
    expect(polygon?.properties).toEqual({
      specimenId: "SPEC-0001",
      selected: true,
    });
    expect(createUncertaintyPolygon(exact, true)).toBeNull();
  });
});
