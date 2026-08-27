import { beforeAll, describe, expect, it } from "vitest";

import { getCollection } from "@/data/collection";

import {
  buildCatalogSearchArtifact,
  getSearchMatchTier,
  normalizeSearchText,
} from "./documents";

describe("catalog search documents", () => {
  const artifact = buildCatalogSearchArtifact(getCollection());

  beforeAll(() => {
    expect(artifact.documents.length).toBeGreaterThan(30);
  });

  it("emits deterministic published rank, taxon, and specimen documents", () => {
    expect(buildCatalogSearchArtifact(getCollection())).toEqual(artifact);
    expect(
      artifact.documents.filter((document) => document.type === "taxon"),
    ).toHaveLength(15);
    expect(
      artifact.documents.filter((document) => document.type === "specimen"),
    ).toHaveLength(18);
    expect(
      artifact.documents.find(
        (document) => document.id === "rank:family:canidae",
      ),
    ).toEqual(
      expect.objectContaining({
        url: "/taxonomy/family/canidae",
        taxonIds: expect.arrayContaining(["TAX-0001", "TAX-0015"]),
      }),
    );
  });

  it("normalizes Danish diacritics and prioritizes exact, prefix, then alias", () => {
    const raccoonDog = artifact.documents.find(
      (document) => document.id === "taxon:TAX-0001",
    )!;
    expect(normalizeSearchText("  MÅRHUND  ")).toBe("marhund");
    expect(normalizeSearchText("Rød ræv")).toBe("rod raev");
    expect(normalizeSearchText("Spættet sæl")).toBe("spaettet sael");
    expect(getSearchMatchTier(raccoonDog, "Mårhund")).toBe(0);
    expect(getSearchMatchTier(raccoonDog, "Nyctereu")).toBe(1);
    expect(getSearchMatchTier(raccoonDog, "Chinese raccoon dog")).toBe(2);
  });
});
