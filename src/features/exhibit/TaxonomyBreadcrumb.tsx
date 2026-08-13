import Link from "next/link";

import type { TaxonRecord } from "@/domain/content/types";

export function TaxonomyBreadcrumb({ taxon }: { taxon: TaxonRecord }) {
  const ranks = [
    taxon.hierarchy.className,
    taxon.hierarchy.orderName,
    taxon.hierarchy.familyName,
    taxon.hierarchy.genusName,
  ].filter((value): value is string => Boolean(value));

  return (
    <nav className="taxonomy-breadcrumb" aria-label="Taxonomic breadcrumb">
      <ol>
        <li>
          <Link href="/">Collection</Link>
        </li>
        {ranks.map((rank) => (
          <li key={rank}>{rank}</li>
        ))}
        <li aria-current="page">
          <i>{taxon.scientificName}</i>
        </li>
      </ol>
      <p>
        Taxonomy rank pages become links when the catalog is introduced in Phase
        3.
      </p>
    </nav>
  );
}
