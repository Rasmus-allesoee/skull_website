"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  useId,
  useRef,
  useState,
} from "react";

import type {
  MeasurementDefinition,
  MeasurementDiagram,
  MeasurementOccurrence,
  MeasurementReference,
} from "@/domain/methodology/types";

type ActiveOccurrence = { diagramId: string; number: number };
type FocusTarget = HTMLElement | SVGGElement;

export function MeasurementReferenceBoard({
  reference,
}: {
  reference: MeasurementReference;
}) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [hovered, setHovered] = useState<ActiveOccurrence | null>(null);
  const [focused, setFocused] = useState<ActiveOccurrence | null>(null);
  const [touchPreview, setTouchPreview] = useState<ActiveOccurrence | null>(
    null,
  );
  const [detailNumber, setDetailNumber] = useState<number>(1);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<FocusTarget | null>(null);
  const dialogTitleId = useId();
  const definitions = new Map(
    reference.definitions.map((definition) => [definition.number, definition]),
  );
  const detail = definitions.get(detailNumber) ?? reference.definitions[0]!;

  function openDetails(number: number, trigger: FocusTarget) {
    setSelectedNumber(number);
    setTouchPreview(null);
    setDetailNumber(number);
    returnFocusRef.current = trigger;
    requestAnimationFrame(() => {
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    });
  }

  function clearSelection() {
    setSelectedNumber(null);
    setTouchPreview(null);
    setHovered(null);
    setFocused(null);
  }

  return (
    <>
      <section
        className="measurement-board-section"
        aria-labelledby="measurement-board-title"
      >
        <div className="measurement-board-heading">
          <div>
            <p className="section-kicker">Illustrated reference</p>
            <h2 id="measurement-board-title">Measurement diagrams</h2>
          </div>
          {selectedNumber !== null ? (
            <button
              type="button"
              className="measurement-clear-selection"
              onClick={clearSelection}
            >
              Clear selection {selectedNumber}
            </button>
          ) : null}
        </div>

        <div
          className="measurement-how-to"
          aria-label="How to use the diagrams"
        >
          <p>
            <strong>How to use:</strong> Numbers match the reference table.
            Hover or focus for the name; click or press Enter for the complete
            method. On touch, tap once for a preview and again—or choose View
            details—to open it.
          </p>
          <p>
            Brass and bright outlines show interaction state only; they do not
            encode anatomical data.
          </p>
        </div>

        <div className="measurement-board">
          {reference.diagrams.map((diagram, index) => {
            const preview = resolveDiagramPreview({
              diagram,
              definitions,
              hovered,
              focused,
              touchPreview,
            });
            return (
              <figure
                className={`measurement-figure measurement-figure--${diagram.id}`}
                id={`measurement-figure-${diagram.id}`}
                key={diagram.id}
              >
                <figcaption>
                  <span>{diagram.title}</span>
                  <span>
                    Measurements{" "}
                    {diagram.occurrences.map(({ number }) => number).join(", ")}
                  </span>
                </figcaption>
                <div className="measurement-diagram-scroll" tabIndex={0}>
                  <div
                    className="measurement-diagram-stage"
                    style={
                      {
                        "--measurement-aspect": `${diagram.coordinateWidth} / ${diagram.coordinateHeight}`,
                      } as CSSProperties
                    }
                  >
                    {failedImages.has(diagram.id) ? (
                      <div className="measurement-image-fallback" role="status">
                        <strong>{diagram.title} image unavailable.</strong>
                        <span>
                          The numbered definitions remain available in the table
                          below.
                        </span>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={diagram.publicPath}
                          alt={diagram.alt}
                          width={diagram.coordinateWidth}
                          height={diagram.coordinateHeight}
                          priority={index === 0}
                          unoptimized
                          onError={() => {
                            setFailedImages((current) =>
                              new Set(current).add(diagram.id),
                            );
                          }}
                        />
                        <MeasurementOverlay
                          diagram={diagram}
                          definitions={definitions}
                          selectedNumber={selectedNumber}
                          onPointerUp={(event, occurrence) => {
                            const active = {
                              diagramId: diagram.id,
                              number: occurrence.number,
                            };
                            if (
                              event.pointerType === "touch" ||
                              event.pointerType === "pen"
                            ) {
                              event.preventDefault();
                              if (
                                touchPreview?.diagramId === diagram.id &&
                                touchPreview.number === occurrence.number
                              ) {
                                openDetails(
                                  occurrence.number,
                                  event.currentTarget,
                                );
                              } else {
                                setSelectedNumber(occurrence.number);
                                setTouchPreview(active);
                              }
                              return;
                            }
                            openDetails(occurrence.number, event.currentTarget);
                          }}
                          onKeyDown={(event, occurrence) => {
                            if (event.key !== "Enter" && event.key !== " ")
                              return;
                            event.preventDefault();
                            openDetails(occurrence.number, event.currentTarget);
                          }}
                          onHover={(occurrence) =>
                            setHovered(
                              occurrence
                                ? {
                                    diagramId: diagram.id,
                                    number: occurrence.number,
                                  }
                                : null,
                            )
                          }
                          onFocus={(occurrence) =>
                            setFocused(
                              occurrence
                                ? {
                                    diagramId: diagram.id,
                                    number: occurrence.number,
                                  }
                                : null,
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
                {preview ? (
                  <div
                    className={`measurement-tooltip${preview.touch ? "measurement-tooltip--touch" : ""}`}
                    role="tooltip"
                    id={`measurement-tooltip-${diagram.id}-${preview.definition.number}`}
                  >
                    <span>
                      {preview.definition.number}. {preview.definition.name}
                    </span>
                    {preview.touch ? (
                      <button
                        type="button"
                        onClick={(event) =>
                          openDetails(
                            preview.definition.number,
                            event.currentTarget,
                          )
                        }
                      >
                        View details
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <p className="measurement-credit">{diagram.credit}</p>
              </figure>
            );
          })}
        </div>
      </section>

      <section
        className="measurement-table-section"
        aria-labelledby="measurement-table-title"
      >
        <div className="measurement-table-heading">
          <div>
            <p className="section-kicker">Complete index</p>
            <h2 id="measurement-table-title">Measurement definitions</h2>
          </div>
          <p>
            These are the collection’s current measurement reference notes. They
            do not claim one universal protocol for every species.
          </p>
        </div>
        <div className="measurement-table-wrap">
          <table className="measurement-reference-table">
            <caption className="visually-hidden">
              Twenty-one numbered skull measurement names and exact landmark or
              method descriptions
            </caption>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Measurement</th>
                <th scope="col">Exact landmarks / method</th>
              </tr>
            </thead>
            <tbody>
              {reference.definitions.map((definition) => (
                <tr
                  key={definition.number}
                  data-selected={selectedNumber === definition.number}
                >
                  <td data-label="Number">
                    <button
                      type="button"
                      aria-label={`Open details for measurement ${definition.number}: ${definition.name}`}
                      aria-pressed={selectedNumber === definition.number}
                      onClick={(event) =>
                        openDetails(definition.number, event.currentTarget)
                      }
                    >
                      {String(definition.number).padStart(2, "0")}
                    </button>
                  </td>
                  <th scope="row" data-label="Measurement">
                    {definition.name}
                  </th>
                  <td data-label="Exact landmarks / method">
                    {definition.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="measurement-detail-dialog"
        aria-labelledby={dialogTitleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        onClose={() => returnFocusRef.current?.focus()}
      >
        <div className="measurement-detail-frame">
          <header>
            <p className="eyebrow">Measurement {detail.number}</p>
            <h2 id={dialogTitleId}>{detail.name}</h2>
            <button
              type="button"
              aria-label="Close measurement details"
              onClick={() => dialogRef.current?.close()}
              autoFocus
            >
              Close <span aria-hidden="true">×</span>
            </button>
          </header>
          <div className="measurement-detail-content">
            <p className="measurement-detail-number" aria-hidden="true">
              {String(detail.number).padStart(2, "0")}
            </p>
            <div>
              <p className="measurement-detail-label">
                Exact landmarks / method
              </p>
              <p>{detail.description}</p>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

function MeasurementOverlay({
  diagram,
  definitions,
  selectedNumber,
  onPointerUp,
  onKeyDown,
  onHover,
  onFocus,
}: {
  diagram: MeasurementDiagram;
  definitions: Map<number, MeasurementDefinition>;
  selectedNumber: number | null;
  onPointerUp: (
    event: PointerEvent<SVGGElement>,
    occurrence: MeasurementOccurrence,
  ) => void;
  onKeyDown: (
    event: KeyboardEvent<SVGGElement>,
    occurrence: MeasurementOccurrence,
  ) => void;
  onHover: (occurrence: MeasurementOccurrence | null) => void;
  onFocus: (occurrence: MeasurementOccurrence | null) => void;
}) {
  const markerId = `measurement-arrow-${diagram.id}`;
  return (
    <svg
      className="measurement-overlay"
      viewBox={`0 0 ${diagram.coordinateWidth} ${diagram.coordinateHeight}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label={`${diagram.title} interactive measurement annotations`}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 44 44"
          refX="38"
          refY="22"
          markerWidth="62"
          markerHeight="62"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M 38 22 L 5 5 L 5 39 Z" />
        </marker>
      </defs>
      {diagram.occurrences.map((occurrence) => {
        const definition = definitions.get(occurrence.number)!;
        const selected = selectedNumber === occurrence.number;
        const subdued = selectedNumber !== null && !selected;
        const [labelX, labelY] = occurrence.label;
        return (
          <g
            key={occurrence.number}
            role="button"
            tabIndex={0}
            aria-label={`Measurement ${occurrence.number}: ${definition.name}. Open details.`}
            aria-pressed={selected}
            className="measurement-annotation"
            data-diagram-id={diagram.id}
            data-measurement-number={occurrence.number}
            data-selected={selected}
            data-subdued={subdued}
            onPointerEnter={() => onHover(occurrence)}
            onPointerLeave={() => onHover(null)}
            onPointerUp={(event) => onPointerUp(event, occurrence)}
            onKeyDown={(event) => onKeyDown(event, occurrence)}
            onFocus={() => onFocus(occurrence)}
            onBlur={(event: FocusEvent<SVGGElement>) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                onFocus(null);
            }}
          >
            <title>{`${occurrence.number}. ${definition.name}`}</title>
            {occurrence.extensions.map((extension, index) => (
              <line
                key={index}
                className="measurement-extension"
                x1={extension[0]}
                y1={extension[1]}
                x2={extension[2]}
                y2={extension[3]}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              className="measurement-line"
              x1={occurrence.line[0]}
              y1={occurrence.line[1]}
              x2={occurrence.line[2]}
              y2={occurrence.line[3]}
              markerStart={`url(#${markerId})`}
              markerEnd={`url(#${markerId})`}
              vectorEffect="non-scaling-stroke"
            />
            <line
              className="measurement-hit-line"
              x1={occurrence.line[0]}
              y1={occurrence.line[1]}
              x2={occurrence.line[2]}
              y2={occurrence.line[3]}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              className="measurement-number-backdrop"
              cx={labelX}
              cy={labelY}
              r="104"
            />
            <circle
              className="measurement-focus-ring"
              cx={labelX}
              cy={labelY}
              r="122"
              vectorEffect="non-scaling-stroke"
            />
            <text
              className="measurement-number"
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              aria-hidden="true"
            >
              {occurrence.number}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function resolveDiagramPreview(options: {
  diagram: MeasurementDiagram;
  definitions: Map<number, MeasurementDefinition>;
  hovered: ActiveOccurrence | null;
  focused: ActiveOccurrence | null;
  touchPreview: ActiveOccurrence | null;
}) {
  const { diagram, definitions, hovered, focused, touchPreview } = options;
  const active =
    (touchPreview?.diagramId === diagram.id && touchPreview) ||
    (focused?.diagramId === diagram.id && focused) ||
    (hovered?.diagramId === diagram.id && hovered) ||
    null;
  if (!active) return null;
  const occurrence = diagram.occurrences.find(
    ({ number }) => number === active.number,
  );
  if (!occurrence) return null;
  const definition = definitions.get(active.number);
  if (!definition) return null;
  return {
    definition,
    touch:
      touchPreview?.diagramId === diagram.id &&
      touchPreview.number === active.number,
  };
}
