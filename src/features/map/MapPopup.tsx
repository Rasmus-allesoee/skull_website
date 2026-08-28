import Link from "next/link";

import { formatPartialDate } from "@/domain/content/display";
import type { MapRecord } from "@/domain/map/types";

import { MapThumbnail } from "./MapThumbnail";

export function IndividualMapPopup({
  record,
  onClose,
}: {
  record: MapRecord;
  onClose: () => void;
}) {
  return (
    <section
      className="map-popup-card"
      aria-label={`${record.commonName} map record`}
    >
      <PopupHeader title={record.commonName} onClose={onClose} />
      <MapThumbnail record={record} sizes="240px" cropToSubject />
      <div className="map-popup-copy">
        <i>{record.scientificName}</i>
        <strong>{record.specimenId}</strong>
        <dl>
          <div>
            <dt>Location</dt>
            <dd>{record.locationLabel ?? "N/A"}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{compactDate(record)}</dd>
          </div>
          <div>
            <dt>Precision</dt>
            <dd>
              {record.coordinatePrecision === "exact"
                ? "Exact location"
                : "Approximate location"}
            </dd>
          </div>
          {record.coordinateUncertaintyM &&
          record.coordinateUncertaintyM > 0 ? (
            <div>
              <dt>Uncertainty radius</dt>
              <dd>{formatDistance(record.coordinateUncertaintyM)}</dd>
            </div>
          ) : null}
        </dl>
        <div className="map-popup-actions">
          <Link href={record.specimenHref}>View specimen</Link>
          <Link href={record.taxonHref}>View taxon</Link>
        </div>
      </div>
    </section>
  );
}

export function ClusterMapPopup({
  records,
  onSelect,
  onClose,
}: {
  records: MapRecord[];
  onSelect: (specimenId: string) => void;
  onClose: () => void;
}) {
  return (
    <section
      className="map-popup-card map-cluster-popup"
      aria-label={`${records.length} specimens in this area`}
    >
      <PopupHeader
        title={`${records.length} specimens in this area`}
        onClose={onClose}
      />
      <ul>
        {records.map((record) => (
          <li key={record.specimenId}>
            <button type="button" onClick={() => onSelect(record.specimenId)}>
              <span>
                <strong>{record.commonName}</strong>
                <i>{record.scientificName}</i>
                <small>
                  {record.specimenId} ·{" "}
                  {record.coordinatePrecision === "exact"
                    ? "Exact"
                    : "Approximate"}
                </small>
              </span>
              <MapThumbnail record={record} />
            </button>
            <Link href={record.specimenHref}>View specimen</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PopupHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <header>
      <h2>{title}</h2>
      <button type="button" onClick={onClose}>
        <span aria-hidden="true">×</span>
        <span className="visually-hidden">Close map popup</span>
      </button>
    </header>
  );
}

function compactDate(record: MapRecord) {
  const value = formatPartialDate(record.acquisitionDate);
  if (value === "Not recorded") return "N/A";
  if (record.acquisitionDate.precision === "month") {
    const [month, year] = value.split(" ");
    return `${month?.slice(0, 3)} ${year}`;
  }
  return value;
}

function formatDistance(metres: number) {
  return metres >= 1000
    ? `${new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(metres / 1000)} km`
    : `${new Intl.NumberFormat("en").format(metres)} m`;
}
