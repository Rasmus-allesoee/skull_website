import { beforeAll, describe, expect, it } from "vitest";

import { getCollection } from "@/data/collection";
import type {
  CompiledCollection,
  MediaAsset,
  SpecimenRecord,
  TaxonRecord,
} from "@/domain/content/types";

import {
  getCatalogModel,
  getSpecimenCardRecords,
  getTaxonSuggestions,
  getTaxonomyLanding,
  resolvePublishedTaxonSlug,
} from "./queries";

let baseline: CompiledCollection;

beforeAll(() => {
  baseline = getCollection();
});

describe("catalog queries", () => {
  it("builds deterministic taxonomy landings and real counts", () => {
    const catalog = getCatalogModel(baseline);
    expect(catalog.taxonCount).toBe(15);
    expect(catalog.specimenCount).toBe(18);
    expect(catalog.rankCounts).toEqual({
      species: 13,
      genusLevelRecords: 2,
      classes: 2,
      orders: 6,
      families: 11,
      genera: 15,
    });
    expect(catalog.taxonomyTree).toHaveLength(2);

    const classLanding = getTaxonomyLanding(baseline, "class", "mammals")!;
    expect(classLanding.children.map((node) => node.slug)).toEqual([
      "carnivora",
      "lagomorpha",
      "soricomorpha",
    ]);
    expect(
      classLanding.descendantGroups.family?.some(
        (node) => node.slug === "canidae",
      ),
    ).toBe(true);
    expect(
      classLanding.taxa.find((card) => card.taxon.taxonId === "TAX-0001")
        ?.defaultSpecimen.specimenId,
    ).toBe("SPEC-0001");
  });

  it("keeps drafts out and counts multiple published specimens", () => {
    const collection = cloneCollection();
    collection.specimens.push(
      specimenFromBaseline("SPEC-9998", "TAX-0001", "published"),
      specimenFromBaseline("SPEC-9999", "TAX-0001", "draft"),
    );
    collection.media.push(mediaFromBaseline("SPEC-9998"));

    const catalog = getCatalogModel(collection);
    expect(catalog.specimenCount).toBe(19);
    expect(
      catalog.taxa.find((card) => card.taxon.taxonId === "TAX-0001")
        ?.specimenCount,
    ).toBe(2);
    const specimenIds = getSpecimenCardRecords(collection).map(
      (card) => card.specimen.specimenId,
    );
    expect(specimenIds).toContain("SPEC-9998");
    expect(specimenIds).not.toContain("SPEC-9999");
  });

  it("resolves previous slugs without changing stable identity", () => {
    const collection = cloneCollection();
    collection.taxa[0] = {
      ...collection.taxa[0]!,
      previousSlugs: ["old-raccoon-dog"],
    };

    expect(resolvePublishedTaxonSlug(collection, "raccoon-dog")).toEqual(
      expect.objectContaining({ redirect: false }),
    );
    expect(resolvePublishedTaxonSlug(collection, "old-raccoon-dog")).toEqual(
      expect.objectContaining({
        redirect: true,
        taxon: expect.objectContaining({ taxonId: "TAX-0001" }),
      }),
    );
  });

  it("keeps related groups stable, bounded, deduplicated, and current-free", () => {
    const collection = cloneCollection();
    for (let index = 2; index <= 9; index += 1) {
      const stableIndex = 1000 + index;
      const taxonId = `TAX-${String(stableIndex).padStart(4, "0")}`;
      const specimenId = `SPEC-${String(stableIndex).padStart(4, "0")}`;
      collection.taxa.push(
        taxonFromBaseline(taxonId, specimenId, {
          slug: `test-taxon-${stableIndex}`,
          familyName: index <= 5 ? "Canidae" : "Felidae",
          familySlug: index <= 5 ? "canidae" : "felidae",
        }),
      );
      collection.specimens.push(specimenFromBaseline(specimenId, taxonId));
      collection.media.push(mediaFromBaseline(specimenId));
    }

    const first = getTaxonSuggestions(collection, "TAX-0001");
    const second = getTaxonSuggestions(collection, "TAX-0001");
    const sameFamilyIds = first.sameFamily.map((card) => card.taxon.taxonId);
    const collectionWideIds = first.collectionWide.map(
      (card) => card.taxon.taxonId,
    );

    expect(first).toEqual(second);
    expect(first.sameFamily).toHaveLength(3);
    expect(first.collectionWide).toHaveLength(3);
    expect([...sameFamilyIds, ...collectionWideIds]).not.toContain("TAX-0001");
    expect(new Set([...sameFamilyIds, ...collectionWideIds]).size).toBe(6);
  });
});

function cloneCollection(): CompiledCollection {
  return structuredClone(baseline);
}

function specimenFromBaseline(
  specimenId: string,
  taxonId: string,
  publicationStatus: SpecimenRecord["publicationStatus"] = "published",
): SpecimenRecord {
  return {
    ...structuredClone(baseline.specimens[0]!),
    specimenId,
    taxonId,
    publicationStatus,
  };
}

function taxonFromBaseline(
  taxonId: string,
  defaultSpecimenId: string,
  options: {
    slug: string;
    familyName: string;
    familySlug: string;
  },
): TaxonRecord {
  const source = structuredClone(baseline.taxa[0]!);
  return {
    ...source,
    taxonId,
    slug: options.slug,
    scientificName: `Testus ${options.slug}`,
    names: { english: `Test taxon ${taxonId}`, danish: null, aliases: [] },
    hierarchy: {
      ...source.hierarchy,
      familyName: options.familyName,
      familySlug: options.familySlug,
      genusName: `Testus${taxonId}`,
      genusSlug: `testus-${taxonId.toLocaleLowerCase("en")}`,
    },
    defaultSpecimenId,
    previousSlugs: [],
  };
}

function mediaFromBaseline(specimenId: string): MediaAsset {
  return {
    ...structuredClone(
      baseline.media.find((asset) => asset.view === "lateral")!,
    ),
    specimenId,
    publicPath: `/media/specimens/${specimenId}/${specimenId}__lateral.webp`,
  };
}
