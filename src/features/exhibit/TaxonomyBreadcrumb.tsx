import Link from "next/link";

import { getTaxonLineage, taxonomyHref } from "@/domain/catalog/queries";
import type { TaxonRecord } from "@/domain/content/types";

export function TaxonomyBreadcrumb({
  taxon,
  specimenId,
}: {
  taxon: TaxonRecord;
  specimenId?: string;
}) {
  const ranks = getTaxonLineage(taxon);

  return (
    <nav className="taxonomy-breadcrumb" aria-label="Taxonomic breadcrumb">
      <ol>
        <li>
          <Link href="/species">Species</Link>
        </li>
        {ranks.map((rank) => (
          <li key={`${rank.rank}:${rank.slug}`}>
            <Link href={taxonomyHref(rank.rank, rank.slug)}>{rank.name}</Link>
          </li>
        ))}
        <li aria-current={specimenId ? undefined : "page"}>
          {specimenId ? (
            <Link href={`/species/${taxon.slug}`}>
              <i>{taxon.scientificName}</i>
            </Link>
          ) : (
            <i>{taxon.scientificName}</i>
          )}
        </li>
        {specimenId ? <li aria-current="page">{specimenId}</li> : null}
      </ol>
    </nav>
  );
}
