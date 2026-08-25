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
  it("keeps a long taxon name and missing image state explicit", () => {
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
    expect(
      screen.queryByText("Uncertain · Low confidence"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Confirmed identification"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Skull length")).toBeInTheDocument();
    expect(screen.getByText("Skull mass")).toBeInTheDocument();
  });

  it("renders the exact specimen-card mode with a stable nested URL", () => {
    const card = getSpecimenCardRecords(collection).find(
      ({ specimen }) => specimen.specimenId === "SPEC-0001",
    )!;
    render(<SpecimenCard card={card} />);

    expect(
      screen.getByRole("link", { name: /SPEC-0001 Raccoon dog/i }),
    ).toHaveAttribute("href", "/species/raccoon-dog/specimens/SPEC-0001");
    expect(screen.getByText("Skull length")).toBeInTheDocument();
    expect(screen.getByText("Skull mass")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Sex")).toBeInTheDocument();
    expect(screen.getByText("Condition")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.queryByText("Location · date")).not.toBeInTheDocument();
  });

  it("uses a compact specimen-count trigger and per-measurement specimen tooltips", () => {
    const taxonCard = getTaxonCardRecords(collection).find(
      ({ taxon }) => taxon.names.english === "Harbour seal",
    )!;
    render(<TaxonCard card={taxonCard} />);

    expect(
      screen.getByRole("button", { name: "Choose from 3 specimens" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 skulls")).toBeInTheDocument();
    expect(screen.queryByText(/Largest recorded/)).not.toBeInTheDocument();

    const tooltipIds = screen
      .getAllByRole("tooltip")
      .map((tooltip) => tooltip.textContent);
    expect(tooltipIds).toEqual(expect.arrayContaining(["SPEC-0014"]));
  });
});
