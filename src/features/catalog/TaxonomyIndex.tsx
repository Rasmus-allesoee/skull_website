import Link from "next/link";

import {
  taxonomyHref,
  taxonomyRanks,
  type TaxonomyNode,
  type TaxonomyRank,
} from "@/domain/catalog/queries";

const rankLabels: Record<TaxonomyRank, string> = {
  class: "Classes",
  order: "Orders",
  family: "Families",
  genus: "Genera",
};

export function TaxonomyIndex({
  nodes,
  heading = "Taxonomy index",
}: {
  nodes: TaxonomyNode[];
  heading?: string;
}) {
  const groups = taxonomyRanks
    .map((rank) => ({
      rank,
      nodes: nodes.filter((node) => node.rank === rank),
    }))
    .filter((group) => group.nodes.length > 0);
  if (groups.length === 0) return null;

  return (
    <section className="taxonomy-index" aria-labelledby="taxonomy-index-title">
      <div className="section-heading compact-section-heading">
        <p className="section-kicker">Systematic browsing</p>
        <h2 id="taxonomy-index-title">{heading}</h2>
      </div>
      <div className="taxonomy-index-groups">
        {groups.map((group) => (
          <section key={group.rank} aria-labelledby={`rank-${group.rank}`}>
            <h3 id={`rank-${group.rank}`}>{rankLabels[group.rank]}</h3>
            <ul>
              {group.nodes.map((node) => (
                <li key={`${node.rank}:${node.slug}`}>
                  <Link href={taxonomyHref(node.rank, node.slug)}>
                    <span>{node.name}</span>
                    <small>
                      {node.taxonCount}{" "}
                      {node.taxonCount === 1 ? "taxon" : "taxa"}
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
