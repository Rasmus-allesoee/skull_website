"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
type SelectionOrigin = "diagram" | "table";

const diagramDisplayOrder = [
  "dorsal-skull",
  "ventral-skull",
  "lateral-skull",
  "mandible-lateral",
  "canine-lengths",
] as const;

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
  const [selectionOrigin, setSelectionOrigin] =
    useState<SelectionOrigin | null>(null);
  const [detailNumber, setDetailNumber] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const returnFocusRef = useRef<FocusTarget | null>(null);
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  const detailPanelRef = useRef<HTMLElement>(null);
  const tableSectionRef = useRef<HTMLElement>(null);
  const pointerStartRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
  } | null>(null);
  const detailTitleId = useId();
  const detailDescriptionId = useId();
  const definitions = new Map(
    reference.definitions.map((definition) => [definition.number, definition]),
  );
  const detail =
    detailNumber === null ? null : (definitions.get(detailNumber) ?? null);
  const diagrams = [...reference.diagrams].sort(
    (first, second) =>
      diagramDisplayOrder.indexOf(
        first.id as (typeof diagramDisplayOrder)[number],
      ) -
      diagramDisplayOrder.indexOf(
        second.id as (typeof diagramDisplayOrder)[number],
      ),
  );

  function openDetails(options: {
    number: number;
    trigger: FocusTarget;
    preserveTouchPreview?: boolean;
    focusPanel?: boolean;
  }) {
    const {
      number,
      trigger,
      preserveTouchPreview = false,
      focusPanel,
    } = options;
    setSelectedNumber(number);
    setSelectionOrigin("diagram");
    setHovered(null);
    setFocused(null);
    if (!preserveTouchPreview) setTouchPreview(null);
    setDetailNumber(number);
    returnFocusRef.current = trigger;
    if (focusPanel)
      requestAnimationFrame(() => detailCloseRef.current?.focus());
  }

  function closeDetails({ restoreFocus = true } = {}) {
    setDetailNumber(null);
    if (restoreFocus)
      requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  const clearSelection = useCallback(
    ({ restoreFocus = false } = {}) => {
      const returnTarget = returnFocusRef.current;
      const returnToTable = selectionOrigin === "table";
      setSelectedNumber(null);
      setSelectionOrigin(null);
      setTouchPreview(null);
      setHovered(null);
      setFocused(null);
      setDetailNumber(null);
      if (returnToTable || restoreFocus) {
        requestAnimationFrame(() => {
          if (returnToTable) {
            const tableRow = returnTarget?.closest<HTMLElement>(
              "[data-measurement-row]",
            );
            const behavior = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches
              ? "auto"
              : "smooth";
            (tableRow ?? tableSectionRef.current)?.scrollIntoView({
              block: tableRow ? "center" : "start",
              behavior,
            });
          }
          if (restoreFocus) returnTarget?.focus({ preventScroll: true });
        });
      }
    },
    [selectionOrigin],
  );

  function showMeasurementFromTable(
    definition: MeasurementDefinition,
    trigger: HTMLButtonElement,
  ) {
    const diagram = resolvePreferredDiagram(
      reference.diagrams,
      definition.number,
    );
    if (!diagram) return;
    setSelectedNumber(definition.number);
    setSelectionOrigin("table");
    setTouchPreview(null);
    setHovered(null);
    setDetailNumber(null);
    returnFocusRef.current = trigger;
    requestAnimationFrame(() => {
      const target = document.querySelector<SVGGElement>(
        `[data-diagram-id="${diagram.id}"][data-measurement-number="${definition.number}"]`,
      );
      const figure = document.getElementById(
        `measurement-figure-${diagram.id}`,
      );
      target?.focus({ preventScroll: true });
      figure?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }

  useEffect(() => {
    function handlePointerDown(event: globalThis.PointerEvent) {
      if (selectedNumber === null && detailNumber === null) return;
      if (!event.isPrimary) {
        pointerStartRef.current = null;
        return;
      }
      pointerStartRef.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
      };
    }

    function handlePointerUp(event: globalThis.PointerEvent) {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start || start.pointerId !== event.pointerId) return;
      if (
        Math.hypot(
          event.clientX - start.clientX,
          event.clientY - start.clientY,
        ) > 10
      )
        return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        target.closest(
          ".measurement-annotation, .measurement-table-target, .measurement-detail-panel, .measurement-tooltip--touch",
        )
      )
        return;
      clearSelection({ restoreFocus: selectionOrigin === "table" });
    }

    function handlePointerCancel(event: globalThis.PointerEvent) {
      if (pointerStartRef.current?.pointerId === event.pointerId)
        pointerStartRef.current = null;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (detailNumber !== null) {
        event.preventDefault();
        closeDetails();
      } else if (selectedNumber !== null) {
        clearSelection({ restoreFocus: true });
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearSelection, detailNumber, selectedNumber, selectionOrigin]);

  useEffect(() => {
    if (detailNumber === null) return;
    const viewport = window.visualViewport;
    let animationFrame = 0;
    let lastPlacement = "";

    function placeDetailPanel() {
      const panel = detailPanelRef.current;
      if (!panel) return;
      const scale = viewport?.scale ?? 1;
      const offsetLeft = viewport?.offsetLeft ?? 0;
      const offsetTop = viewport?.offsetTop ?? 0;
      const viewportWidth =
        viewport?.width ?? document.documentElement.clientWidth;
      const inset = 12 / scale;
      const top = offsetTop + inset;
      const right = Math.max(
        0,
        document.documentElement.clientWidth -
          (offsetLeft + viewportWidth) +
          inset,
      );
      const placement = `${scale}:${top}:${right}`;
      if (placement === lastPlacement) return;
      lastPlacement = placement;
      panel.style.setProperty("--measurement-detail-scale", String(1 / scale));
      panel.style.setProperty("--measurement-detail-top", `${top}px`);
      panel.style.setProperty("--measurement-detail-right", `${right}px`);
    }

    function trackVisualViewport() {
      placeDetailPanel();
      animationFrame = requestAnimationFrame(trackVisualViewport);
    }

    trackVisualViewport();
    viewport?.addEventListener("resize", placeDetailPanel);
    viewport?.addEventListener("scroll", placeDetailPanel);
    window.addEventListener("resize", placeDetailPanel);
    return () => {
      cancelAnimationFrame(animationFrame);
      viewport?.removeEventListener("resize", placeDetailPanel);
      viewport?.removeEventListener("scroll", placeDetailPanel);
      window.removeEventListener("resize", placeDetailPanel);
    };
  }, [detailNumber]);

  return (
    <>
      <section
        className="measurement-board-section"
        aria-labelledby="measurement-board-title"
      >
        <div className="measurement-board-heading">
          <div>
            <p className="section-kicker">Illustrated reference</p>
            <h1 id="measurement-board-title">Measurement diagrams</h1>
          </div>
        </div>

        <div
          className="measurement-how-to"
          aria-label="How to use the diagrams"
        >
          <p>
            <strong>How to use:</strong> Numbers match the reference table.
            Hover or focus for the name; click or press Enter for the complete
            method. On touch, tap once for a preview and again—or tap the
            preview name—to open it.
          </p>
        </div>

        <div
          className="measurement-board"
          data-isolated={selectionOrigin === "table"}
        >
          {diagrams.map((diagram, index) => {
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
                        "--measurement-aspect": `${diagram.viewport[2]} / ${diagram.viewport[3]}`,
                        "--measurement-layer-width": `${(diagram.coordinateWidth / diagram.viewport[2]) * 100}%`,
                        "--measurement-layer-height": `${(diagram.coordinateHeight / diagram.viewport[3]) * 100}%`,
                        "--measurement-layer-left": `${(-diagram.viewport[0] / diagram.viewport[2]) * 100}%`,
                        "--measurement-layer-top": `${(-diagram.viewport[1] / diagram.viewport[3]) * 100}%`,
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
                                openDetails({
                                  number: occurrence.number,
                                  trigger: event.currentTarget,
                                  preserveTouchPreview: true,
                                });
                              } else {
                                setSelectedNumber(occurrence.number);
                                setSelectionOrigin("diagram");
                                setTouchPreview(active);
                              }
                              return;
                            }
                            openDetails({
                              number: occurrence.number,
                              trigger: event.currentTarget,
                            });
                          }}
                          onKeyDown={(event, occurrence) => {
                            if (event.key !== "Enter" && event.key !== " ")
                              return;
                            event.preventDefault();
                            openDetails({
                              number: occurrence.number,
                              trigger: event.currentTarget,
                              focusPanel: true,
                            });
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
                  <MeasurementTooltip
                    diagram={diagram}
                    preview={preview}
                    onViewDetails={(event) =>
                      openDetails({
                        number: preview.definition.number,
                        trigger: event.currentTarget,
                        preserveTouchPreview: true,
                      })
                    }
                  />
                ) : null}
              </figure>
            );
          })}
        </div>
      </section>

      <section
        ref={tableSectionRef}
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
                  data-measurement-row={definition.number}
                  data-selected={selectedNumber === definition.number}
                >
                  <td data-label="Number">
                    <button
                      type="button"
                      className="measurement-table-target"
                      aria-label={`Show measurement ${definition.number}: ${definition.name} on its reference diagram`}
                      aria-controls={`measurement-figure-${resolvePreferredDiagram(reference.diagrams, definition.number)?.id}`}
                      aria-pressed={selectedNumber === definition.number}
                      onClick={(event) =>
                        showMeasurementFromTable(
                          definition,
                          event.currentTarget,
                        )
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

      {detail ? (
        <aside
          ref={detailPanelRef}
          className="measurement-detail-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={detailTitleId}
          aria-describedby={detailDescriptionId}
        >
          <header>
            <span className="measurement-detail-number" aria-hidden="true">
              {String(detail.number).padStart(2, "0")}
            </span>
            <h2 id={detailTitleId}>{detail.name}</h2>
            <button
              ref={detailCloseRef}
              type="button"
              aria-label="Close measurement details"
              onClick={() => closeDetails()}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <p id={detailDescriptionId}>{detail.description}</p>
        </aside>
      ) : null}
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
          viewBox="0 0 12 12"
          refX="11"
          refY="6"
          markerWidth="6.5"
          markerHeight="6.5"
          markerUnits="strokeWidth"
          orient="auto-start-reverse"
        >
          <path d="M 11 6 L 1 1 L 1 11 Z" />
        </marker>
      </defs>
      {diagram.occurrences.map((occurrence) => {
        const definition = definitions.get(occurrence.number)!;
        const selected = selectedNumber === occurrence.number;
        const subdued = selectedNumber !== null && !selected;
        const [labelX, labelY] = occurrence.label;
        const compactRing =
          diagram.id === "dorsal-skull" && occurrence.number === 12;
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
              r={compactRing ? "112" : "135"}
            />
            <circle
              className="measurement-focus-ring"
              cx={labelX}
              cy={labelY}
              r={compactRing ? "130" : "155"}
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

function resolvePreferredDiagram(
  diagrams: MeasurementDiagram[],
  number: number,
) {
  if (number === 1 || number === 2)
    return diagrams.find(({ id }) => id === "lateral-skull");
  return diagrams.find((diagram) =>
    diagram.occurrences.some((occurrence) => occurrence.number === number),
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
    occurrence,
    touch:
      touchPreview?.diagramId === diagram.id &&
      touchPreview.number === active.number,
  };
}

function MeasurementTooltip({
  diagram,
  preview,
  onViewDetails,
}: {
  diagram: MeasurementDiagram;
  preview: {
    definition: MeasurementDefinition;
    occurrence: MeasurementOccurrence;
    touch: boolean;
  };
  onViewDetails: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    const figure = tooltip?.closest<HTMLElement>(".measurement-figure");
    const diagramScroll = figure?.querySelector<HTMLElement>(
      ".measurement-diagram-scroll",
    );
    const stage = figure?.querySelector<HTMLElement>(
      ".measurement-diagram-stage",
    );
    const anchor = figure?.querySelector<SVGCircleElement>(
      `[data-measurement-number="${preview.occurrence.number}"] .measurement-number-backdrop`,
    );
    if (!tooltip || !figure || !diagramScroll || !stage || !anchor) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const figureRect = figure.getBoundingClientRect();
      const scrollRect = diagramScroll.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const visualViewport = window.visualViewport;
      const viewportLeft = visualViewport?.offsetLeft ?? 0;
      const viewportTop = visualViewport?.offsetTop ?? 0;
      const viewportRight =
        viewportLeft + (visualViewport?.width ?? window.innerWidth);
      const viewportBottom =
        viewportTop + (visualViewport?.height ?? window.innerHeight);
      const safe = preview.touch ? 8 : 10;
      const horizontalSafe = preview.touch ? 1 : safe;
      const area = {
        left: Math.max(
          figureRect.left + horizontalSafe,
          scrollRect.left + horizontalSafe,
          viewportLeft + horizontalSafe,
        ),
        right: Math.min(
          figureRect.right - horizontalSafe,
          scrollRect.right - horizontalSafe,
          viewportRight - horizontalSafe,
        ),
        top: Math.max(scrollRect.top + safe, viewportTop + safe),
        bottom: Math.min(scrollRect.bottom - safe, viewportBottom - safe),
      };
      const width = tooltipRect.width;
      const height = tooltipRect.height;
      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), Math.max(min, max));
      const fits = (left: number, top: number) =>
        left >= area.left &&
        left + width <= area.right &&
        top >= area.top &&
        top + height <= area.bottom;
      let left = figureRect.left + safe;
      let top = stageRect.bottom + safe;
      let placement = "below";

      const centerX = anchorRect.left + anchorRect.width / 2;
      const centerY = anchorRect.top + anchorRect.height / 2;
      const anchoredCandidates = [
        {
          placement: "top",
          left: centerX - width / 2,
          top: anchorRect.top - height - safe,
        },
        {
          placement: "bottom",
          left: centerX - width / 2,
          top: anchorRect.bottom + safe,
        },
        {
          placement: "left",
          left: anchorRect.left - width - safe,
          top: centerY - height / 2,
        },
        {
          placement: "right",
          left: anchorRect.right + safe,
          top: centerY - height / 2,
        },
      ];

      if (!preview.touch) {
        const candidate = anchoredCandidates.find((item) =>
          fits(item.left, item.top),
        );
        if (candidate) {
          ({ left, top, placement } = candidate);
        } else {
          const preferred = anchoredCandidates[0]!;
          left = clamp(preferred.left, area.left, area.right - width);
          top = clamp(preferred.top, area.top, area.bottom - height);
          placement = "clamped";
        }
      } else {
        const belowLeft = clamp(
          figureRect.left + 1,
          area.left,
          area.right - width,
        );
        const belowTop = stageRect.bottom;
        if (fits(belowLeft, belowTop)) {
          left = belowLeft;
          top = belowTop;
        } else {
          const candidate = anchoredCandidates.find((item) =>
            fits(item.left, item.top),
          );
          if (candidate) {
            ({ left, top, placement } = candidate);
          } else {
            left = clamp(centerX - width / 2, area.left, area.right - width);
            top = clamp(area.bottom - height, area.top, area.bottom - height);
            placement = "viewport-bottom";
          }
        }
      }

      tooltip.style.setProperty(
        "--measurement-tooltip-left",
        `${Math.round(left - figureRect.left)}px`,
      );
      tooltip.style.setProperty(
        "--measurement-tooltip-top",
        `${Math.round(top - figureRect.top)}px`,
      );
      tooltip.dataset.placement = placement;
      tooltip.dataset.positioned = "true";
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    diagramScroll.addEventListener("scroll", requestUpdate, {
      passive: true,
    });
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.visualViewport?.addEventListener("scroll", requestUpdate);
    window.visualViewport?.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      diagramScroll.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.visualViewport?.removeEventListener("scroll", requestUpdate);
      window.visualViewport?.removeEventListener("resize", requestUpdate);
    };
  }, [diagram.id, preview.occurrence.number, preview.touch]);

  return (
    <div
      ref={tooltipRef}
      className={`measurement-tooltip measurement-tooltip--${preview.touch ? "touch" : "hover"}`}
      role="tooltip"
      id={`measurement-tooltip-${diagram.id}-${preview.definition.number}`}
      data-positioned="false"
    >
      {preview.touch ? (
        <button type="button" onClick={onViewDetails}>
          {preview.definition.number}. {preview.definition.name}
        </button>
      ) : (
        <span>
          {preview.definition.number}. {preview.definition.name}
        </span>
      )}
    </div>
  );
}
