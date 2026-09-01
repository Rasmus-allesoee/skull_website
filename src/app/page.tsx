import Link from "next/link";

import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site";
import { getHomePageModel } from "@/data/home";
import {
  ComparisonCardPreview,
  HomeMapPreview,
  MeasurementCardPreview,
  PreparationCardPreview,
  SpeciesCardPreview,
} from "@/features/home/HomePreviews";
import { SpecimenField } from "@/features/home/SpecimenField";

export const metadata = createPageMetadata({
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  const model = getHomePageModel();
  const { catalog } = model;
  const preparationImage = model.homeMedia.assets.find(
    (asset) => asset.assetId === "preparation-field-skull",
  );
  const measurementDiagram =
    model.measurementReference.diagrams.find(
      (diagram) => diagram.id === "lateral-skull",
    ) ?? model.measurementReference.diagrams[0];
  const comparisonReference = model.comparisons.find(
    (record) => record.kind === "reference" && record.isDefault,
  );
  const comparisonSpecimen = model.comparisons.find(
    (record) => record.kind === "specimen",
  );
  const speciesPreview = [
    catalog.specimens[0],
    catalog.specimens[Math.floor(catalog.specimens.length / 2)],
    catalog.specimens.at(-1),
  ].filter((record) => record !== undefined);

  return (
    <MuseumShell
      activePath="/"
      footerContext={`${catalog.taxonCount} published ${catalog.taxonCount === 1 ? "taxon" : "taxa"} · ${catalog.specimenCount} physical ${catalog.specimenCount === 1 ? "specimen" : "specimens"}`}
      mainClassName="home-page"
    >
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="eyebrow">Online natural-history museum</p>
          <h1 id="home-title">{siteConfig.shortDescription}</h1>
          <p>
            Explore real animal skulls through high-resolution photography,
            stable taxonomy, physical measurements, and transparent collection
            records.
          </p>
          <Link className="primary-link home-primary-link" href="/species">
            Explore the collection <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="home-hero-field" aria-label="Published specimen field">
          <SpecimenField states={model.heroStates} />
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

      <section className="home-explore" aria-labelledby="home-explore-title">
        <header className="home-explore-heading">
          <p className="section-kicker">Explore the collection</p>
          <h2 id="home-explore-title">Choose how you want to look.</h2>
          <p>
            Browse the photography, trace reviewed locations, or open the
            collection’s measurement and preparation references.
          </p>
        </header>

        <div className="home-hub-grid">
          <article className="home-hub-card home-hub-card-species">
            <Link href="/species" aria-label="Explore the Species catalog">
              <div className="home-hub-copy">
                <p className="card-overline">Primary collection</p>
                <h3>Species catalog</h3>
                <p>
                  Search scientific, English, and Danish names, or browse the
                  published taxonomy and physical specimens.
                </p>
                <span className="home-card-action">Explore species →</span>
              </div>
              <SpeciesCardPreview specimens={speciesPreview} />
            </Link>
          </article>

          <article className="home-hub-card home-hub-card-map">
            <Link href="/map" aria-label="Open the collection map">
              <div className="home-hub-copy">
                <p className="card-overline">Geographic records</p>
                <h3>Collection map</h3>
                <p>
                  Connect physical specimens with their reviewed public
                  locations and recorded geographic precision.
                </p>
                <span className="home-card-action">Open collection map →</span>
              </div>
              <HomeMapPreview specimens={model.geographicSpecimens} />
            </Link>
          </article>

          {measurementDiagram ? (
            <article className="home-hub-card home-hub-card-measurements">
              <Link
                href="/methodology"
                aria-label="Open the measurement reference"
              >
                <div className="home-hub-copy">
                  <p className="card-overline">Illustrated reference</p>
                  <h3>Measurements</h3>
                  <p>
                    Match the collection’s measurement vocabulary to exact
                    landmarks across five real-skull views.
                  </p>
                  <span className="home-card-action">View measurements →</span>
                </div>
                <MeasurementCardPreview diagram={measurementDiagram} />
              </Link>
            </article>
          ) : null}

          {preparationImage ? (
            <article className="home-hub-card home-hub-card-preparation">
              <Link
                href="/guides/skull-preparation"
                aria-label="Open the skull preparation guide outline"
              >
                <div className="home-hub-copy">
                  <p className="card-overline">From recovery to record</p>
                  <h3>Preparation guide</h3>
                  <p>
                    See the planned guide structure for turning a recovered
                    skull into a documented collection specimen.
                  </p>
                  <span className="home-card-action">
                    Open preparation guide →
                  </span>
                </div>
                <PreparationCardPreview asset={preparationImage} />
              </Link>
            </article>
          ) : null}

          <article className="home-hub-card home-hub-card-comparison">
            <div className="home-hub-copy">
              <p className="card-overline">Calibrated comparison</p>
              <div className="home-comparison-title-row">
                <h3>Skull Comparison</h3>
                <span className="coming-soon-label">Coming soon</span>
              </div>
              <p>
                Compare skulls at a shared physical scale and inspect their
                class-aware measurement differences in one dedicated workspace.
              </p>
              <span className="home-card-status">
                Preview based on the current specimen comparison engine
              </span>
            </div>
            {comparisonReference && comparisonSpecimen ? (
              <ComparisonCardPreview
                specimen={comparisonSpecimen}
                reference={comparisonReference}
              />
            ) : null}
          </article>
        </div>
      </section>
    </MuseumShell>
  );
}
