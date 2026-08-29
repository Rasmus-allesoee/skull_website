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

  it("disambiguates coincident approximate points without changing canonical coordinates", () => {
    const projection = buildMapProjection(collection());
    const coincident = projection.records.filter(
      (record) => record.latitude === 55.39687 && record.longitude === 8.391478,
    );
    const plotCoordinates = coincident.map(
      (record) => record.plotLatitude! + "," + record.plotLongitude!,
    );
    const geoJsonCoordinates = coincident.map(
      (record) => record.plotLongitude! + "," + record.plotLatitude!,
    );

    expect(coincident.map((record) => record.specimenId)).toEqual([
      "SPEC-0004",
      "SPEC-0006",
      "SPEC-0011",
      "SPEC-0017",
    ]);
    expect(new Set(plotCoordinates).size).toBe(coincident.length);
    expect(
      coincident.every(
        (record) =>
          record.coordinatePrecision === "approximate" &&
          Math.hypot(
            record.plotLatitude! - record.latitude!,
            record.plotLongitude! - record.longitude!,
          ) > 0,
      ),
    ).toBe(true);
    expect(
      coincident.every((record) => {
        const latitudeDeltaM =
          ((record.plotLatitude! - record.latitude!) * Math.PI * earthRadiusM) /
          180;
        const longitudeDeltaM =
          ((record.plotLongitude! - record.longitude!) *
            Math.PI *
            earthRadiusM *
            Math.cos((record.latitude! * Math.PI) / 180)) /
          180;
        return Math.hypot(latitudeDeltaM, longitudeDeltaM) <= 50;
      }),
    ).toBe(true);
    expect(
      projection.geoJson.features
        .filter((feature) =>
          coincident.some((record) => record.specimenId === feature.id),
        )
        .map((feature) => feature.geometry.coordinates.join(",")),
    ).toEqual(geoJsonCoordinates);
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

const earthRadiusM = 6_371_008.8;
