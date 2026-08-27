import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getCatalog } from "@/data/catalog";
import { CatalogExplorer } from "@/features/catalog/CatalogExplorer";
import { CatalogTaxonomyFallback } from "@/features/catalog/CatalogTaxonomy";

export const metadata = createPageMetadata({
  title: "Species catalog",
  description:
    "Search and filter photographed animal skull taxa and physical specimens through reviewed names, taxonomy, and measurements.",
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
      <header className="catalog-heading">
        <div>
          <p className="eyebrow">Collection catalog</p>
          <h1>Species</h1>
        </div>
        <p>
          Search and browse {catalog.taxonCount} photographed taxa represented
          by {catalog.specimenCount} physical specimens. Switch modes to inspect
          one taxon per card or every individually recorded skull.
        </p>
      </header>

      <CatalogExplorer catalog={catalog} />

      <noscript>
        <div className="catalog-no-script-note">
          <p>
            Interactive search and filters require JavaScript. Every published
            card and permanent record link remains available below.
          </p>
          <CatalogTaxonomyFallback branches={catalog.taxonomyBrowserTree} />
        </div>
      </noscript>
    </MuseumShell>
  );
}
