import Link from "next/link";

import { formatPartialDate } from "@/domain/content/display";
import type { MapRecord } from "@/domain/map/types";

import { MapThumbnail } from "./MapThumbnail";

export function MapResultList({
  mapped,
  notMapped,
  selectedSpecimenId,
  onSelect,
  onClose,
  mobileOpen,
  desktopOpen,
}: {
  mapped: MapRecord[];
  notMapped: MapRecord[];
  selectedSpecimenId: string | null;
  onSelect: (specimenId: string) => void;
  onClose: () => void;
  mobileOpen: boolean;
  desktopOpen: boolean;
}) {
  const total = mapped.length + notMapped.length;
  return (
    <aside
      id="map-results"
      className={`map-results ${mobileOpen ? "is-open" : ""} ${desktopOpen ? "" : "is-desktop-hidden"}`}
      aria-label="Map specimen records"
    >
      <header>
        <div>
          <p className="card-overline">Published records</p>
          <h2>
            {total} matching {total === 1 ? "specimen" : "specimens"}
          </h2>
          <p>
            {mapped.length} mapped · {notMapped.length} without public
            coordinates
          </p>
        </div>
        <button type="button" className="map-results-close" onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span className="visually-hidden">Close specimen records</span>
        </button>
      </header>
      <div className="map-results-scroll">
        <ResultGroup
          heading="Mapped specimens"
          records={mapped}
          selectedSpecimenId={selectedSpecimenId}
          onSelect={onSelect}
          mapped
        />
        {notMapped.length ? (
          <ResultGroup
            heading="Not mapped"
            records={notMapped}
            selectedSpecimenId={selectedSpecimenId}
            onSelect={onSelect}
            mapped={false}
          />
        ) : null}
        {total === 0 ? (
          <div className="map-results-empty">
            <h3>No matching records</h3>
            <p>
              Clear the current search or filters to recover the collection.
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function ResultGroup({
  heading,
  records,
  selectedSpecimenId,
  onSelect,
  mapped,
}: {
  heading: string;
  records: MapRecord[];
  selectedSpecimenId: string | null;
  onSelect: (specimenId: string) => void;
  mapped: boolean;
}) {
  if (!records.length) return null;
  return (
    <section
      className="map-result-group"
      aria-labelledby={`map-${mapped ? "mapped" : "unmapped"}-title`}
    >
      <h3 id={`map-${mapped ? "mapped" : "unmapped"}-title`}>
        {heading} <span>{records.length}</span>
      </h3>
      <ul>
        {records.map((record) => {
          const selected = record.specimenId === selectedSpecimenId;
          return (
            <li
              key={record.specimenId}
              className={selected ? "is-selected" : ""}
            >
              <article aria-current={selected ? "true" : undefined}>
                <button
                  type="button"
                  className="map-result-select"
                  onClick={() => onSelect(record.specimenId)}
                  disabled={!mapped}
                  aria-label={
                    mapped
                      ? `Show ${record.commonName}, ${record.specimenId}, on map`
                      : undefined
                  }
                >
                  <span className="map-result-identity">
                    <strong>{record.commonName}</strong>
                    <span className="map-result-scientific">
                      <i>{record.scientificName}</i>
                      {record.danishName ? (
                        <span className="map-result-danish-name">
                          {" · "}
                          {record.danishName}
                        </span>
                      ) : null}
                    </span>
                    <span>{record.specimenId}</span>
                  </span>
                  <MapThumbnail record={record} />
                </button>
                <div className="map-result-footer">
                  <div className="map-result-meta">
                    <span>
                      {record.locationLabel ?? "Location not recorded"}
                    </span>
                    <time>{formatPartialDate(record.acquisitionDate)}</time>
                  </div>
                  <Link href={record.specimenHref}>View specimen</Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
