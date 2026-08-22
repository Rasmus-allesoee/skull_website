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
});
