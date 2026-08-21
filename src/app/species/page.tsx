import Link from "next/link";

import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getCatalog } from "@/data/catalog";
import { ClassEntryCard } from "@/features/catalog/CatalogCards";
import { FamilyGroupedTaxonGallery } from "@/features/catalog/FamilyGroupedTaxonGallery";
import { TaxonomyIndex } from "@/features/catalog/TaxonomyIndex";
import { TaxonomyTree } from "@/features/catalog/TaxonomyTree";

export const metadata = createPageMetadata({
  title: "Species catalog",
  description:
    "Browse published animal skull taxa and physical specimens through their reviewed taxonomy.",
  path: "/species",
});

export default function SpeciesCatalogPage() {
  const catalog = getCatalog();
  return (
    <MuseumShell
      activePath="/species"
      footerContext="Species catalog · Published records only"
      mainClassName="catalog-page"
    >
      <header className="page-intro catalog-intro">
        <p className="eyebrow">Collection catalog</p>
        <h1>Species</h1>
        <p>
          Browse {catalog.taxonCount} published{" "}
          {catalog.taxonCount === 1 ? "taxon" : "taxa"} represented by{" "}
          {catalog.specimenCount} physical{" "}
          {catalog.specimenCount === 1 ? "specimen" : "specimens"}. Every taxon
          opens its reviewed default skull; every specimen keeps an exact
          permanent link.
        </p>
      </header>

      <section
        className="catalog-discovery"
        aria-labelledby="catalog-discovery-title"
      >
        <div className="section-heading">
          <p className="section-kicker">Find a skull</p>
          <h2 id="catalog-discovery-title">
            Begin with a name or the taxonomy.
          </h2>
          <p>
            Scientific, English, and Danish names are indexed in the collection.
            Name search and faceted controls arrive in Phase 4; every published
            record can be browsed below now.
          </p>
        </div>
        <Link className="catalog-entry" href="#published-displays">
          <span>Scientific, English, or Danish name</span>
          <strong>Browse all displays ↓</strong>
        </Link>
      </section>

      <section
        className="catalog-class-section"
        aria-labelledby="catalog-classes-title"
      >
        <div className="section-heading compact-section-heading">
          <p className="section-kicker">Browse by class</p>
          <h2 id="catalog-classes-title">Collection classes</h2>
        </div>
        <div className="class-entry-grid">
          {catalog.classEntries.map((entry) => (
            <ClassEntryCard key={entry.node.slug} entry={entry} />
          ))}
        </div>
      </section>

      <section
        className="catalog-tree-section content-section"
        aria-labelledby="catalog-tree-title"
      >
        <div className="section-heading compact-section-heading">
          <p className="section-kicker">Systematic browsing</p>
          <h2 id="catalog-tree-title">Explore the collection hierarchy.</h2>
          <p>
            Follow the published collection from class to order and family.
            Every branch uses the same canonical taxonomy and stable routes as
            the list and galleries.
          </p>
        </div>
        <TaxonomyTree branches={catalog.taxonomyTree} />
      </section>

      <details className="taxonomy-list-alternative">
        <summary>
          <span>
            <strong>Ordinary taxonomy list</strong>
            <small>
              Open the complete class, order, family, and genus alternative
            </small>
          </span>
        </summary>
        <TaxonomyIndex
          nodes={catalog.taxonomyNodes}
          heading="Complete taxonomy list"
        />
      </details>

      <section
        id="published-displays"
        className="catalog-results content-section"
        aria-labelledby="catalog-results-title"
      >
        <div className="catalog-results-heading">
          <div>
            <p className="section-kicker">Published displays</p>
            <h2 id="catalog-results-title">All species</h2>
          </div>
          <p>
            {catalog.taxa.length}{" "}
            {catalog.taxa.length === 1 ? "result" : "results"}
            {" · Sorted by common name"}
          </p>
        </div>
        <FamilyGroupedTaxonGallery cards={catalog.taxa} />
      </section>
    </MuseumShell>
  );
}
