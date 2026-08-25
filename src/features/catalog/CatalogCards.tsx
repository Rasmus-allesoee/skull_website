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
import {
  selectLargestTaxonSpecimenForMeasurement,
  type SpeciesMatchSummary,
  type TaxonMetricSpecimens,
} from "./catalogFiltering";
import type { CatalogViewSort } from "./catalogState";

type MeasurementSort = Extract<CatalogViewSort, "skull-length" | "skull-mass">;

export function TaxonCardGrid({
  cards,
  matchSummaries,
  showMatchSummary = false,
  representatives,
  metricSpecimens,
  measurementSort,
}: {
  cards: TaxonCardRecord[];
  matchSummaries?: Record<string, SpeciesMatchSummary>;
  showMatchSummary?: boolean;
  representatives?: Record<string, SpecimenCardRecord>;
  metricSpecimens?: Record<string, TaxonMetricSpecimens>;
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
          metricSpecimens={metricSpecimens?.[card.taxon.taxonId]}
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
  metricSpecimens,
  measurementSort,
}: {
  card: TaxonCardRecord;
  matchSummary?: SpeciesMatchSummary;
  showMatchSummary?: boolean;
  representative?: SpecimenCardRecord;
  metricSpecimens?: TaxonMetricSpecimens;
  measurementSort?: MeasurementSort;
}) {
  const { taxon } = card;
  const displayImage = measurementSort
    ? (representative?.image ?? card.image)
    : card.image;
  const displayHref = measurementSort ? representative?.href : card.href;
  const commonName = taxon.names.english ?? taxon.scientificName;
  const metricLengthSpecimen =
    metricSpecimens !== undefined
      ? metricSpecimens.skullLength
      : selectLargestTaxonSpecimenForMeasurement(card.specimens, "skullLength");
  const metricMassSpecimen =
    metricSpecimens !== undefined
      ? metricSpecimens.skullMass
      : selectLargestTaxonSpecimenForMeasurement(card.specimens, "skullMass");
  const metricLength = metricLengthSpecimen?.specimen.measurements.skullLength;
  const metricMass = metricMassSpecimen?.specimen.measurements.skullMass;
  const cardHref = displayHref ?? card.href;
  return (
    <article
      className={[
        "collection-card",
        "taxon-card",
        card.specimenCount > 1 && "taxon-card-has-chooser",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Link href={cardHref} className="collection-card-link">
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
          <div className="card-overline card-overline-split">
            <span>
              {taxon.hierarchy.className} ·{" "}
              {taxon.hierarchy.familyName ?? taxon.rank}
            </span>
            {card.specimenCount === 1 ? (
              <span className="card-overline-count">1 skull</span>
            ) : null}
          </div>
          <h3>{commonName}</h3>
          <p className="card-scientific-name">
            <ScientificIdentification taxon={taxon} />
            {taxon.names.danish ? (
              <span className="card-danish-name"> · {taxon.names.danish}</span>
            ) : null}
          </p>
          {showMatchSummary && matchSummary ? (
            <p className="card-match-summary">
              {formatSpeciesMatchSummary(matchSummary)}
            </p>
          ) : null}
          <dl className="card-facts taxon-card-facts">
            <CardFact
              label="Skull length"
              value={
                metricLength ? formatMeasurement(metricLength) : "Not recorded"
              }
              tooltip={metricLengthSpecimen?.specimen.specimenId}
              tooltipId={`${taxon.taxonId}-skull-length-specimen`}
            />
            <CardFact
              label="Skull mass"
              value={
                metricMass ? formatMeasurement(metricMass) : "Not recorded"
              }
              tooltip={metricMassSpecimen?.specimen.specimenId}
              tooltipId={`${taxon.taxonId}-skull-mass-specimen`}
            />
          </dl>
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
          <p className="card-overline card-overline-split">
            <span>
              {card.taxon.hierarchy.className} ·{" "}
              {card.taxon.hierarchy.familyName ?? card.taxon.rank}
            </span>
            <span>{card.specimen.specimenId}</span>
          </p>
          <h3>{commonName}</h3>
          <p className="card-scientific-name">
            <ScientificIdentification taxon={card.taxon} />
            {card.taxon.names.danish ? (
              <span className="card-danish-name">
                {" "}
                · {card.taxon.names.danish}
              </span>
            ) : null}
          </p>
          <dl className="card-facts specimen-card-facts">
            <CardFact
              label="Skull length"
              value={formatMeasurement(card.specimen.measurements.skullLength)}
            />
            <CardFact
              label="Skull mass"
              value={formatMeasurement(card.specimen.measurements.skullMass)}
            />
            <CardFact
              label="Age"
              value={humanizeToken(card.specimen.ageClass)}
            />
            <CardFact label="Sex" value={humanizeToken(card.specimen.sex)} />
            <CardFact
              label="Condition"
              value={humanizeToken(card.specimen.condition)}
            />
            <CardFact
              label="Date"
              value={formatPartialDate(card.specimen.acquisitionDate)}
            />
          </dl>
        </div>
      </Link>
    </article>
  );
}

function CardFact({
  label,
  value,
  tooltip,
  tooltipId,
}: {
  label: string;
  value: string;
  tooltip?: string;
  tooltipId?: string;
}) {
  return (
    <div className={tooltip ? "card-fact-with-tooltip" : undefined}>
      <dt>{label}</dt>
      <dd>
        {tooltip && tooltipId ? (
          <span
            className="card-fact-tooltip-value"
            tabIndex={0}
            title={tooltip}
            aria-describedby={tooltipId}
          >
            {value}
          </span>
        ) : (
          value
        )}
        {tooltip && tooltipId ? (
          <span
            id={tooltipId}
            className="card-fact-tooltip-bubble"
            role="tooltip"
          >
            {tooltip}
          </span>
        ) : null}
      </dd>
    </div>
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
