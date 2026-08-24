import Link from "next/link";

import { ScientificIdentification } from "@/components/ScientificIdentification";
import { SubjectImage } from "@/components/SubjectImage";
import type {
  ClassEntry,
  SpecimenCardRecord,
  TaxonCardRecord,
} from "@/domain/catalog/queries";
import {
  formatMeasurement,
  formatPartialDate,
  humanizeToken,
} from "@/domain/content/display";

import { SpecimenQuickView } from "./SpecimenQuickView";
import type { SpeciesMatchSummary } from "./catalogFiltering";
import type { CatalogViewSort } from "./catalogState";

type MeasurementSort = Extract<CatalogViewSort, "skull-length" | "skull-mass">;

export function TaxonCardGrid({
  cards,
  matchSummaries,
  showMatchSummary = false,
  representatives,
  measurementSort,
}: {
  cards: TaxonCardRecord[];
  matchSummaries?: Record<string, SpeciesMatchSummary>;
  showMatchSummary?: boolean;
  representatives?: Record<string, SpecimenCardRecord>;
  measurementSort?: MeasurementSort;
}) {
  return (
    <div className="catalog-grid">
      {cards.map((card) => (
        <TaxonCard
          key={card.taxon.taxonId}
          card={card}
          matchSummary={matchSummaries?.[card.taxon.taxonId]}
          showMatchSummary={showMatchSummary}
          representative={representatives?.[card.taxon.taxonId]}
          measurementSort={measurementSort}
        />
      ))}
    </div>
  );
}

export function TaxonCard({
  card,
  matchSummary,
  showMatchSummary = false,
  representative,
  measurementSort,
}: {
  card: TaxonCardRecord;
  matchSummary?: SpeciesMatchSummary;
  showMatchSummary?: boolean;
  representative?: SpecimenCardRecord;
  measurementSort?: MeasurementSort;
}) {
  const { taxon } = card;
  const displayImage = measurementSort
    ? (representative?.image ?? card.image)
    : card.image;
  const displayHref = measurementSort ? representative?.href : card.href;
  const representativeMeasurement =
    measurementSort && representative
      ? representative.specimen.measurements[
          measurementSort === "skull-length" ? "skullLength" : "skullMass"
        ]
      : null;
  const representativeMeasurementRecorded =
    representativeMeasurement?.status === "measured" ||
    representativeMeasurement?.status === "approximate";
  const commonName = taxon.names.english ?? taxon.scientificName;
  const needsQualifier =
    taxon.identificationQualifier !== "confirmed" ||
    taxon.identificationConfidence !== "high";
  return (
    <article className="collection-card taxon-card">
      <Link href={displayHref ?? card.href} className="collection-card-link">
        <div className="collection-card-image">
          {displayImage ? (
            <SubjectImage
              asset={displayImage}
              sizes="(max-width: 48rem) 92vw, (max-width: 80rem) 45vw, 30vw"
            />
          ) : (
            <span className="media-placeholder">
              Lateral view not available
            </span>
          )}
        </div>
        <div className="collection-card-copy">
          <p className="card-overline">
            {taxon.hierarchy.className} ·{" "}
            {taxon.hierarchy.familyName ?? taxon.rank}
          </p>
          <h3>{commonName}</h3>
          <p className="card-scientific-name">
            <ScientificIdentification taxon={taxon} />
          </p>
          {taxon.names.danish ? (
            <p className="card-secondary-name">Danish · {taxon.names.danish}</p>
          ) : null}
          {measurementSort && representative ? (
            <p className="card-sort-representative">
              {representativeMeasurementRecorded && representativeMeasurement
                ? `Largest recorded ${measurementSortLabel(measurementSort)} · ${representative.specimen.specimenId} · ${formatMeasurement(representativeMeasurement)}`
                : `${measurementSortLabel(measurementSort, true)} not recorded · Default specimen ${representative.specimen.specimenId}`}
            </p>
          ) : null}
          {showMatchSummary && matchSummary ? (
            <p className="card-match-summary">
              {formatSpeciesMatchSummary(matchSummary)}
            </p>
          ) : null}
          <div className="card-meta">
            <span>
              {card.specimenCount}{" "}
              {card.specimenCount === 1 ? "skull" : "skulls"}
            </span>
            {needsQualifier ? (
              <span>
                {humanizeToken(taxon.identificationQualifier)} ·{" "}
                {humanizeToken(taxon.identificationConfidence)} confidence
              </span>
            ) : (
              <span>Confirmed identification</span>
            )}
          </div>
        </div>
      </Link>
      {card.specimenCount > 1 ? (
        <SpecimenQuickView
          specimens={card.specimens}
          defaultSpecimenId={card.defaultSpecimen.specimenId}
        />
      ) : null}
    </article>
  );
}

