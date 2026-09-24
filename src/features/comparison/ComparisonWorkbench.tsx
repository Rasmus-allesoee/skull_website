"use client";

import Link from "next/link";
import {
  type DragEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  calculateMeasurementDifference,
  getComparisonMeasurementSections,
  getComparisonRowMeasurementKey,
  isCrossClassMeasurementPair,
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
  ComparisonField,
  type ComparisonFieldHandle,
  type SelectedComparisonSubject,
} from "./ComparisonField";
import { WorkbenchSubjectPicker } from "./WorkbenchSubjectPicker";
import {
  getComparisonStartingPoints,
  getContextualComparisonSuggestions,
} from "./comparisonSuggestions";
import { downloadBlob, downloadComparisonCsv } from "./comparisonExport";
import type { FieldPngBackground } from "./fieldPngExport";
import {
  addComparisonSubject,
  addComparisonView,
  getComparisonLayerCount,
  getDefaultComparisonState,
  maximumComparisonLayers,
  maximumComparisonSubjects,
  parseComparisonState,
  removeComparisonSubject,
  removeComparisonView,
  reorderComparisonSubjects,
  serializeComparisonState,
  type ComparisonWorkbenchState,
} from "./workbenchState";

const methodologyNumbers: Partial<Record<ComparisonMeasurementKey, number>> = {
  skullLength: 1,
  condylobasalLength: 2,
  maxillaryToothRowLength: 3,
  mandibularToothRowLength: 10,
  mandibleLength: 9,
  skullWidth: 12,
  craniumWidth: 13,
  postorbitalWidth: 14,
  interorbitalWidth: 15,
  rostrumWidth: 16,
  skullHeight: 17,
  mandibleRamusHeight: 18,
  mandibleBodyHeight: 19,
  maxillaryCanineLength: 20,
  mandibularCanineLength: 21,
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
  const [exportingField, setExportingField] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const [showAllMeasurements, setShowAllMeasurements] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState(
    defaults.subjects[0]?.id ?? null,
  );
  const [opacityBySubject, setOpacityBySubject] = useState<
    Record<string, number>
  >(() => Object.fromEntries(defaults.subjects.map(({ id }) => [id, 100])));
  const hydrated = useRef(false);
  const draggedSubjectId = useRef<string | null>(null);
  const draggedSubjectPreview = useRef<HTMLElement | null>(null);
  const fieldRef = useRef<ComparisonFieldHandle>(null);
  const recordsById = useMemo(
    () => new Map(records.map((record) => [record.id, record])),
    [records],
  );
  const startingPoints = useMemo(
    () => getComparisonStartingPoints(records),
    [records],
  );

  useEffect(() => {
    const restore = () => {
      const parsed = parseComparisonState(window.location.search, records);
      setState(parsed.state);
      setWarnings(parsed.warnings);
      setActiveSubjectId(parsed.state.subjects[0]?.id ?? null);
      setOpacityBySubject((current) =>
        Object.fromEntries(
          parsed.state.subjects.map(({ id }) => [id, current[id] ?? 100]),
        ),
      );
    };
    restore();
    hydrated.current = true;
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [records]);

  useEffect(() => {
    return () => {
      draggedSubjectPreview.current?.remove();
    };
  }, []);

  useEffect(() => {
    function closeOpenDetails(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      document
        .querySelectorAll<HTMLDetailsElement>(
          ".compare-page details[open]:not(.comparison-field-help)",
        )
        .forEach((details) => {
          if (!details.contains(target)) details.open = false;
        });
    }
    document.addEventListener("pointerdown", closeOpenDetails);
    return () => document.removeEventListener("pointerdown", closeOpenDetails);
  }, []);

  const selected: SelectedComparisonSubject[] = state.subjects.flatMap(
    (subject) => {
      const record = recordsById.get(subject.id);
      return record ? [{ subject, record }] : [];
    },
  );
  const layerCount = getComparisonLayerCount(state);
  const contextualSuggestions = useMemo(
    () =>
      getContextualComparisonSuggestions(
        records,
        state.subjects.map(({ id }) => id),
      ),
    [records, state.subjects],
  );
  const pair = state.difference
    ? ([
        recordsById.get(state.difference[0]),
        recordsById.get(state.difference[1]),
      ] as const)
    : null;
  const measurementSections = useMemo(
    () =>
      getComparisonMeasurementSections(
        selected.map(({ record }) => record.measurementProfile),
      ),
    [selected],
  );
  const rows = showAllMeasurements
    ? [...measurementSections.primary, ...measurementSections.additional]
    : measurementSections.primary;
  const visibleRows = state.comparableOnly
    ? rows.filter((row) => isComparableRow(row, pair?.[0], pair?.[1]))
    : rows;

  function commit(next: ComparisonWorkbenchState, message = "") {
    setState(next);
    setWarnings([]);
    setActionStatus(message);
    if (!hydrated.current) return;
    const query = serializeComparisonState(next);
    window.history.pushState(null, "", `${window.location.pathname}?${query}`);
  }

  function positionRailPopup(
    event: MouseEvent<HTMLElement>,
    widthInRem: number,
  ) {
    if (
      !window.matchMedia("(min-width: 48.01rem) and (max-width: 64rem)").matches
    )
      return;
    const details = event.currentTarget.closest("details");
    if (!details) return;
    const trigger = event.currentTarget.getBoundingClientRect();
    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize,
    );
    const width = Math.min(widthInRem * rootFontSize, window.innerWidth - 24);
    const left = Math.max(
      12,
      Math.min(trigger.left, window.innerWidth - width - 12),
    );
    const top = trigger.bottom + 6;
    details.style.setProperty("--compare-menu-left", `${left}px`);
    details.style.setProperty("--compare-menu-top", `${top}px`);
    details.style.setProperty(
      "--compare-menu-max-height",
      `${Math.max(32, window.innerHeight - top - 12)}px`,
    );
  }

  function addSubject(id: string) {
    if (
      state.subjects.length >= maximumComparisonSubjects ||
      layerCount >= maximumComparisonLayers ||
      state.subjects.some((subject) => subject.id === id)
    ) {
      setActionStatus(
        state.subjects.length >= maximumComparisonSubjects
          ? "5-skull limit reached. Remove a skull to add another."
          : "10-view field limit reached. Remove a view to add another skull.",
      );
      return;
    }
    const record = recordsById.get(id);
    const initialView =
      record?.views.find(({ view }) => view === "lateral")?.view ??
      record?.views[0]?.view;
    if (!record || !initialView) {
      setActionStatus("No calibrated view is available for that skull.");
      return;
    }
    const next = addComparisonSubject(state, id, initialView);
    if (next === state) return;
    setOpacityBySubject((current) => ({ ...current, [id]: 100 }));
    setActiveSubjectId(id);
    commit(
      next,
      `Skull ${next.subjects.length} added with its ${formatViewLabel(initialView)} view.`,
    );
  }

  function removeSubject(id: string) {
    const next = removeComparisonSubject(state, id);
    if (next === state) return;
    setOpacityBySubject((current) => {
      const remaining = { ...current };
      delete remaining[id];
      return remaining;
    });
    setActiveSubjectId(next.subjects[0]?.id ?? null);
    commit(
      next,
      next.difference && state.difference !== next.difference
        ? "Skull removed. Difference pair reset to the first two skulls."
        : "Skull removed.",
    );
  }

  function reorderSubjects(sourceId: string, targetId: string) {
    const next = reorderComparisonSubjects(state, sourceId, targetId);
    if (next === state) return;
    setActiveSubjectId(sourceId);
    commit(next, "Skull order updated; table columns reordered.");
  }

  function clearSubjectDragPreview() {
    draggedSubjectPreview.current?.remove();
    draggedSubjectPreview.current = null;
  }

  function beginSubjectDrag(event: DragEvent<HTMLElement>, id: string) {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.closest("button, a, input, summary")
    ) {
      event.preventDefault();
      return;
    }

    const card = event.currentTarget;
    const cardBounds = card.getBoundingClientRect();
    const preview = card.cloneNode(true) as HTMLElement;
    const pointerOffsetX = Math.min(
      Math.max(event.clientX - cardBounds.left, 0),
      cardBounds.width,
    );
    const pointerOffsetY = Math.min(
      Math.max(event.clientY - cardBounds.top, 0),
      cardBounds.height,
    );

    clearSubjectDragPreview();
    preview.classList.add("compare-card-drag-preview");
    preview.setAttribute("aria-hidden", "true");
    preview.setAttribute("data-comparison-card-drag-preview", "true");
    preview.removeAttribute("draggable");
    preview.style.width = `${Math.ceil(cardBounds.width)}px`;
    preview.style.minWidth = `${Math.ceil(cardBounds.width)}px`;
    preview.style.height = `${Math.ceil(cardBounds.height)}px`;
    preview.querySelectorAll("details").forEach((details) => {
      details.removeAttribute("open");
    });
    document.body.append(preview);
    draggedSubjectPreview.current = preview;

    draggedSubjectId.current = id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.setDragImage(
      preview,
      Math.round(pointerOffsetX),
      Math.round(pointerOffsetY),
    );
    setActiveSubjectId(id);
  }

  function dropSubject(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    const sourceId = draggedSubjectId.current;
    draggedSubjectId.current = null;
    if (sourceId) reorderSubjects(sourceId, targetId);
  }

  function addView(id: string, view: SkullComparisonView["view"]) {
    if (layerCount >= maximumComparisonLayers) {
      setActionStatus(
        "10-view field limit reached. Remove a view to add another.",
      );
      return;
    }
    const next = addComparisonView(state, id, view);
    if (next === state) return;
    commit(next, `${formatViewLabel(view)} view added.`);
  }

  function removeView(id: string, view: SkullComparisonView["view"]) {
    const subject = state.subjects.find((candidate) => candidate.id === id);
    if (!subject) return;
    const removesSubject = subject.views.length === 1;
    const next = removeComparisonView(state, id, view);
    if (removesSubject) {
      setOpacityBySubject((current) => {
        const remaining = { ...current };
        delete remaining[id];
        return remaining;
      });
      setActiveSubjectId(next.subjects[0]?.id ?? null);
    }
    commit(
      next,
      removesSubject
        ? "Final view removed; its skull was also deselected."
        : `${formatViewLabel(view)} view removed.`,
    );
  }

  function clearAll() {
    setOpacityBySubject({});
    setActiveSubjectId(null);
    commit(
      { ...state, subjects: [], difference: null },
      "Comparison field cleared.",
    );
  }

  function applyStartingPoint(ids: string[], label: string) {
    const subjects = ids.slice(0, maximumComparisonSubjects).flatMap((id) => {
      const record = recordsById.get(id);
      const view =
        record?.views.find((candidate) => candidate.view === "lateral")?.view ??
        record?.views[0]?.view;
      return record && view ? [{ id, views: [view] }] : [];
    });
    const difference =
      subjects.length >= 2
        ? ([subjects[0]!.id, subjects[1]!.id] as [string, string])
        : null;
    setOpacityBySubject(
      Object.fromEntries(subjects.map(({ id }) => [id, 100])),
    );
    setActiveSubjectId(subjects[0]?.id ?? null);
    commit(
      { ...state, subjects, difference, arrangement: "by-specimen" },
      `${label} loaded.`,
    );
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

  async function exportField(background: FieldPngBackground) {
    if (!fieldRef.current || exportingField) return;
    setExportingField(true);
    setCopyStatus("Preparing field PNG…");
    try {
      const blob = await fieldRef.current.exportPng(background);
      downloadBlob(blob, `skull-comparison-field-${background}.png`);
      setCopyStatus("Field PNG downloaded.");
    } catch (error) {
      setCopyStatus(
        error instanceof Error
          ? `Field export failed: ${error.message}`
          : "Field export failed. Please try again.",
      );
    } finally {
      setExportingField(false);
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
          <details className="compare-download-menu">
            <summary>Download CSV</summary>
            <div>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={(event) => {
                  downloadComparisonCsv(
                    selected.map(({ record }) => record),
                    "long",
                  );
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                  setCopyStatus("Long/tidy CSV downloaded.");
                }}
              >
                Long/tidy format
              </button>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={(event) => {
                  downloadComparisonCsv(
                    selected.map(({ record }) => record),
                    "wide",
                  );
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                  setCopyStatus("Wide CSV downloaded.");
                }}
              >
                Wide format
              </button>
            </div>
          </details>
          <details className="compare-field-export-menu">
            <summary>More</summary>
            <div>
              <span>Export field PNG</span>
              <button
                type="button"
                disabled={selected.length === 0 || exportingField}
                onClick={(event) => {
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                  void exportField("black");
                }}
              >
                Pure black background
              </button>
              <button
                type="button"
                disabled={selected.length === 0 || exportingField}
                onClick={(event) => {
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                  void exportField("ui");
                }}
              >
                Field grid background
              </button>
            </div>
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
            <span>
              {selected.length}/{maximumComparisonSubjects} · {layerCount}/
              {maximumComparisonLayers} views
            </span>
          </div>
          <div className="compare-subject-strip">
            {selected.map(({ record, subject }, index) => (
              <article
                className={`compare-subject-card marker-${index + 1}`}
                key={record.id}
                draggable
                onDragStart={(event) => beginSubjectDrag(event, record.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropSubject(event, record.id)}
                onDragEnd={() => {
                  draggedSubjectId.current = null;
                  clearSubjectDragPreview();
                }}
                data-active={activeSubjectId === record.id ? "true" : undefined}
                onFocus={() => setActiveSubjectId(record.id)}
                onPointerDown={() => setActiveSubjectId(record.id)}
              >
                <header>
                  <span
                    className={`subject-marker marker-${index + 1}`}
                    aria-hidden="true"
                  >
                    {subjectMarkers[index]}
                  </span>
                  <div>
                    <p>Skull {index + 1}</p>
                    <h2>
                      {record.href ? (
                        <Link href={record.href}>{record.label}</Link>
                      ) : (
                        record.label
                      )}
                    </h2>
                    {record.scientificName ? (
                      <i className="compare-subject-scientific">
                        {record.scientificName}
                      </i>
                    ) : null}
                    <p className="compare-subject-meta">
                      <span>{record.specimenId ?? "Reviewed reference"}</span>
                      {record.measurements.skullLength.status !==
                        "not_applicable" &&
                      record.measurements.skullLength.value !== null ? (
                        <span className="compare-subject-length">
                          {` · ${formatComparisonMeasurement(record.measurements.skullLength)}`}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="compare-subject-order-controls">
                    <button
                      type="button"
                      disabled={index === 0}
                      aria-label={`Move Skull ${index + 1} before Skull ${index}`}
                      title="Move earlier"
                      onClick={() =>
                        reorderSubjects(
                          record.id,
                          selected[index - 1]?.record.id ?? record.id,
                        )
                      }
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={index === selected.length - 1}
                      aria-label={`Move Skull ${index + 1} after Skull ${index + 2}`}
                      title="Move later"
                      onClick={() =>
                        reorderSubjects(
                          record.id,
                          selected[index + 1]?.record.id ?? record.id,
                        )
                      }
                    >
                      →
                    </button>
                  </div>
                </header>
                <ul
                  className="compare-view-chips"
                  aria-label={`Active views for Skull ${index + 1}`}
                >
                  {subject.views.map((view) => (
                    <li key={view}>
                      <span>{formatViewLabel(view)}</span>
                      <button
                        type="button"
                        aria-label={`Remove Skull ${index + 1} ${formatViewLabel(view)} view`}
                        onClick={() => removeView(record.id, view)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="compare-subject-controls">
                  <details className="compare-view-menu">
                    <summary
                      aria-label={`Add view to Skull ${index + 1}`}
                      title="Add view"
                      onClick={(event) => positionRailPopup(event, 14)}
                    >
                      <span className="compare-control-label">Add view</span>
                      <span
                        className="compare-control-symbol"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <div>
                      {record.views.map((view) => {
                        const active = subject.views.includes(view.view);
                        return (
                          <button
                            type="button"
                            key={view.view}
                            disabled={
                              active || layerCount >= maximumComparisonLayers
                            }
                            onClick={(event) => {
                              addView(record.id, view.view);
                              event.currentTarget
                                .closest("details")
                                ?.removeAttribute("open");
                            }}
                          >
                            {formatViewLabel(view.view)}
                            <small>{active ? "Active" : "Add"}</small>
                          </button>
                        );
                      })}
                      {layerCount >= maximumComparisonLayers ? (
                        <p>10-view field limit reached.</p>
                      ) : null}
                    </div>
                  </details>
                  <details className="compare-opacity-control">
                    <summary
                      aria-label={`Adjust Skull ${index + 1} opacity`}
                      title="Adjust opacity"
                      onClick={(event) => positionRailPopup(event, 14)}
                    >
                      <span className="compare-control-label">Opacity</span>
                      <span
                        className="compare-control-symbol"
                        aria-hidden="true"
                      >
                        ◐
                      </span>
                    </summary>
                    <label>
                      <span>Skull {index + 1} opacity</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={opacityBySubject[record.id] ?? 100}
                        onChange={(event) => {
                          const value = Number(event.currentTarget.value);
                          setOpacityBySubject((current) => ({
                            ...current,
                            [record.id]: value,
                          }));
                          setActionStatus(
                            value === 0
                              ? `Skull ${index + 1} hidden in field.`
                              : `Skull ${index + 1} opacity ${value}%.`,
                          );
                        }}
                      />
                      <output>{opacityBySubject[record.id] ?? 100}%</output>
                    </label>
                  </details>
                  <button
                    type="button"
                    className="compare-remove-skull"
                    aria-label={`Remove Skull ${index + 1}: ${record.label}`}
                    title="Remove skull"
                    onClick={() => removeSubject(record.id)}
                  >
                    <span className="compare-control-label">Remove</span>
                    <span className="compare-control-symbol" aria-hidden="true">
                      ×
                    </span>
                  </button>
                </div>
              </article>
            ))}
            <WorkbenchSubjectPicker
              records={records}
              selectedIds={state.subjects.map(({ id }) => id)}
              disabled={
                state.subjects.length >= maximumComparisonSubjects ||
                layerCount >= maximumComparisonLayers
              }
              disabledReason={
                state.subjects.length >= maximumComparisonSubjects
                  ? "5-skull limit reached"
                  : "10-view field limit reached"
              }
              onSelect={addSubject}
            />
            <details className="compare-suggestions">
              <summary onClick={(event) => positionRailPopup(event, 17)}>
                Quick comparisons
              </summary>
              <div>
                <p>Starting points</p>
                {startingPoints.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion.id}
                    onClick={() =>
                      applyStartingPoint(
                        suggestion.subjectIds,
                        suggestion.label,
                      )
                    }
                  >
                    {suggestion.label}
                  </button>
                ))}
                {contextualSuggestions.length > 0 &&
                state.subjects.length < maximumComparisonSubjects ? (
                  <>
                    <p>Suggested additions</p>
                    {contextualSuggestions
                      .slice(
                        0,
                        maximumComparisonSubjects - state.subjects.length,
                      )
                      .map((record) => (
                        <button
                          type="button"
                          key={record.id}
                          onClick={() => addSubject(record.id)}
                        >
                          {record.label}
                          <small>{record.specimenId ?? "Reference"}</small>
                        </button>
                      ))}
                  </>
                ) : null}
              </div>
            </details>
          </div>
          <p className="compare-rail-status" aria-live="polite">
            {actionStatus}
          </p>
        </aside>

        <ComparisonField
          ref={fieldRef}
          selected={selected}
          arrangement={state.arrangement}
          difference={state.difference}
          opacityBySubject={opacityBySubject}
          onArrangementChange={(arrangement) =>
            commit({ ...state, arrangement })
          }
          onRemoveView={removeView}
          onResetOpacity={() =>
            setOpacityBySubject(
              Object.fromEntries(state.subjects.map(({ id }) => [id, 100])),
            )
          }
          onClear={clearAll}
        />
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
          <div className="comparison-measurement-actions">
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
            {measurementSections.additional.length > 0 ? (
              <button
                type="button"
                className="comparison-more-measurements"
                aria-expanded={showAllMeasurements}
                onClick={() => setShowAllMeasurements((current) => !current)}
              >
                {showAllMeasurements
                  ? "Show primary measurements"
                  : `Show all measurements (+${measurementSections.additional.length})`}
              </button>
            ) : null}
          </div>
        </div>
        {pair?.[0] && pair[1] ? (
          <>
            <div className="comparison-pair-control">
              <label htmlFor="comparison-difference-pair">
                Difference pair
              </label>
              <select
                id="comparison-difference-pair"
                value={state.difference?.join("|") ?? ""}
                onChange={(event) => {
                  const [primaryId, comparisonId] =
                    event.currentTarget.value.split("|");
                  if (!primaryId || !comparisonId) return;
                  commit(
                    {
                      ...state,
                      difference: [primaryId, comparisonId],
                    },
                    "Difference pair updated.",
                  );
                }}
              >
                {selected.flatMap(({ record: primaryRecord }, primaryIndex) =>
                  selected.flatMap(
                    ({ record: comparisonRecord }, comparisonIndex) =>
                      primaryRecord.id === comparisonRecord.id
                        ? []
                        : [
                            <option
                              value={`${primaryRecord.id}|${comparisonRecord.id}`}
                              key={`${primaryRecord.id}|${comparisonRecord.id}`}
                            >
                              Skull {primaryIndex + 1} − Skull{" "}
                              {comparisonIndex + 1}
                            </option>,
                          ],
                  ),
                )}
              </select>
            </div>
            {isCrossClassMeasurementPair(
              pair[0].measurementProfile,
              pair[1].measurementProfile,
            ) ? (
              <p className="comparison-cross-class-note">
                Width and height rows name different mammal and bird landmarks;
                they are functional mappings, not claims of anatomical homology.
              </p>
            ) : null}
            <ComparisonTable
              selected={selected.map(({ record }) => record)}
              rows={visibleRows}
              primary={pair[0]}
              comparison={pair[1]}
              onReorderSubjects={reorderSubjects}
            />
          </>
        ) : (
          <p className="comparison-table-empty">
            Add another skull to compare.
          </p>
        )}
        <p className="comparison-row-status" aria-live="polite">
          {visibleRows.length} measurement rows shown
          {measurementSections.additional.length > 0 && !showAllMeasurements
            ? ` · ${measurementSections.additional.length} more available.`
            : "."}
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

function ComparisonTable({
  selected,
  rows,
  primary,
  comparison,
  onReorderSubjects,
}: {
  selected: SkullComparisonRecord[];
  rows: ComparisonDifferenceRow[];
  primary: SkullComparisonRecord;
  comparison: SkullComparisonRecord;
  onReorderSubjects: (sourceId: string, targetId: string) => void;
}) {
  const draggedTableSubjectId = useRef<string | null>(null);

  function beginTableColumnDrag(
    event: DragEvent<HTMLTableCellElement>,
    id: string,
  ) {
    draggedTableSubjectId.current = id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function dropTableColumn(
    event: DragEvent<HTMLTableCellElement>,
    targetId: string,
  ) {
    event.preventDefault();
    const sourceId = draggedTableSubjectId.current;
    draggedTableSubjectId.current = null;
    if (sourceId) onReorderSubjects(sourceId, targetId);
  }

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
              <th
                scope="col"
                key={record.id}
                draggable
                onDragStart={(event) => beginTableColumnDrag(event, record.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropTableColumn(event, record.id)}
                onDragEnd={() => {
                  draggedTableSubjectId.current = null;
                }}
                title="Drag to change skull order"
              >
                <span>
                  Skull {index + 1} · <strong>{record.label}</strong>
                </span>
                {record.scientificName ? <i>{record.scientificName}</i> : null}
                <small>{record.specimenId ?? "Reviewed reference"}</small>
              </th>
            ))}
            <th scope="col" className="comparison-difference-heading">
              <span>Difference</span>
              <small>
                S{selected.indexOf(primary) + 1} − S
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
                      data-label={`Skull ${selected.indexOf(record) + 1} · ${formatComparisonRecordIdentity(record)}`}
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

function formatComparisonRecordIdentity(record: SkullComparisonRecord) {
  return [
    record.label,
    record.scientificName,
    record.specimenId ?? "Reviewed reference",
  ]
    .filter((value): value is string => Boolean(value))
    .join(" · ");
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
