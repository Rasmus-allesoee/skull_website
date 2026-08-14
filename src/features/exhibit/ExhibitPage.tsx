import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import type { ExhibitRecord } from "@/data/collection";
import { humanizeToken } from "@/domain/content/display";

import { CollectionRecord } from "./CollectionRecord";
import { Gallery } from "./Gallery";
import { MeasurementPanel } from "./MeasurementPanel";
import { PreparationTimeline } from "./PreparationTimeline";
import { SpecimenSelector } from "./SpecimenSelector";
import { TaxonomyBreadcrumb } from "./TaxonomyBreadcrumb";

export function ExhibitPage({
  exhibit,
  exactSpecimen,
}: {
  exhibit: ExhibitRecord;
  exactSpecimen: boolean;
}) {
  const { taxon, specimen, specimens, media } = exhibit;
  const commonName = taxon.names.english ?? taxon.scientificName;

  return (
    <div className="site-shell exhibit-shell">
      <header className="site-header" aria-label="Site header">
        <Link className="wordmark" href="/">
          Skull Collection
        </Link>
        <span className="phase-label">Phase 2 · Curator review</span>
      </header>

      <main id="main-content">
        <TaxonomyBreadcrumb taxon={taxon} />
        <section className="exhibit-intro" aria-labelledby="exhibit-title">
          <div className="identity-block">
            <p className="eyebrow">
              {taxon.hierarchy.className} · {taxon.hierarchy.orderName}
            </p>
            <h1 id="exhibit-title">{commonName}</h1>
            <p className="scientific-name">
              <i>{taxon.scientificName}</i>
            </p>
            {taxon.names.danish ? (
              <p className="danish-name">Danish · {taxon.names.danish}</p>
            ) : null}
          </div>
          <div className="status-block">
            <span className="status-badge">
              {humanizeToken(taxon.identificationQualifier)} identification
            </span>
            <span className="status-badge">
              {humanizeToken(taxon.identificationConfidence)} confidence
            </span>
            <p>
              {exactSpecimen
                ? "Exact specimen record"
                : "Default taxon display"}
              <strong>{specimen.specimenId}</strong>
            </p>
          </div>
        </section>

        <Gallery assets={media} commonName={commonName} />
        <SpecimenSelector
          taxon={taxon}
          specimens={specimens}
          selectedSpecimenId={specimen.specimenId}
        />
        <MeasurementPanel specimen={specimen} />

        <section
          className="record-grid content-section"
          aria-label="Specimen record"
        >
          <CollectionRecord specimen={specimen} />
          <PreparationTimeline specimen={specimen} />
        </section>
      </main>

      <SiteFooter context="Skull Collection · Validated vertical slice" />
    </div>
  );
}
