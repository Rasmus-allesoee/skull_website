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

  it("sorts species by their largest matching specimen and displays that specimen", () => {
    const fixture = structuredClone(catalog);
    const badger = fixture.taxa.find(
      ({ taxon }) => taxon.names.english === "European badger",
    )!;
    const nonDefault = badger.specimens.find(
      ({ specimen }) => specimen.specimenId === "SPEC-0009",
    )!;
    const secondSpecimen = badger.specimens.find(
      ({ specimen }) => specimen.specimenId === "SPEC-0010",
    )!;
    nonDefault.specimen.measurements.skullLength.value = 500;
    nonDefault.specimen.measurements.skullLength.status = "measured";
    secondSpecimen.specimen.measurements.skullMass.value = 1000;
    secondSpecimen.specimen.measurements.skullMass.status = "measured";

    const result = filterCatalog(
      fixture,
      {
        ...defaultCatalogState,
        scope: { rank: "family", slug: "mustelidae" },
        sort: "skull-length",
        direction: "descending",
      },
      null,
    );

    expect(result.taxa[0]?.taxon.names.english).toBe("European badger");
    expect(
      result.taxonRepresentatives[badger.taxon.taxonId]?.specimen.specimenId,
    ).toBe("SPEC-0009");
    expect(
      result.taxonMetricSpecimens[badger.taxon.taxonId]?.skullLength?.specimen
        .specimenId,
    ).toBe("SPEC-0009");
    expect(
      result.taxonMetricSpecimens[badger.taxon.taxonId]?.skullMass?.specimen
        .specimenId,
    ).toBe("SPEC-0010");
  });

  it("reverses numeric ordering while keeping unknown measurements last", () => {
    for (const direction of ["ascending", "descending"] as const) {
      const result = filterCatalog(
        catalog,
        {
          ...defaultCatalogState,
          mode: "specimens",
          sort: "skull-length",
          direction,
        },
        null,
      );
      const values = result.specimens.map(
        ({ specimen }) => specimen.measurements.skullLength.value,
      );
      const firstUnknown = values.findIndex((value) => value === null);
      expect(firstUnknown).toBeGreaterThan(-1);
      const recorded = values.slice(0, firstUnknown) as number[];
      expect(values.slice(firstUnknown).every((value) => value === null)).toBe(
        true,
      );
      expect(recorded).toEqual(
        [...recorded].sort((first, second) =>
          direction === "ascending" ? first - second : second - first,
        ),
      );
    }
  });

  it("reverses common-name ordering in both result modes", () => {
    for (const mode of ["species", "specimens"] as const) {
      const ascending = filterCatalog(
        catalog,
        {
          ...defaultCatalogState,
          mode,
          sort: "common-name",
          direction: "ascending",
        },
        null,
      );
      const descending = filterCatalog(
        catalog,
        {
          ...defaultCatalogState,
          mode,
          sort: "common-name",
          direction: "descending",
        },
        null,
      );
      const identifiers =
        mode === "species"
          ? ascending.taxa.map(({ taxon }) => taxon.taxonId)
          : ascending.specimens.map(({ specimen }) => specimen.specimenId);
      const reversedIdentifiers =
        mode === "species"
          ? descending.taxa.map(({ taxon }) => taxon.taxonId)
          : descending.specimens.map(({ specimen }) => specimen.specimenId);
      expect(reversedIdentifiers).toEqual([...identifiers].reverse());
    }
  });
});
