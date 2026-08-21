import Link from "next/link";

import { SubjectImage } from "@/components/SubjectImage";
import {
  taxonomyHref,
  type TaxonomyTreeBranch,
} from "@/domain/catalog/queries";

export function TaxonomyTree({
  branches,
  compact = false,
}: {
  branches: TaxonomyTreeBranch[];
  compact?: boolean;
}) {
  return (
    <div className={`taxonomy-tree ${compact ? "taxonomy-tree-compact" : ""}`}>
      {branches.map((classBranch) => (
        <article key={classBranch.node.slug} className="taxonomy-tree-class">
          <Link
            className="taxonomy-tree-class-link"
            href={taxonomyHref("class", classBranch.node.slug)}
          >
            {classBranch.representative?.image ? (
              <div className="taxonomy-tree-image">
                <SubjectImage
                  asset={classBranch.representative.image}
                  sizes="(max-width: 48rem) 7rem, 9rem"
                />
              </div>
            ) : null}
            <span>
              <small>Class</small>
              <strong>{classBranch.node.name}</strong>
              <em>
                {classBranch.node.taxonCount} taxa ·{" "}
                {classBranch.node.specimenCount} specimens
              </em>
            </span>
          </Link>
          <ul className="taxonomy-tree-orders">
            {classBranch.children.map((orderBranch) => (
              <li key={orderBranch.node.slug}>
                <Link href={taxonomyHref("order", orderBranch.node.slug)}>
                  <small>Order</small>
                  <strong>{orderBranch.node.name}</strong>
                  <span>{orderBranch.node.taxonCount}</span>
                </Link>
                <ul className="taxonomy-tree-families">
                  {orderBranch.children.map((familyBranch) => (
                    <li key={familyBranch.node.slug}>
                      <Link
                        href={taxonomyHref("family", familyBranch.node.slug)}
                      >
                        <span>{familyBranch.node.name}</span>
                        <small>
                          {familyBranch.node.taxonCount}{" "}
                          {familyBranch.node.taxonCount === 1
                            ? "taxon"
                            : "taxa"}
                        </small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