function measurementSortLabel(
  sort: MeasurementSort,
  sentenceCase = false,
): string {
  const label =
    sort === "skull-length" ? "skull length" : "prepared skull mass";
  return sentenceCase ? `${label[0]?.toUpperCase()}${label.slice(1)}` : label;
}

function formatSpeciesMatchSummary(summary: SpeciesMatchSummary): string {
  const parts = [
    `${summary.matchedCount} of ${summary.totalCount} ${summary.totalCount === 1 ? "specimen" : "specimens"} match`,
  ];
  if (summary.lengthRange) {
    parts.push(`length ${formatRange(summary.lengthRange)} mm`);
  }
  if (summary.massRange) {
    parts.push(`mass ${formatRange(summary.massRange)} g`);
  }
  return parts.join(" · ");
}

function formatRange([minimum, maximum]: [number, number]): string {
  const format = (value: number) =>
    new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
  return minimum === maximum
    ? format(minimum)
    : `${format(minimum)}–${format(maximum)}`;
}

export function SpecimenCard({ card }: { card: SpecimenCardRecord }) {
  const commonName = card.taxon.names.english ?? card.taxon.scientificName;
  return (
    <article className="collection-card specimen-card">
      <Link href={card.href} className="collection-card-link">
        <div className="collection-card-image">
          {card.image ? (
            <SubjectImage
              asset={card.image}
              sizes="(max-width: 48rem) 92vw, (max-width: 80rem) 45vw, 30vw"
            />
          ) : (
            <span className="media-placeholder">
              Lateral view not available
            </span>
          )}
        </div>
        <div className="collection-card-copy">
          <p className="card-overline">{card.specimen.specimenId}</p>
          <h3>{commonName}</h3>
          <p className="card-scientific-name">
            <ScientificIdentification taxon={card.taxon} />
          </p>
          <dl className="card-measurements">
            <div>
              <dt>Max length</dt>
              <dd>
                {formatMeasurement(card.specimen.measurements.skullLength)}
              </dd>
            </div>
            <div>
              <dt>Prepared mass</dt>
              <dd>{formatMeasurement(card.specimen.measurements.skullMass)}</dd>
            </div>
          </dl>
          <p className="card-location">
            {card.specimen.location.label ?? "Location not recorded"} ·{" "}
            {formatPartialDate(card.specimen.acquisitionDate)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function ClassEntryCard({ entry }: { entry: ClassEntry }) {
  return (
    <article className="class-entry-card">
      <Link href={`/taxonomy/class/${entry.node.slug}`}>
        <div className="class-entry-image">
          {entry.representative?.image ? (
            <SubjectImage
              asset={entry.representative.image}
              sizes="(max-width: 48rem) 92vw, 40vw"
            />
          ) : (
            <span className="media-placeholder">No representative image</span>
          )}
        </div>
        <div>
          <p className="card-overline">Class</p>
          <h3>{entry.node.name}</h3>
          <p>
            {entry.node.taxonCount}{" "}
            {entry.node.taxonCount === 1 ? "taxon" : "taxa"} ·{" "}
            {entry.node.specimenCount}{" "}
            {entry.node.specimenCount === 1 ? "specimen" : "specimens"}
          </p>
        </div>
      </Link>
    </article>
  );
}
