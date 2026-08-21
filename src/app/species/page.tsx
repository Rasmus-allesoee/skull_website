import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getCatalog } from "@/data/catalog";
import { ClassEntryCard, TaxonCardGrid } from "@/features/catalog/CatalogCards";
import { TaxonomyIndex } from "@/features/catalog/TaxonomyIndex";

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

      <TaxonomyIndex nodes={catalog.taxonomyNodes} />

      <section
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
        <TaxonCardGrid cards={catalog.taxa} />
      </section>
    </MuseumShell>
  );
}
