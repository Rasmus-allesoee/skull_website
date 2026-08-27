import Link from "next/link";

import {
  groupSpecimenCardsByFamily,
  groupTaxonCardsByFamily,
  taxonomyHref,
  type SortDirection,
  type SpecimenCardRecord,
  type TaxonCardRecord,
} from "@/domain/catalog/queries";

import { SpecimenCard, TaxonCardGrid } from "./CatalogCards";
import type {
  SpeciesMatchSummary,
  TaxonMetricSpecimens,
} from "./catalogFiltering";
import type { CatalogViewSort } from "./catalogState";

export function FamilyGroupedTaxonGallery({
  cards,
  matchSummaries,
  showMatchSummary = false,
  representatives,
  metricSpecimens,
  measurementSort,
  direction = "ascending",
}: {
  cards: TaxonCardRecord[];
  matchSummaries?: Record<string, SpeciesMatchSummary>;
  showMatchSummary?: boolean;
  representatives?: Record<string, SpecimenCardRecord>;
  metricSpecimens?: Record<string, TaxonMetricSpecimens>;
  measurementSort?: Extract<CatalogViewSort, "skull-length" | "skull-mass">;
  direction?: SortDirection;
}) {
  return (
    <div className="family-gallery-groups">
      {groupTaxonCardsByFamily(cards, direction).map((group) => {
        const label = group.family?.name ?? "Family not recorded";
        const headingId = `family-gallery-${group.family?.slug ?? "unrecorded"}`;
        return (
          <section
            key={group.family?.slug ?? "unrecorded"}
            aria-labelledby={headingId}
          >
            <header className="family-gallery-heading">
              <div>
                <p>Family</p>
                <h3 id={headingId}>{label}</h3>
              </div>
              {group.family ? (
                <Link href={taxonomyHref("family", group.family.slug)}>
                  Open family →
                </Link>
              ) : null}
            </header>
            <TaxonCardGrid
              cards={group.cards}
              matchSummaries={matchSummaries}
              showMatchSummary={showMatchSummary}
              representatives={representatives}
              metricSpecimens={metricSpecimens}
              measurementSort={measurementSort}
            />
          </section>
        );
      })}
    </div>
  );
}

export function FamilyGroupedSpecimenGallery({
  cards,
  direction = "ascending",
}: {
  cards: SpecimenCardRecord[];
  direction?: SortDirection;
}) {
  return (
    <div className="family-gallery-groups">
      {groupSpecimenCardsByFamily(cards, direction).map((group) => {
        const label = group.family?.name ?? "Family not recorded";
        const headingId = `specimen-family-gallery-${group.family?.slug ?? "unrecorded"}`;
        return (
          <section
            key={group.family?.slug ?? "unrecorded"}
            aria-labelledby={headingId}
          >
            <header className="family-gallery-heading">
              <div>
                <p>Family</p>
                <h3 id={headingId}>{label}</h3>
              </div>
              {group.family ? (
                <Link href={taxonomyHref("family", group.family.slug)}>
                  Open family →
                </Link>
              ) : null}
            </header>
            <div className="catalog-grid">
              {group.cards.map((card) => (
                <SpecimenCard key={card.specimen.specimenId} card={card} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
