import { MuseumShell } from "@/components/MuseumShell";
import { getRelatedTaxa } from "@/data/catalog";
import { getEligibleSkullComparisons } from "@/data/comparison";
import type { ExhibitRecord } from "@/data/collection";
import { humanizeToken } from "@/domain/content/display";
import { RelatedTaxa } from "@/features/catalog/RelatedTaxa";

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
  const comparisonRecords = getEligibleSkullComparisons();
  const comparisonPrimary =
    comparisonRecords.find(
      (record) => record.specimenId === specimen.specimenId,
    ) ?? null;
  const comparisonOptions = comparisonRecords.filter(
    (record) => record.id !== comparisonPrimary?.id,
  );
  const defaultComparisonId =
    comparisonOptions.find((record) => record.isDefault)?.id ??
    comparisonOptions[0]?.id ??
    null;
  const suggestions = getRelatedTaxa(taxon.taxonId);

  return (
    <MuseumShell
      activePath="/species"
      footerContext={`${taxon.names.english ?? taxon.scientificName} · ${specimen.specimenId}`}
      mainClassName="exhibit-shell"
    >
      <TaxonomyBreadcrumb
        taxon={taxon}
        specimenId={exactSpecimen ? specimen.specimenId : undefined}
      />
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
            {exactSpecimen ? "Exact specimen record" : "Default taxon display"}
            <strong>{specimen.specimenId}</strong>
          </p>
        </div>
      </section>

      <Gallery assets={media} commonName={commonName} />
      <SpecimenSelector
        taxon={taxon}
        specimens={specimens}
        selectedSpecimenId={specimen.specimenId}
        exactSpecimen={exactSpecimen}
      />
      <MeasurementPanel
        taxon={taxon}
        specimen={specimen}
        comparisonPrimary={comparisonPrimary}
        comparisonOptions={comparisonOptions}
        defaultComparisonId={defaultComparisonId}
      />

      <section
        className="record-grid content-section"
        aria-label="Specimen record"
      >
        <CollectionRecord specimen={specimen} />
        <PreparationTimeline specimen={specimen} />
      </section>
      <RelatedTaxa suggestions={suggestions} />
    </MuseumShell>
  );
}
