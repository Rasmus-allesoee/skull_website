import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { getCollection } from "@/data/collection";
import {
  getSpecimenCardRecords,
  getTaxonCardRecords,
} from "@/domain/catalog/queries";
import type { CompiledCollection } from "@/domain/content/types";

import { SpecimenCard, TaxonCard } from "./CatalogCards";

let collection: CompiledCollection;

beforeAll(() => {
  collection = getCollection();
});

describe("catalog cards", () => {
  it("keeps a long uncertain taxon name and missing image state explicit", () => {
    const card = getTaxonCardRecords(collection).find(
      ({ taxon }) => taxon.taxonId === "TAX-0001",
    )!;
    const longName =
      "Exceptionally long common name used to verify resilient catalog wrapping";
    render(
      <TaxonCard
        card={{
          ...card,
          image: null,
          taxon: {
            ...card.taxon,
            scientificName: "Longissima taxonomica probabilis",
            identificationQualifier: "uncertain",
            identificationConfidence: "low",
            names: { ...card.taxon.names, english: longName },
          },
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: new RegExp(longName) }),
    ).toHaveAttribute("href", "/species/raccoon-dog");
    expect(screen.getByText("Lateral view not available")).toBeInTheDocument();
    expect(screen.getByText("Uncertain · Low confidence")).toBeInTheDocument();
  });

  it("renders the exact specimen-card mode with a stable nested URL", () => {
    const card = getSpecimenCardRecords(collection).find(
      ({ specimen }) => specimen.specimenId === "SPEC-0001",
    )!;
    render(<SpecimenCard card={card} />);

    expect(
      screen.getByRole("link", { name: /SPEC-0001 Raccoon dog/i }),
    ).toHaveAttribute("href", "/species/raccoon-dog/specimens/SPEC-0001");
    expect(screen.getByText("Max length")).toBeInTheDocument();
    expect(screen.getByText("Prepared mass")).toBeInTheDocument();
  });
});
