import { describe, expect, it } from "vitest";

import { getCatalog } from "@/data/catalog";
import { getCollection } from "@/data/collection";
import { buildCatalogSearchArtifact } from "@/domain/search/documents";

import {
  buildCatalogSuggestionModel,
  flattenCatalogSuggestionEntries,
  type CatalogSearchTaxonMeta,
} from "./searchSuggestions";

const artifact = buildCatalogSearchArtifact(getCollection());
const catalog = getCatalog();
const taxonMeta: CatalogSearchTaxonMeta[] = catalog.taxa.map(
  ({ taxon, defaultSpecimen }) => ({
    taxonId: taxon.taxonId,
    slug: taxon.slug,
    defaultSpecimenId: defaultSpecimen.specimenId,
  }),
);

describe("catalog search suggestion projection", () => {
  it("deduplicates broad Species-mode results and keeps expandable specimens available", () => {
    const model = buildCatalogSuggestionModel({
      results: artifact.documents.filter(
        (document) =>
          (document.type === "rank" &&
            document.id === "rank:order:carnivora") ||
          (document.type === "taxon" &&
            [
              "TAX-0001",
              "TAX-0003",
              "TAX-0008",
              "TAX-0009",
              "TAX-0011",
              "TAX-0012",
              "TAX-0015",
            ].includes(document.taxonId)),
      ),
      availableDocuments: artifact.documents,
      taxonMeta,
      query: "Carnivora",
    });

    expect(model.ranks).toHaveLength(1);
    expect(model.taxa).toHaveLength(7);
    expect(
      model.taxa.find(({ taxonId }) => taxonId === "TAX-0009"),
    ).toMatchObject({
      defaultSpecimenId: "SPEC-0010",
      otherSpecimens: [expect.objectContaining({ specimenId: "SPEC-0009" })],
    });
    expect(
      flattenCatalogSuggestionEntries(model, "species", new Set()),
    ).toHaveLength(8);
    expect(
      flattenCatalogSuggestionEntries(model, "species", new Set(["TAX-0009"]))
        .map(({ document }) => document.specimenId)
        .filter(Boolean),
    ).toEqual(["SPEC-0009"]);
  });

  it("shows every matching specimen directly in Specimens mode", () => {
    const results = artifact.documents.filter(
      (document) =>
        (document.type === "rank" && document.id === "rank:order:carnivora") ||
        (document.type === "taxon" &&
          [
            "TAX-0001",
            "TAX-0003",
            "TAX-0008",
            "TAX-0009",
            "TAX-0011",
            "TAX-0012",
            "TAX-0015",
          ].includes(document.taxonId)),
    );
    const model = buildCatalogSuggestionModel({
      results,
      availableDocuments: artifact.documents,
      taxonMeta,
      query: "Carnivora",
    });
    const entries = flattenCatalogSuggestionEntries(
      model,
      "specimens",
      new Set(),
    );

    expect(model.specimens).toHaveLength(10);
    expect(entries.filter(({ kind }) => kind === "taxon")).toHaveLength(0);
    expect(entries.filter(({ kind }) => kind === "specimen")).toHaveLength(10);
  });

  it("opens the matching specimen subsection for an exact specimen ID", () => {
    const results = artifact.documents.filter(
      (document) => document.id === "specimen:SPEC-0013",
    );
    const model = buildCatalogSuggestionModel({
      results,
      availableDocuments: artifact.documents,
      taxonMeta,
      query: "SPEC-0013",
    });
    const entries = flattenCatalogSuggestionEntries(
      model,
      "species",
      new Set(model.autoExpandedTaxonIds),
    );

    expect(model.autoExpandedTaxonIds).toEqual(["TAX-0012"]);
    expect(entries.map(({ document }) => document.specimenId)).toContain(
      "SPEC-0013",
    );
    expect(
      entries.find(({ document }) => document.specimenId === "SPEC-0013"),
    ).toMatchObject({ kind: "specimen", taxonId: "TAX-0012" });
  });
});
