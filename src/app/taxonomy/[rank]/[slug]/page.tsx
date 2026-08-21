import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getRankLanding, getTaxonomyStaticParams } from "@/data/catalog";
import {
  pluralizeTaxonomyRank,
  taxonomyHref,
  taxonomyRanks,
  type TaxonomyRank,
} from "@/domain/catalog/queries";
import { TaxonCardGrid } from "@/features/catalog/CatalogCards";
import { FamilyGroupedTaxonGallery } from "@/features/catalog/FamilyGroupedTaxonGallery";
import { TaxonomyIndex } from "@/features/catalog/TaxonomyIndex";

interface TaxonomyPageProps {
  params: Promise<{ rank: string; slug: string }>;
}

export function generateStaticParams() {
  return getTaxonomyStaticParams();
}

export async function generateMetadata({
  params,
}: TaxonomyPageProps): Promise<Metadata> {
  const { rank, slug } = await params;
  if (!isTaxonomyRank(rank)) return {};
  const landing = getRankLanding(rank, slug);
  if (!landing) return {};
  return createPageMetadata({
    title: `${landing.node.name} ${landing.node.rank}`,
    description: `Browse ${landing.node.taxonCount} published skull ${landing.node.taxonCount === 1 ? "taxon" : "taxa"} within ${landing.node.name}.`,
    path: taxonomyHref(landing.node.rank, landing.node.slug),
    image: landing.taxa[0]?.image?.publicPath,
  });
}

export default async function TaxonomyPage({ params }: TaxonomyPageProps) {
  const { rank, slug } = await params;
  if (!isTaxonomyRank(rank)) notFound();
  const landing = getRankLanding(rank, slug);
  if (!landing) notFound();
  const descendants = Object.values(landing.descendantGroups).flat();

  return (
    <MuseumShell
      activePath="/species"
      footerContext={`${landing.node.name} · ${humanizeRank(landing.node.rank)} landing`}
      mainClassName="taxonomy-page"
    >
      <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/species">Species</Link>
          </li>
          {landing.ancestors.map((ancestor) => (
            <li key={`${ancestor.rank}:${ancestor.slug}`}>
              <Link href={taxonomyHref(ancestor.rank, ancestor.slug)}>
                {ancestor.name}
              </Link>
            </li>
          ))}
          <li aria-current="page">{landing.node.name}</li>
        </ol>
      </nav>

      <header className="page-intro taxonomy-intro">
        <p className="eyebrow">{humanizeRank(landing.node.rank)}</p>
        <h1>{landing.node.name}</h1>
        <p>
          {landing.node.taxonCount} published{" "}
          {landing.node.taxonCount === 1 ? "taxon" : "taxa"} and{" "}
          {landing.node.specimenCount} physical{" "}
          {landing.node.specimenCount === 1 ? "specimen" : "specimens"} in this
          part of the collection.
        </p>
      </header>

      {landing.children.length > 0 ? (
        <section
          className="rank-children"
          aria-labelledby="rank-children-title"
        >
          <div className="section-heading compact-section-heading">
            <p className="section-kicker">Next rank</p>
            <h2 id="rank-children-title">
              Browse {pluralizeTaxonomyRank(landing.children[0]!.rank)}
            </h2>
          </div>
          <ul>
            {landing.children.map((child) => (
              <li key={`${child.rank}:${child.slug}`}>
                <Link href={taxonomyHref(child.rank, child.slug)}>
                  <strong>{child.name}</strong>
                  <span>
                    {child.taxonCount}{" "}
                    {child.taxonCount === 1 ? "taxon" : "taxa"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <TaxonomyIndex
        nodes={descendants}
        heading={`Taxonomy within ${landing.node.name}`}
      />

      <section
        className="catalog-results content-section"
        aria-labelledby="rank-gallery-title"
      >
        <div className="catalog-results-heading">
          <div>
            <p className="section-kicker">Scoped gallery</p>
            <h2 id="rank-gallery-title">Skulls in {landing.node.name}</h2>
          </div>
          <p>
            {landing.taxa.length}{" "}
            {landing.taxa.length === 1 ? "result" : "results"}
          </p>
        </div>
        {landing.node.rank === "class" || landing.node.rank === "order" ? (
          <FamilyGroupedTaxonGallery cards={landing.taxa} />
        ) : (
          <TaxonCardGrid cards={landing.taxa} />
        )}
      </section>
    </MuseumShell>
  );
}

function isTaxonomyRank(value: string): value is TaxonomyRank {
  return (taxonomyRanks as readonly string[]).includes(value);
}

function humanizeRank(rank: TaxonomyRank) {
  return rank.charAt(0).toUpperCase() + rank.slice(1);
}
