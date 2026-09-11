"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getCalibratedCanvasSize } from "@/domain/comparison/calibration";
import type {
  ComparisonView,
  SkullComparisonRecord,
  SkullComparisonView,
} from "@/domain/comparison/types";

import {
  arrangeComparisonLayers,
  clamp,
  comparisonWorldHeight,
  comparisonWorldPixelsPerMillimetre,
  comparisonWorldWidth,
  getFittedComparisonCamera,
  getNextLayerZ,
  maximumFieldZoom,
  minimumFieldZoom,
  type ComparisonCamera,
  type ComparisonLayerGeometry,
  type ComparisonLayerPlacement,
} from "./workbenchLayout";
import {
  arrangementValues,
  type ComparisonArrangement,
} from "./workbenchState";

const subjectMarkers = ["●", "■", "▲", "◆", "⬟"] as const;

export interface SelectedComparisonSubject {
  subject: { id: string; views: ComparisonView[] };
  record: SkullComparisonRecord;
}

interface FieldLayer extends ComparisonLayerGeometry {
  record: SkullComparisonRecord;
  media: SkullComparisonView;
}

type ActiveGesture =
  | {
      mode: "layer";
      pointerId: number;
      key: string;
      startClientX: number;
      startClientY: number;
      origin: ComparisonLayerPlacement;
      latest: ComparisonLayerPlacement;
    }
  | {
      mode: "camera";
      pointerId: number;
      startClientX: number;
      startClientY: number;
      origin: ComparisonCamera;
    };

