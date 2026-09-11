"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getCalibratedCanvasSize } from "@/domain/comparison/calibration";
import {
  calculateMeasurementDifference,
  getComparisonDifferenceRows,
  getComparisonRowMeasurementKey,
} from "@/domain/comparison/scale";
import type {
  ComparisonDifferenceRow,
  SkullComparisonRecord,
  SkullComparisonView,
} from "@/domain/comparison/types";
import type {
  ComparisonMeasurementKey,
  Measurement,
} from "@/domain/content/types";

import {
  getDefaultComparisonState,
  parseComparisonState,
  serializeComparisonState,
  type ComparisonWorkbenchState,
} from "./workbenchState";

const methodologyNumbers: Partial<Record<ComparisonMeasurementKey, number>> = {
  skullLength: 1,
  mandibleLength: 9,
  skullWidth: 12,
  craniumWidth: 13,
  skullHeight: 17,
};

const subjectMarkers = ["●", "■", "▲", "◆", "⬟"] as const;

export function ComparisonWorkbench({
  records,
}: {
  records: SkullComparisonRecord[];
}) {
  const defaults = useMemo(() => getDefaultComparisonState(records), [records]);
  const [state, setState] = useState<ComparisonWorkbenchState>(defaults);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState("");
  const hydrated = useRef(false);
  const recordsById = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );

  useEffect(() => {
    const restore = () => {
      const parsed = parseComparisonState(window.location.search, records);
      setState(parsed.state);
      setWarnings(parsed.warnings);
    };
    restore();
    hydrated.current = true;
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [records]);

  const selected = state.subjects.flatMap((subject) => {
    const record = recordsById.get(subject.id);
    return record ? [{ subject, record }] : [];
  });
  const pair = state.difference
    ? ([
        recordsById.get(state.difference[0]),
        recordsById.get(state.difference[1]),
      ] as const)
    : null;
  const rows =
    pair?.[0] && pair[1]
      ? getComparisonDifferenceRows(
          pair[0].measurementProfile,
          pair[1].measurementProfile,
        )
      : [];
  const visibleRows = state.comparableOnly
    ? rows.filter((row) => isComparableRow(row, pair?.[0], pair?.[1]))
    : rows;

  function commit(next: ComparisonWorkbenchState) {
    setState(next);
    setWarnings([]);
    if (!hydrated.current) return;
    const query = serializeComparisonState(next);
    window.history.pushState(null, "", `${window.location.pathname}?${query}`);
  }

  async function copyLink() {
    const query = serializeComparisonState(state);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("Comparison link copied.");
    } catch {
      setCopyStatus("Copy failed. Select the address from your browser.");
    }
  }

  return (
    <>
      <header className="compare-heading">
        <div>
          <nav aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Compare skulls</span>
          </nav>
          <p className="eyebrow">Comparison workbench</p>
          <h1>Compare skulls</h1>
          <p>
            Arrange calibrated skull views and compare their recorded
            measurements at one shared physical scale.
          </p>
        </div>
        <div className="compare-page-actions">
          <button type="button" onClick={copyLink}>
            Copy link
          </button>
          <details>
            <summary>More</summary>
            <button type="button" onClick={() => window.print()}>
              Print comparison
            </button>
          </details>
          <p className="compare-action-status" aria-live="polite">
            {copyStatus}
          </p>
        </div>
      </header>

      {warnings.length > 0 ? (
        <aside
          className="compare-recovery"
          aria-label="Comparison link recovery"
        >
          <p>Some saved comparison settings could not be restored.</p>
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => commit(getDefaultComparisonState(records))}
          >
            Reset comparison
          </button>
        </aside>
      ) : null}

      <section
        className="compare-workbench"
        aria-label="Skull comparison workspace"
      >
        <aside className="compare-subject-rail" aria-label="Selected skulls">
          <div className="compare-rail-heading">
            <p className="data-label">Selected skulls</p>
            <span>{selected.length}/5</span>
          </div>
          {selected.map(({ record, subject }, index) => (
            <article className="compare-subject-card" key={record.id}>
              <header>
                <span
                  className={`subject-marker marker-${index + 1}`}
                  aria-hidden="true"
                >
                  {subjectMarkers[index]}
                </span>
                <div>
                  <p>Skull {index + 1}</p>
                  <h2>{record.label}</h2>
                </div>
              </header>
              {record.scientificName ? <i>{record.scientificName}</i> : null}
              <p className="compare-subject-meta">
                {record.specimenId ?? "Reviewed reference"}
              </p>
              <ul
                className="compare-view-chips"
                aria-label={`Active views for Skull ${index + 1}`}
              >
                {subject.views.map((view) => (
                  <li key={view}>{formatViewLabel(view)}</li>
                ))}
              </ul>
              {record.href ? (
                <Link href={record.href}>Open specimen record</Link>
              ) : null}
            </article>
          ))}
          <button type="button" className="compare-add-skull" disabled>
            Add skull
            <span>Available in the interactive controls</span>
          </button>
        </aside>

        <section
          className="compare-field-panel"
          aria-labelledby="comparison-field-title"
        >
          <div className="compare-field-toolbar">
            <div>
              <p className="data-label">Shared physical scale</p>
              <h2 id="comparison-field-title">Comparison field</h2>
            </div>
            <p>Field controls activate in the next workbench stage.</p>
          </div>
          <div
            className="comparison-field is-static"
            data-arrangement={state.arrangement}
          >
            {selected.length > 0 ? (
              <div className="comparison-static-layers">
                {selected.flatMap(({ subject, record }, subjectIndex) =>
                  subject.views.flatMap((viewName) => {
                    const view = record.views.find(
                      (candidate) => candidate.view === viewName,
                    );
                    return view ? (
                      <StaticComparisonLayer
                        key={`${record.id}:${view.view}`}
                        record={record}
                        view={view}
                        subjectIndex={subjectIndex}
                      />
                    ) : (
                      []
                    );
                  }),
                )}
              </div>
            ) : (
              <div className="comparison-empty-state">
                <h2>Add a skull to begin</h2>
                <p>Select up to five calibrated specimens or references.</p>
              </div>
            )}
          </div>
          <p className="comparison-scale-note">
            Calibrated relative scale; screen pixels are not physical
            millimetres.
          </p>
        </section>
      </section>

      <section
        className="comparison-measurements"
        aria-labelledby="comparison-measurements-title"
      >
        <div className="comparison-measurements-heading">
          <div>
            <p className="section-kicker">Recorded dimensions</p>
            <h2 id="comparison-measurements-title">Measurements</h2>
          </div>
          <label>
            <input
              type="checkbox"
              checked={state.comparableOnly}
              onChange={(event) =>
                commit({
                  ...state,
                  comparableOnly: event.currentTarget.checked,
                })
              }
            />
            Show only comparable measurements
          </label>
        </div>
        {pair?.[0] && pair[1] ? (
          <ComparisonTable
            selected={selected.map(({ record }) => record)}
            rows={visibleRows}
            primary={pair[0]}
            comparison={pair[1]}
          />
        ) : (
          <p className="comparison-table-empty">
            Add another skull to compare.
          </p>
        )}
        <p className="comparison-row-status" aria-live="polite">
          {visibleRows.length} measurement rows shown.
        </p>
      </section>

      <noscript>
        <p className="compare-no-script">
          Interactive arrangement and custom shared comparisons require
          JavaScript. The approved default pair and its complete measurement
          table remain available above.
        </p>
      </noscript>
    </>
  );
}

