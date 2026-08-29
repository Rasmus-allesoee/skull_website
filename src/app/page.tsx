import Link from "next/link";

import { MuseumShell } from "@/components/MuseumShell";
import { SubjectImage } from "@/components/SubjectImage";
import { createPageMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site";
import { getCatalog, getGeographicSpecimens } from "@/data/catalog";
import { ClassEntryCard } from "@/features/catalog/CatalogCards";
import { TaxonomyTree } from "@/features/catalog/TaxonomyTree";

export const metadata = createPageMetadata({
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  const catalog = getCatalog();
  const featured =
    catalog.taxa.find(
      ({ taxon }) => taxon.taxonId === siteConfig.featuredTaxonId,
    ) ?? catalog.taxa[0];
  const geographicSpecimens = getGeographicSpecimens();
  const geographicPreview = geographicSpecimens.slice(0, 4);

  return (
    <MuseumShell
      activePath="/"
      footerContext={`${catalog.taxonCount} published ${catalog.taxonCount === 1 ? "taxon" : "taxa"} · ${catalog.specimenCount} physical ${catalog.specimenCount === 1 ? "specimen" : "specimens"}`}
    >
      <section className="museum-hero" aria-labelledby="hero-title">
        <div className="museum-hero-copy">
          <p className="eyebrow">Online natural-history museum</p>
          <h1 id="hero-title">{siteConfig.shortDescription}</h1>
          <p>
            Explore real skulls through high-resolution photography, stable
            taxonomy, physical measurements, and transparent collection records.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/species">
              Explore the collection
            </Link>
            {featured ? (
              <Link className="text-link" href={featured.href}>
                View featured skull →
              </Link>
            ) : null}
          </div>
        </div>
        <div className="museum-hero-visual" aria-label="Featured skull">
          <div className="hero-light" aria-hidden="true" />
          {featured?.image ? (
            <SubjectImage
              asset={featured.image}
              priority
              sizes="(max-width: 48rem) 92vw, 54vw"
            />
          ) : (
            <p className="media-placeholder">No featured image is available.</p>
          )}
          {featured ? (
            <p className="featured-caption">
              Featured ·{" "}
              {featured.taxon.names.english ?? featured.taxon.scientificName}
              <span>{featured.defaultSpecimen.specimenId}</span>
            </p>
          ) : null}
        </div>
      </section>

      <section className="collection-summary" aria-label="Collection summary">
        <div>
          <strong>{catalog.rankCounts.species}</strong>
          <span>Published species</span>
        </div>
        <div>
          <strong>{catalog.specimenCount}</strong>
          <span>
            Physical {catalog.specimenCount === 1 ? "specimen" : "specimens"}
          </span>
        </div>
        <div>
          <strong>{catalog.rankCounts.classes}</strong>
          <span>Represented classes</span>
        </div>
        <div>
          <strong>{catalog.rankCounts.orders}</strong>
          <span>Represented orders</span>
        </div>
        <div>
          <strong>{catalog.rankCounts.families}</strong>
          <span>Represented families</span>
        </div>
        <div>
          <strong>{catalog.rankCounts.genera}</strong>
          <span>Represented genera</span>
        </div>
      </section>

      <section
        className="home-discovery content-section"
        aria-labelledby="discover-title"
      >
        <div className="section-heading">
          <p className="section-kicker">Find a skull</p>
          <h2 id="discover-title">Begin with a name or the taxonomy.</h2>
          <p>
            Scientific, English, and Danish names are retained in the catalog.
            Search, ranked suggestions, taxonomy, feature filters, and
            measurement ranges now share one visual collection browser.
          </p>
        </div>
        <Link className="catalog-entry" href="/species#catalog-search">
          <span>Scientific, English, or Danish name</span>
          <strong>Browse the catalog →</strong>
        </Link>
      </section>

      <section
        className="home-classes content-section"
        aria-labelledby="classes-title"
      >
        <div className="section-heading compact-section-heading">
          <p className="section-kicker">Browse by class</p>
          <h2 id="classes-title">Enter the collection systematically.</h2>
        </div>
        <div className="class-entry-grid">
          {catalog.classEntries.map((entry) => (
            <ClassEntryCard key={entry.node.slug} entry={entry} />
          ))}
        </div>
      </section>

      <section
        className="home-taxonomy-tree content-section"
        aria-labelledby="home-tree-title"
      >
        <div className="section-heading compact-section-heading">
          <p className="section-kicker">Collection tree</p>
          <h2 id="home-tree-title">Follow class, order, and family.</h2>
          <p>
            This compact hierarchy links directly to each published catalog
            group. The complete species list remains available in the catalog.
          </p>
        </div>
        <TaxonomyTree branches={catalog.taxonomyTree} compact />
      </section>

      <section
        className="home-map-preview content-section"
        aria-labelledby="map-preview-title"
      >
        <div className="section-heading">
          <p className="section-kicker">Geographic records</p>
          <h2 id="map-preview-title">A collection rooted in place.</h2>
          <p>
            Explore reviewed public specimen locations, geographic uncertainty,
            and every corresponding physical record on the collection map.
          </p>
        </div>
        <div className="map-preview-card">
          <div className="map-preview-field" aria-hidden="true">
            <span />
          </div>
          <ul>
            {geographicPreview.map(({ specimen, taxon, href }) => (
              <li key={specimen.specimenId}>
                <Link href={href}>
                  <strong>{taxon.names.english ?? taxon.scientificName}</strong>
                  <span>
                    {specimen.location.label} · {specimen.location.precision}{" "}
                    location
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p>
            Previewing {geographicPreview.length} of{" "}
            {geographicSpecimens.length} georeferenced specimens ·{" "}
            <Link href="/map">Open collection map</Link>
          </p>
        </div>
      </section>

      <section
        className="editorial-prompts content-section"
        aria-labelledby="editorial-title"
      >
        <div className="section-heading compact-section-heading">
          <p className="section-kicker">Behind the collection</p>
          <h2 id="editorial-title">Methods, records, and preparation.</h2>
        </div>
        <div className="editorial-prompt-grid">
          <article>
            <p className="card-overline">Guide outline</p>
            <h3>Skull preparation</h3>
            <p>
              Review the planned structure for defleshing, degreasing,
              whitening, and documentation.
            </p>
            <Link className="text-link" href="/guides/skull-preparation">
              Open the guide outline →
            </Link>
          </article>
          <article>
            <p className="card-overline">Methodology</p>
            <h3>Evidence before publication</h3>
            <p>
              Taxonomy, measurements, locations, rights, and missing values are
              validated before a record becomes public.
            </p>
            <span className="availability-note">
              Full methodology is planned for a later editorial release
            </span>
          </article>
        </div>
      </section>
    </MuseumShell>
  );
}
