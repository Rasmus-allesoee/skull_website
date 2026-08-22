import { beforeAll, describe, expect, it } from "vitest";

import { getCatalog } from "@/data/catalog";
import { buildCatalogSearchArtifact } from "@/domain/search/documents";
import { getCollection } from "@/data/collection";

import { defaultCatalogState } from "./catalogState";
import { filterCatalog } from "./catalogFiltering";

describe("catalog filtering", () => {
  const catalog = getCatalog();
  const documents = buildCatalogSearchArtifact(getCollection()).documents;

  beforeAll(() => {
    expect(catalog.specimens).toHaveLength(18);
  });

  it("narrows class and taxonomy scopes without changing canonical records", () => {
    const result = filterCatalog(
      catalog,
      {
        ...defaultCatalogState,
        classSlug: "mammals",
        scope: { rank: "family", slug: "mustelidae" },
      },
      null,
    );
    expect(result.taxa.map((card) => card.taxon.hierarchy.familySlug)).toEqual([
      "mustelidae",
      "mustelidae",
      "mustelidae",
    ]);
  });

  it("excludes unknown measurements only while a numeric range is active", () => {
    const allMoles = filterCatalog(
      catalog,
      { ...defaultCatalogState, query: "European mole" },
      documents.filter((document) => document.taxonId === "TAX-0013"),
    );
    expect(allMoles.taxa).toHaveLength(1);
    const measuredOnly = filterCatalog(
      catalog,
      {
        ...defaultCatalogState,
        query: "European mole",
        lengthMin: 1,
      },
      documents.filter((document) => document.taxonId === "TAX-0013"),
    );
    expect(measuredOnly.taxa).toHaveLength(0);
  });

  it("groups specimen-ID search to a taxon in species mode and exact skull in specimen mode", () => {
    const exactSpecimen = documents.filter(
      (document) => document.id === "specimen:SPEC-0013",
    );
    const species = filterCatalog(
      catalog,
      { ...defaultCatalogState, query: "SPEC-0013" },
      exactSpecimen,
    );
    const specimens = filterCatalog(
      catalog,
      {
        ...defaultCatalogState,
        query: "SPEC-0013",
        mode: "specimens",
      },
      exactSpecimen,
    );
    expect(species.taxa.map((card) => card.taxon.taxonId)).toEqual([
      "TAX-0012",
    ]);
    expect(specimens.specimens.map((card) => card.specimen.specimenId)).toEqual(
      ["SPEC-0013"],
    );
  });
});