function StaticComparisonLayer({
  record,
  view,
  subjectIndex,
}: {
  record: SkullComparisonRecord;
  view: SkullComparisonView;
  subjectIndex: number;
}) {
  const measurement = record.measurements[view.calibration.measurementKey];
  const size = getCalibratedCanvasSize({
    sourceWidth: view.width,
    sourceHeight: view.height,
    calibration: view.calibration,
    measurement,
    worldPixelsPerMillimetre: 1,
  });
  if (!size) return null;
  const style = {
    "--layer-width": `${size.width}px`,
    "--layer-height": `${size.height}px`,
  } as CSSProperties;
  return (
    <figure className="comparison-static-layer" style={style}>
      <div className="comparison-static-image">
        <Image
          src={view.publicPath}
          alt={view.alt}
          fill
          sizes="(max-width: 48rem) 70vw, 32rem"
          unoptimized
          draggable={false}
        />
      </div>
      <figcaption>
        <span
          className={`subject-marker marker-${subjectIndex + 1}`}
          aria-hidden="true"
        >
          {subjectMarkers[subjectIndex]}
        </span>
        Skull {subjectIndex + 1} · {formatViewLabel(view.view)}
      </figcaption>
    </figure>
  );
}

function ComparisonTable({
  selected,
  rows,
  primary,
  comparison,
}: {
  selected: SkullComparisonRecord[];
  rows: ComparisonDifferenceRow[];
  primary: SkullComparisonRecord;
  comparison: SkullComparisonRecord;
}) {
  return (
    <div className="comparison-table-wrap">
      <table className="comparison-table">
        <caption className="visually-hidden">
          Recorded skull measurements and the directed difference between the
          selected pair
        </caption>
        <thead>
          <tr>
            <th scope="col">Measurement</th>
            {selected.map((record, index) => (
              <th scope="col" key={record.id}>
                <span>Skull {index + 1}</span>
                <small>{record.specimenId ?? record.label}</small>
              </th>
            ))}
            <th scope="col" className="comparison-difference-heading">
              <span>Difference</span>
              <small>
                S{selected.indexOf(primary) + 1} ↔ S
                {selected.indexOf(comparison) + 1}
              </small>
              <details>
                <summary aria-label="How difference and ratio are calculated">
                  i
                </summary>
                <p>
                  Difference is Skull {selected.indexOf(primary) + 1} minus
                  Skull {selected.indexOf(comparison) + 1}. Ratio is Skull{" "}
                  {selected.indexOf(primary) + 1} divided by Skull{" "}
                  {selected.indexOf(comparison) + 1}.
                </p>
              </details>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const primaryKey = getComparisonRowMeasurementKey(
              row,
              primary.measurementProfile,
            );
            const comparisonKey = getComparisonRowMeasurementKey(
              row,
              comparison.measurementProfile,
            );
            const difference =
              primaryKey && comparisonKey
                ? calculateMeasurementDifference(
                    primaryKey,
                    primary.measurements[primaryKey],
                    comparison.measurements[comparisonKey],
                    row.key,
                  )
                : null;
            return (
              <tr key={row.key}>
                <th scope="row">
                  <Link href={getMethodologyHref(primaryKey)}>{row.label}</Link>
                </th>
                {selected.map((record) => {
                  const key = getComparisonRowMeasurementKey(
                    row,
                    record.measurementProfile,
                  );
                  return (
                    <td
                      key={record.id}
                      data-label={record.specimenId ?? record.label}
                    >
                      {key
                        ? formatComparisonMeasurement(record.measurements[key])
                        : "Not applicable"}
                    </td>
                  );
                })}
                <td
                  className={`comparison-difference difference-${difference?.direction ?? "unavailable"}`}
                  data-label="Difference"
                >
                  <span>{difference?.text ?? "Not applicable"}</span>
                  {difference?.ratioText ? (
                    <small>{difference.ratioText}</small>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function isComparableRow(
  row: ComparisonDifferenceRow,
  primary?: SkullComparisonRecord,
  comparison?: SkullComparisonRecord,
) {
  if (!primary || !comparison) return false;
  const primaryKey = getComparisonRowMeasurementKey(
    row,
    primary.measurementProfile,
  );
  const comparisonKey = getComparisonRowMeasurementKey(
    row,
    comparison.measurementProfile,
  );
  if (!primaryKey || !comparisonKey) return false;
  const first = primary.measurements[primaryKey];
  const second = comparison.measurements[comparisonKey];
  return (
    isUsableMeasurement(first) &&
    isUsableMeasurement(second) &&
    first.unit === second.unit
  );
}

function isUsableMeasurement(measurement: Measurement) {
  return (
    (measurement.status === "measured" ||
      measurement.status === "approximate") &&
    measurement.value !== null &&
    measurement.value > 0
  );
}

function formatComparisonMeasurement(measurement: Measurement) {
  if (measurement.status === "not_recorded") return "Not recorded";
  if (measurement.status === "not_applicable") return "Not applicable";
  const value = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(measurement.value ?? 0);
  return `${measurement.status === "approximate" ? "~" : ""}${value} ${measurement.unit}`;
}

function getMethodologyHref(key: ComparisonMeasurementKey | null) {
  const number = key ? methodologyNumbers[key] : null;
  return number
    ? `/methodology#measurement-definition-${number}`
    : "/methodology#measurement-table-title";
}

function formatViewLabel(view: SkullComparisonView["view"]) {
  return view === "mandible-dorsal"
    ? "Mandible — dorsal"
    : `${view.charAt(0).toUpperCase()}${view.slice(1)}`;
}
