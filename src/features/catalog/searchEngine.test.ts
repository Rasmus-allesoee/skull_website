import { describe, expect, it } from "vitest";

import { getCollection } from "@/data/collection";
import { buildCatalogSearchArtifact } from "@/domain/search/documents";

import {
  createCatalogSearchEngine,
  searchCatalogDocuments,
} from "./searchEngine";

describe("Orama catalog search", () => {
  const engine = createCatalogSearchEngine(
    buildCatalogSearchArtifact(getCollection()),
  );

  it.each([
    ["Nyctereutes procyonoides", "taxon:TAX-0001"],
    ["Raccoon", "taxon:TAX-0001"],
    ["Mårhund", "taxon:TAX-0001"],
    ["Marhund", "taxon:TAX-0001"],
    ["Chinese raccoon dog", "taxon:TAX-0001"],
    ["Racoon dog", "taxon:TAX-0001"],
    ["SPEC-0013", "specimen:SPEC-0013"],
    ["Mustelidae", "rank:family:mustelidae"],
  ])("ranks %s with %s first", async (query, expectedId) => {
    const results = await searchCatalogDocuments(engine, query);
    expect(results[0]?.id).toBe(expectedId);
  });

  it("keeps family searches within the matching lineage", async () => {
    const results = await searchCatalogDocuments(engine, "Canidae");

    expect(results.map(({ id }) => id)).toEqual([
      "rank:family:canidae",
      "taxon:TAX-0001",
      "taxon:TAX-0015",
      "specimen:SPEC-0001",
      "specimen:SPEC-0018",
    ]);
    expect(results.map(({ label }) => label)).not.toContain("Gull");
    expect(results.map(({ id }) => id)).not.toContain("rank:family:laridae");
  });

  it.each(["fox", "ræv", "red fox", "rød ræv", "rød ræb"])(
    "limits %s to the red fox taxon and specimen",
    async (query) => {
      const results = await searchCatalogDocuments(engine, query);
      expect(results.map(({ id }) => id)).toEqual([
        "taxon:TAX-0015",
        "specimen:SPEC-0018",
      ]);
    },
  );

  it("treats a complete specimen ID as an exact identifier lookup", async () => {
    const results = await searchCatalogDocuments(engine, "SPEC-0013");
    expect(results.map(({ id }) => id)).toEqual(["specimen:SPEC-0013"]);
  });

  it("retains useful typo tolerance without accepting loose token matches", async () => {
    const results = await searchCatalogDocuments(engine, "Racoon dog");
    expect(results.map(({ id }) => id)).toEqual([
      "taxon:TAX-0001",
      "specimen:SPEC-0001",
    ]);
  });
});
