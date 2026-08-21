import type { TaxonSuggestions } from "@/domain/catalog/queries";

import { TaxonCardGrid } from "./CatalogCards";

export function RelatedTaxa({
  suggestions,
}: {
  suggestions: TaxonSuggestions;
}) {
  if (
    suggestions.sameFamily.length === 0 &&
    suggestions.collectionWide.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="related-taxa content-section"
      aria-labelledby="related-title"
    >
      <div className="section-heading compact-section-heading">
        <p className="section-kicker">Continue exploring</p>
        <h2 id="related-title">More from the collection</h2>
      </div>
      {suggestions.sameFamily.length > 0 ? (
        <section aria-labelledby="same-family-title">
          <h3 id="same-family-title">From the same family</h3>
          <TaxonCardGrid cards={suggestions.sameFamily} />
        </section>
      ) : null}
      {suggestions.collectionWide.length > 0 ? (
        <section aria-labelledby="collection-wide-title">
          <h3 id="collection-wide-title">Elsewhere in the collection</h3>
          <TaxonCardGrid cards={suggestions.collectionWide} />
        </section>
      ) : null}
    </section>
  );
}
