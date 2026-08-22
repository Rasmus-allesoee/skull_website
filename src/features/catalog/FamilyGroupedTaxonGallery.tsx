import Link from "next/link";

import {
  groupTaxonCardsByFamily,
  taxonomyHref,
  type TaxonCardRecord,
} from "@/domain/catalog/queries";

import { TaxonCardGrid } from "./CatalogCards";
import type { SpeciesMatchSummary } from "./catalogFiltering";

export function FamilyGroupedTaxonGallery({
  cards,
  matchSummaries,
  showMatchSummary = false,
}: {
  cards: TaxonCardRecord[];
  matchSummaries?: Record<string, SpeciesMatchSummary>;
  showMatchSummary?: boolean;
}) {
  return (
    <div className="family-gallery-groups">
      {groupTaxonCardsByFamily(cards).map((group) => {
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
            />
          </section>
        );
      })}
    </div>
  );
}
