import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getCatalogModel } from "@/domain/catalog/queries";
import type { CompiledCollection } from "@/domain/content/types";
import { buildMapProjection } from "@/domain/map/projection";
import { buildCatalogSearchArtifact } from "@/domain/search/documents";

import { defaultMapState } from "./mapState";
import { filterMapRecords } from "./mapFiltering";

const collection = JSON.parse(
  readFileSync(
    path.join(process.cwd(), ".generated", "collection.json"),
    "utf8",
  ),
) as CompiledCollection;

describe("map filtering", () => {
  it("resolves a higher-rank search to physical specimens", () => {
    const searchDocuments = buildCatalogSearchArtifact(
      collection,
    ).documents.filter((document) => document.id === "rank:order:carnivora");
    const filtered = filterMapRecords(
      getCatalogModel(collection),
      buildMapProjection(collection),
      { ...defaultMapState, query: "Carnivora" },
      searchDocuments,
    );
    expect(filtered.records).toHaveLength(10);
    expect(
      new Set(filtered.records.map((record) => record.specimenId)).size,
    ).toBe(10);
  });

  it("keeps a matching unknown-coordinate record in the not-mapped group", () => {
    const fixture = structuredClone(collection);
    const specimen = fixture.specimens[0]!;
    specimen.location = {
      ...specimen.location,
      latitude: null,
      longitude: null,
      precision: "unknown",
      uncertaintyM: null,
    };
    const filtered = filterMapRecords(
      getCatalogModel(fixture),
      buildMapProjection(fixture),
      defaultMapState,
      null,
    );
    expect(filtered.notMapped.map((record) => record.specimenId)).toContain(
      specimen.specimenId,
    );
  });
});
