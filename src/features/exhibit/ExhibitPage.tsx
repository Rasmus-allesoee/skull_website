import Link from "next/link";

import type { ExhibitRecord } from "@/data/collection";
import {
  formatCoordinate,
  formatPartialDate,
  humanizeToken,
} from "@/domain/content/display";

import { Gallery } from "./Gallery";
import { MeasurementPanel } from "./MeasurementPanel";
import { PreparationTimeline } from "./PreparationTimeline";
import { Profile } from "./Profile";
import { SpecimenSelector } from "./SpecimenSelector";
import { TaxonomyBreadcrumb } from "./TaxonomyBreadcrumb";

export function ExhibitPage({
  exhibit,
  exactSpecimen,
}: {
  exhibit: ExhibitRecord;
  exactSpecimen: boolean;
}) {
  const { taxon, specimen, specimens, media, profile } = exhibit;
  const commonName = taxon.names.english ?? taxon.scientificName;
  const coordinates =
    specimen.location.latitude !== null && specimen.location.longitude !== null
      ? `${formatCoordinate(specimen.location.latitude, "latitude")}, ${formatCoordinate(specimen.location.longitude, "longitude")}`
      : null;

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
                : "Default taxon exhibit"}
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
        <Profile profile={profile} />
        <MeasurementPanel specimen={specimen} />

        <section
          className="record-grid content-section"
          aria-label="Specimen record"
        >
          <section className="record-panel" aria-labelledby="provenance-title">
            <p className="section-kicker">Provenance</p>
            <h2 id="provenance-title">Collection record</h2>
            <dl className="data-list">
              <div>
                <dt>Specimen ID</dt>
                <dd>{specimen.specimenId}</dd>
              </div>
              <div>
                <dt>Acquisition source</dt>
                <dd>{humanizeToken(specimen.acquisitionSource)}</dd>
              </div>
              <div>
                <dt>Acquisition date</dt>
                <dd>{formatPartialDate(specimen.acquisitionDate)}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{specimen.location.label ?? "Not recorded"}</dd>
              </div>
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {coordinates ?? "Not recorded"}
                  {coordinates ? (
                    <small>
                      Approximate · uncertainty radius{" "}
                      {specimen.location.uncertaintyM?.toLocaleString("en")} m
                    </small>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt>Sex</dt>
                <dd>{humanizeToken(specimen.sex)}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>
                  {humanizeToken(specimen.ageClass)}
                  {specimen.ageDetail ? (
                    <small>{specimen.ageDetail}</small>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt>Condition</dt>
                <dd>
                  {humanizeToken(specimen.condition)}
                  {specimen.distinguishingFeatures ? (
                    <small>{specimen.distinguishingFeatures}</small>
                  ) : null}
                </dd>
              </div>
            </dl>
          </section>
          <PreparationTimeline specimen={specimen} />
        </section>

        <section
          className="rights-panel content-section"
          aria-labelledby="rights-title"
        >
          <div>
            <p className="section-kicker">Rights and credit</p>
            <h2 id="rights-title">Documented, not released for reuse.</h2>
          </div>
          <dl className="data-list">
            <div>
              <dt>Specimen</dt>
              <dd>{specimen.rights.specimenCredit}</dd>
            </div>
            <div>
              <dt>Photography</dt>
              <dd>{specimen.rights.mediaCredit}</dd>
            </div>
            <div>
              <dt>Media and collection data</dt>
              <dd>All rights reserved</dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className="site-footer">
        <p>Skull Collection · Validated vertical slice</p>
        <p>
          <Link href="/">Back to project entrance</Link>
        </p>
      </footer>
    </div>
  );
}