export function ComparisonField({
  selected,
  arrangement,
  difference,
  opacityBySubject,
  onArrangementChange,
  onRemoveView,
  onResetOpacity,
  onClear,
}: {
  selected: SelectedComparisonSubject[];
  arrangement: ComparisonArrangement;
  difference: [string, string] | null;
  opacityBySubject: Record<string, number>;
  onArrangementChange: (arrangement: ComparisonArrangement) => void;
  onRemoveView: (subjectId: string, view: ComparisonView) => void;
  onResetOpacity: () => void;
  onClear: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef(new Map<string, HTMLElement>());
  const activeGesture = useRef<ActiveGesture | null>(null);
  const touchPointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchGesture = useRef<{
    distance: number;
    midpoint: { x: number; y: number };
    camera: ComparisonCamera;
  } | null>(null);
  const animationFrame = useRef<number | null>(null);
  const prePrintCamera = useRef<ComparisonCamera | null>(null);
  const hasInitialFit = useRef(false);
  const previousArrangement = useRef(arrangement);
  const previousDifference = useRef(difference?.join("|") ?? "");
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(null);
  const [showScaleBar, setShowScaleBar] = useState(false);
  const [camera, setCamera] = useState<ComparisonCamera>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const layers = useMemo(() => buildFieldLayers(selected), [selected]);
  const layerSignature = layers.map(({ key }) => key).join("|");
  const differenceSignature = difference?.join("|") ?? "";
  const initialPlacements = useMemo(
    () => arrangeComparisonLayers(layers, arrangement, difference),
    // The stable signature intentionally owns recalculation when layers change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layerSignature],
  );
  const [placements, setPlacements] =
    useState<Record<string, ComparisonLayerPlacement>>(initialPlacements);
  const [status, setStatus] = useState("");
  const printState = useRef({ camera, layers, placements, viewportSize });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => {
      const bounds = viewport.getBoundingClientRect();
      setViewportSize({ width: bounds.width, height: bounds.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- The URL-controlled layer and arrangement props must reconcile the field's transient placements and camera after browser-history or responsive viewport changes. */
  useEffect(() => {
    const arranged = arrangeComparisonLayers(layers, arrangement, difference);
    const overlayPairChanged =
      arrangement === "overlay-pair" &&
      previousDifference.current !== differenceSignature;
    previousDifference.current = differenceSignature;
    if (previousArrangement.current !== arrangement || overlayPairChanged) {
      previousArrangement.current = arrangement;
      setPlacements(arranged);
      setSelectedLayerKey(null);
      if (viewportSize.width > 0) {
        setCamera(getFittedComparisonCamera(layers, arranged, viewportSize));
      }
      setStatus(`${formatArrangement(arrangement)} arrangement applied.`);
      return;
    }
    setPlacements((current) => {
      const next: Record<string, ComparisonLayerPlacement> = {};
      for (const layer of layers) {
        next[layer.key] = current[layer.key] ?? arranged[layer.key]!;
      }
      return next;
    });
    setSelectedLayerKey((current) =>
      current && layers.some(({ key }) => key === current) ? current : null,
    );
    if (layers.length === 0) {
      hasInitialFit.current = false;
      setCamera({ x: 0, y: 0, zoom: 1 });
    }
    // Arrangement and pair changes have their own deliberate toolbar behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerSignature, arrangement, differenceSignature]);

  useEffect(() => {
    if (
      hasInitialFit.current ||
      layers.length === 0 ||
      viewportSize.width <= 0 ||
      Object.keys(placements).length === 0
    ) {
      return;
    }
    hasInitialFit.current = true;
    setCamera(getFittedComparisonCamera(layers, placements, viewportSize));
  }, [layers, placements, viewportSize]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(
    () => () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    },
    [],
  );

  useEffect(() => {
    printState.current = { camera, layers, placements, viewportSize };
  }, [camera, layers, placements, viewportSize]);

  useEffect(() => {
    function fitForPrint() {
      const current = printState.current;
      prePrintCamera.current = current.camera;
      setCamera(
        getFittedComparisonCamera(
          current.layers,
          current.placements,
          current.viewportSize,
        ),
      );
    }

    function restoreAfterPrint() {
      if (prePrintCamera.current) {
        setCamera(prePrintCamera.current);
      }
      prePrintCamera.current = null;
    }

    window.addEventListener("beforeprint", fitForPrint);
    window.addEventListener("afterprint", restoreAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", fitForPrint);
      window.removeEventListener("afterprint", restoreAfterPrint);
    };
  }, []);

  function fitAll(message = "All active views fitted in the field.") {
    setCamera(getFittedComparisonCamera(layers, placements, viewportSize));
    setStatus(message);
  }

  function resetLayout() {
    const arranged = arrangeComparisonLayers(layers, arrangement, difference);
    setPlacements(arranged);
    setSelectedLayerKey(null);
    onResetOpacity();
    setCamera(getFittedComparisonCamera(layers, arranged, viewportSize));
    setStatus("Layout, stacking, opacity, and field view reset.");
  }

  function setZoom(nextZoom: number, focalPoint?: { x: number; y: number }) {
    setCamera((current) => {
      const zoom = clamp(nextZoom, minimumFieldZoom, maximumFieldZoom);
      if (!focalPoint || current.zoom === zoom) return { ...current, zoom };
      const ratio = zoom / current.zoom;
      return {
        x: focalPoint.x - (focalPoint.x - current.x) * ratio,
        y: focalPoint.y - (focalPoint.y - current.y) * ratio,
        zoom,
      };
    });
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    setZoom(camera.zoom * Math.exp(-event.deltaY * 0.003), {
      x: event.clientX - bounds.left - bounds.width / 2,
      y: event.clientY - bounds.top - bounds.height / 2,
    });
  }

  function beginCameraPan(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if ((event.target as Element).closest("[data-comparison-layer]")) return;
    if (event.pointerType === "touch") {
      touchPointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
      if (touchPointers.current.size === 2) {
        const [first, second] = [...touchPointers.current.values()];
        if (first && second) {
          pinchGesture.current = {
            distance: pointDistance(first, second),
            midpoint: pointMidpoint(first, second),
            camera,
          };
          event.currentTarget.dataset.panning = "true";
        }
      }
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    activeGesture.current = {
      mode: "camera",
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      origin: camera,
    };
    event.currentTarget.dataset.panning = "true";
  }

  function beginLayerDrag(
    event: PointerEvent<HTMLButtonElement>,
    layer: FieldLayer,
  ) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const placement = placements[layer.key];
    if (!placement) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const raised = {
      ...placement,
      z: getNextLayerZ(placements),
    };
    setPlacements((current) => ({ ...current, [layer.key]: raised }));
    setSelectedLayerKey(layer.key);
    activeGesture.current = {
      mode: "layer",
      pointerId: event.pointerId,
      key: layer.key,
      startClientX: event.clientX,
      startClientY: event.clientY,
      origin: raised,
      latest: raised,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType === "touch" &&
      touchPointers.current.has(event.pointerId)
    ) {
      touchPointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      const pinch = pinchGesture.current;
      const [first, second] = [...touchPointers.current.values()];
      if (pinch && first && second) {
        event.preventDefault();
        const bounds = event.currentTarget.getBoundingClientRect();
        const midpoint = pointMidpoint(first, second);
        const distance = Math.max(1, pointDistance(first, second));
        const zoom = clamp(
          pinch.camera.zoom * (distance / Math.max(1, pinch.distance)),
          minimumFieldZoom,
          maximumFieldZoom,
        );
        const ratio = zoom / pinch.camera.zoom;
        const initialFocal = {
          x: pinch.midpoint.x - bounds.left - bounds.width / 2,
          y: pinch.midpoint.y - bounds.top - bounds.height / 2,
        };
        const currentFocal = {
          x: midpoint.x - bounds.left - bounds.width / 2,
          y: midpoint.y - bounds.top - bounds.height / 2,
        };
        setCamera({
          x: currentFocal.x - (initialFocal.x - pinch.camera.x) * ratio,
          y: currentFocal.y - (initialFocal.y - pinch.camera.y) * ratio,
          zoom,
        });
      }
      return;
    }
    const gesture = activeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (gesture.mode === "camera") {
      setCamera({
        ...gesture.origin,
        x: gesture.origin.x + event.clientX - gesture.startClientX,
        y: gesture.origin.y + event.clientY - gesture.startClientY,
      });
      return;
    }
    const latest = {
      ...gesture.origin,
      x:
        gesture.origin.x + (event.clientX - gesture.startClientX) / camera.zoom,
      y:
        gesture.origin.y + (event.clientY - gesture.startClientY) / camera.zoom,
    };
    gesture.latest = latest;
    if (animationFrame.current !== null) return;
    animationFrame.current = requestAnimationFrame(() => {
      animationFrame.current = null;
      const active = activeGesture.current;
      if (!active || active.mode !== "layer") return;
      applyLayerPosition(layerRefs.current.get(active.key), active.latest);
    });
  }

  function endPointerGesture(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      touchPointers.current.delete(event.pointerId);
      if (touchPointers.current.size < 2) {
        pinchGesture.current = null;
        delete event.currentTarget.dataset.panning;
        if (touchPointers.current.size === 1) {
          setStatus("Field pan and zoom updated.");
        }
      }
    }
    const gesture = activeGesture.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (gesture.mode === "layer") {
      setPlacements((current) => ({
        ...current,
        [gesture.key]: gesture.latest,
      }));
      setStatus("Layer position updated.");
    }
    activeGesture.current = null;
    delete event.currentTarget.dataset.panning;
  }

  function moveLayer(key: string, deltaX: number, deltaY: number) {
    setPlacements((current) => {
      const placement = current[key];
      if (!placement) return current;
      return {
        ...current,
        [key]: {
          ...placement,
          x: placement.x + deltaX,
          y: placement.y + deltaY,
        },
      };
    });
    setStatus("Layer position updated.");
  }

  function changeLayerStack(key: string, direction: -1 | 1) {
    setPlacements((current) => {
      const placement = current[key];
      if (!placement) return current;
      const zValues = Object.values(current).map(({ z }) => z);
      return {
        ...current,
        [key]: {
          ...placement,
          z:
            direction > 0 ? Math.max(...zValues) + 1 : Math.min(...zValues) - 1,
        },
      };
    });
    setStatus(direction > 0 ? "Layer moved forward." : "Layer moved back.");
  }

  const worldStyle = {
    "--camera-x": `${camera.x}px`,
    "--camera-y": `${camera.y}px`,
    "--camera-zoom": camera.zoom,
    "--comparison-world-width": `${comparisonWorldWidth}px`,
    "--comparison-world-height": `${comparisonWorldHeight}px`,
  } as CSSProperties;

  return (
    <section
      className="compare-field-panel"
      aria-labelledby="comparison-field-title"
    >
      <div className="compare-field-toolbar">
        <div className="compare-field-title">
          <p className="data-label">Shared physical scale</p>
          <h2 id="comparison-field-title">Comparison field</h2>
        </div>
        <div className="compare-field-controls" aria-label="Field controls">
          <label className="compare-arrangement-control">
            <span>Arrange</span>
            <select
              value={arrangement}
              onChange={(event) =>
                onArrangementChange(
                  event.currentTarget.value as ComparisonArrangement,
                )
              }
            >
              {arrangementValues.map((value) => (
                <option value={value} key={value}>
                  {formatArrangement(value)}
                </option>
              ))}
            </select>
          </label>
          <div className="compare-zoom-control">
            <span id="field-zoom-label">Field zoom</span>
            <button
              type="button"
              title="Zoom out"
              aria-label="Zoom field out"
              onClick={() => setZoom(camera.zoom - 0.1)}
            >
              −
            </button>
            <input
              aria-labelledby="field-zoom-label"
              type="range"
              min={25}
              max={300}
              step={5}
              value={Math.round(camera.zoom * 100)}
              onChange={(event) =>
                setZoom(Number(event.currentTarget.value) / 100)
              }
            />
            <button
              type="button"
              title="Zoom in"
              aria-label="Zoom field in"
              onClick={() => setZoom(camera.zoom + 0.1)}
            >
              +
            </button>
            <output htmlFor="field-zoom-label">
              {Math.round(camera.zoom * 100)}%
            </output>
          </div>
          <button type="button" onClick={() => setZoom(1)}>
            100%
          </button>
          <button type="button" onClick={() => fitAll()}>
            Fit all
          </button>
          <details className="compare-field-more">
            <summary aria-label="More field controls">•••</summary>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showScaleBar}
                  onChange={(event) =>
                    setShowScaleBar(event.currentTarget.checked)
                  }
                />
                Show 100 mm scale bar
              </label>
              <button type="button" onClick={resetLayout}>
                Reset layout
              </button>
              <button type="button" onClick={onClear}>
                Clear all
              </button>
            </div>
          </details>
        </div>
      </div>
      <div
        ref={viewportRef}
        className="comparison-field"
        style={worldStyle}
        data-arrangement={arrangement}
        onWheel={handleWheel}
        onPointerDown={beginCameraPan}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerGesture}
        onPointerCancel={endPointerGesture}
      >
        {layers.length > 0 ? (
          <div className="comparison-camera">
            <div className="comparison-world">
              {layers.map((layer) => {
                const placement = placements[layer.key];
                return placement ? (
                  <ComparisonFieldLayer
                    key={layer.key}
                    layer={layer}
                    placement={placement}
                    opacity={opacityBySubject[layer.subjectId] ?? 100}
                    selected={selectedLayerKey === layer.key}
                    register={(element) => {
                      if (element) layerRefs.current.set(layer.key, element);
                      else layerRefs.current.delete(layer.key);
                    }}
                    onSelect={() => setSelectedLayerKey(layer.key)}
                    onPointerDown={(event) => beginLayerDrag(event, layer)}
                    onMove={(x, y) => moveLayer(layer.key, x, y)}
                    onStack={(direction) =>
                      changeLayerStack(layer.key, direction)
                    }
                    onRemove={() =>
                      onRemoveView(layer.subjectId, layer.media.view)
                    }
                  />
                ) : null;
              })}
              {showScaleBar ? <ComparisonScaleBar /> : null}
            </div>
          </div>
        ) : (
          <div className="comparison-empty-state">
            <h2>Add a skull to begin</h2>
            <p>Select up to five calibrated specimens or references.</p>
          </div>
        )}
      </div>
      <div className="comparison-field-footer">
        <p>
          Drag a skull to move it; drag empty space to pan. Hold Ctrl or Command
          while scrolling to zoom.
        </p>
        <p className="comparison-field-status" aria-live="polite">
          {status}
        </p>
      </div>
      <ul className="comparison-print-credits" aria-label="Photograph credits">
        {layers.map((layer) => (
          <li key={layer.key}>
            Skull {layer.subjectIndex + 1} · {formatViewLabel(layer.media.view)}{" "}
            · Photograph: {layer.media.credit}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ComparisonFieldLayer({
  layer,
  placement,
  opacity,
  selected,
  register,
  onSelect,
  onPointerDown,
  onMove,
  onStack,
  onRemove,
}: {
  layer: FieldLayer;
  placement: ComparisonLayerPlacement;
  opacity: number;
  selected: boolean;
  register: (element: HTMLElement | null) => void;
  onSelect: () => void;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onMove: (x: number, y: number) => void;
  onStack: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const { media, subjectIndex } = layer;
  const [imageFailed, setImageFailed] = useState(false);
  const flip = media.orientation === "left";
  const subjectX = flip
    ? media.width - media.subjectBounds.x - media.subjectBounds.width
    : media.subjectBounds.x;
  const style = {
    "--layer-x": `${placement.x}px`,
    "--layer-y": `${placement.y}px`,
    "--layer-z": placement.z,
    "--layer-width": `${layer.width}px`,
    "--layer-height": `${layer.height}px`,
    "--layer-opacity": opacity / 100,
    "--subject-left": `${(subjectX / media.width) * 100}%`,
    "--subject-top": `${(media.subjectBounds.y / media.height) * 100}%`,
    "--subject-width": `${(media.subjectBounds.width / media.width) * 100}%`,
    "--subject-height": `${(media.subjectBounds.height / media.height) * 100}%`,
  } as CSSProperties;
  const label = `Skull ${subjectIndex + 1} · ${formatViewLabel(media.view)}`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 20 : 4;
    if (event.key === "ArrowLeft") onMove(-step, 0);
    else if (event.key === "ArrowRight") onMove(step, 0);
    else if (event.key === "ArrowUp") onMove(0, -step);
    else if (event.key === "ArrowDown") onMove(0, step);
    else if (event.key === "[") onStack(-1);
    else if (event.key === "]") onStack(1);
    else if (event.key === "Enter" || event.key === " ") onSelect();
    else return;
    event.preventDefault();
  }

  return (
    <figure
      ref={register}
      className="comparison-layer"
      style={style}
      data-comparison-layer=""
      data-selected={selected ? "true" : undefined}
      data-hidden={opacity === 0 ? "true" : undefined}
    >
      <div className="comparison-layer-image" aria-hidden="true">
        <Image
          src={media.publicPath}
          alt=""
          fill
          sizes="(max-width: 48rem) 70vw, 32rem"
          draggable={false}
          loading={subjectIndex < 2 ? "eager" : "lazy"}
          onError={() => setImageFailed(true)}
          style={{ transform: flip ? "scaleX(-1)" : undefined }}
        />
        {imageFailed ? (
          <span className="comparison-layer-image-fallback">
            Image unavailable · {formatViewLabel(media.view)}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        className="comparison-layer-hit"
        aria-label={`${label}. Drag or use arrow keys to move; Shift plus arrow moves farther.`}
        aria-pressed={selected}
        onFocus={onSelect}
        onClick={onSelect}
        onPointerDown={onPointerDown}
        onKeyDown={handleKeyDown}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d={media.hitPath ?? "M0 0H100V100H0Z"}
            fill="transparent"
            fillRule="nonzero"
            pointerEvents="all"
            transform={flip ? "translate(100 0) scale(-1 1)" : undefined}
          />
        </svg>
      </button>
      <span className="comparison-layer-outline" aria-hidden="true" />
      <figcaption>
        <span
          className={`subject-marker marker-${subjectIndex + 1}`}
          aria-hidden="true"
        >
          {subjectMarkers[subjectIndex]}
        </span>
        {label}
      </figcaption>
      {selected ? (
        <div
          className="comparison-layer-toolbar"
          aria-label={`${label} controls`}
        >
          <strong>{label}</strong>
          <button
            type="button"
            title="Move layer back"
            aria-label={`Move ${label} back`}
            onClick={() => onStack(-1)}
          >
            ↓
          </button>
          <button
            type="button"
            title="Move layer forward"
            aria-label={`Move ${label} forward`}
            onClick={() => onStack(1)}
          >
            ↑
          </button>
          <button
            type="button"
            title="Remove view"
            aria-label={`Remove ${label} view`}
            onClick={onRemove}
          >
            ×
          </button>
        </div>
      ) : null}
      {opacity === 0 ? (
        <span className="comparison-layer-hidden-note">Hidden</span>
      ) : null}
    </figure>
  );
}

function ComparisonScaleBar() {
  const style = {
    "--scale-bar-width": `${100 * comparisonWorldPixelsPerMillimetre}px`,
  } as CSSProperties;
  return (
    <div className="comparison-scale-bar" style={style}>
      <span aria-hidden="true" />
      <strong>100 mm</strong>
      <small>Relative scale; not monitor-calibrated</small>
    </div>
  );
}

function buildFieldLayers(selected: SelectedComparisonSubject[]): FieldLayer[] {
  return selected.flatMap(({ subject, record }, subjectIndex) =>
    subject.views.flatMap((viewName) => {
      const media = record.views.find(({ view }) => view === viewName);
      if (!media) return [];
      const measurement = record.measurements[media.calibration.measurementKey];
      const size = getCalibratedCanvasSize({
        sourceWidth: media.width,
        sourceHeight: media.height,
        calibration: media.calibration,
        measurement,
        worldPixelsPerMillimetre: comparisonWorldPixelsPerMillimetre,
      });
      return size
        ? [
            {
              key: `${record.id}:${media.view}`,
              subjectId: record.id,
              subjectIndex,
              view: media.view,
              width: size.width,
              height: size.height,
              record,
              media,
            },
          ]
        : [];
    }),
  );
}

function applyLayerPosition(
  element: HTMLElement | undefined,
  placement: ComparisonLayerPlacement,
) {
  if (!element) return;
  element.style.setProperty("--layer-x", `${placement.x}px`);
  element.style.setProperty("--layer-y", `${placement.y}px`);
}

function formatArrangement(arrangement: ComparisonArrangement) {
  return arrangement
    .split("-")
    .map((word, index) =>
      index === 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word,
    )
    .join(" ");
}

function formatViewLabel(view: ComparisonView) {
  return view === "mandible-dorsal"
    ? "Mandible — dorsal"
    : `${view.charAt(0).toUpperCase()}${view.slice(1)}`;
}

function pointDistance(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function pointMidpoint(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}
