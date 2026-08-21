import Link from "next/link";

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

export function TaxonCardGrid({ cards }: { cards: TaxonCardRecord[] }) {
  return (
    <div className="catalog-grid">
      {cards.map((card) => (
        <TaxonCard key={card.taxon.taxonId} card={card} />
      ))}
    </div>
  );
}

export function TaxonCard({ card }: { card: TaxonCardRecord }) {
  const { taxon } = card;
  const commonName = taxon.names.english ?? taxon.scientificName;
  const needsQualifier =
    taxon.identificationQualifier !== "confirmed" ||
    taxon.identificationConfidence !== "high";
  return (
    <article className="collection-card taxon-card">
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
          <p className="card-overline">
            {taxon.hierarchy.className} ·{" "}
            {taxon.hierarchy.familyName ?? taxon.rank}
          </p>
          <h3>{commonName}</h3>
          <p className="card-scientific-name">
            <i>{taxon.scientificName}</i>
          </p>
          {taxon.names.danish ? (
            <p className="card-secondary-name">Danish · {taxon.names.danish}</p>
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
    </article>
  );
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
            <i>{card.taxon.scientificName}</i>
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
