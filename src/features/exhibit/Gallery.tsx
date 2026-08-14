"use client";

import Image from "next/image";
import {
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
  useRef,
  useState,
} from "react";

import {
  canonicalViewLabels,
  canonicalViews,
  type MediaAsset,
} from "@/domain/content/types";

const minimumZoom = 1;
const maximumZoom = 5;
const swipeThreshold = 48;

interface Point {
  x: number;
  y: number;
}

export function Gallery({
  assets,
  commonName,
}: {
  assets: MediaAsset[];
  commonName: string;
}) {
  const [requestedIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(minimumZoom);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inspectButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inspectionImageRef = useRef<HTMLImageElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const swipePointer = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  const lastTouchTap = useRef<{ at: number; x: number; y: number } | null>(
    null,
  );
  const viewerPointers = useRef(new Map<number, Point>());
  const dragGesture = useRef<{
    pointerId: number;
    start: Point;
    pan: Point;
  } | null>(null);
  const pinchGesture = useRef<{
    distance: number;
    zoom: number;
    pan: Point;
    center: Point;
  } | null>(null);
  const zoomRef = useRef(minimumZoom);
  const panRef = useRef<Point>({ x: 0, y: 0 });
  const activeIndex = assets.length === 0 ? 0 : requestedIndex % assets.length;
  const activeAsset = assets[activeIndex];

  if (!activeAsset) {
    return (
      <section
        className="gallery gallery-empty"
        aria-labelledby="gallery-title"
      >
        <h2 id="gallery-title">Specimen photography</h2>
        <p>No reviewed media is available for this specimen.</p>
      </section>
    );
  }

  function resetInspection() {
    zoomRef.current = minimumZoom;
    panRef.current = { x: 0, y: 0 };
    setZoom(minimumZoom);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    viewerPointers.current.clear();
    dragGesture.current = null;
    pinchGesture.current = null;
  }

  function selectIndex(index: number) {
    setActiveIndex((index + assets.length) % assets.length);
    resetInspection();
  }

  function handleGalleryKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectIndex(activeIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectIndex(activeIndex - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      selectIndex(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      selectIndex(assets.length - 1);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      openInspection(event.currentTarget);
    }
  }

  function handleGalleryPointerDown(event: PointerEvent<HTMLElement>) {
    event.currentTarget.focus({ preventScroll: true });
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    swipePointer.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    trySetPointerCapture(event.currentTarget, event.pointerId);
  }

  function handleGalleryPointerUp(event: PointerEvent<HTMLElement>) {
    const gesture = swipePointer.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    swipePointer.current = null;
    const distanceX = event.clientX - gesture.startX;
    const distanceY = event.clientY - gesture.startY;

    if (
      Math.abs(distanceX) >= swipeThreshold &&
      Math.abs(distanceX) > Math.abs(distanceY) * 1.2
    ) {
      selectIndex(activeIndex + (distanceX < 0 ? 1 : -1));
      return;
    }

    if (Math.hypot(distanceX, distanceY) > 12) return;
    const previousTap = lastTouchTap.current;
    const now = performance.now();
    if (
      previousTap &&
      now - previousTap.at < 325 &&
      Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y) <
        28
    ) {
      lastTouchTap.current = null;
      openInspection(event.currentTarget);
    } else {
      lastTouchTap.current = {
        at: now,
        x: event.clientX,
        y: event.clientY,
      };
    }
  }

  function openInspection(trigger: HTMLElement) {
    if (dialogRef.current?.open) return;
    resetInspection();
    returnFocusRef.current = trigger;
    dialogRef.current?.showModal();
  }

  function closeInspection() {
    dialogRef.current?.close();
  }

  function constrainPan(nextPan: Point, nextZoom: number): Point {
    if (nextZoom <= minimumZoom) return { x: 0, y: 0 };
    const viewport = viewportRef.current;
    const image = inspectionImageRef.current;
    if (!viewport || !image) return nextPan;
    const maximumX = Math.max(
      0,
      (image.offsetWidth * nextZoom - viewport.clientWidth) / 2,
    );
    const maximumY = Math.max(
      0,
      (image.offsetHeight * nextZoom - viewport.clientHeight) / 2,
    );
    return {
      x: Math.min(maximumX, Math.max(-maximumX, nextPan.x)),
      y: Math.min(maximumY, Math.max(-maximumY, nextPan.y)),
    };
  }

  function commitInspection(nextZoom: number, nextPan: Point) {
    const constrainedZoom = Math.min(
      maximumZoom,
      Math.max(minimumZoom, nextZoom),
    );
    const constrainedPan = constrainPan(nextPan, constrainedZoom);
    zoomRef.current = constrainedZoom;
    panRef.current = constrainedPan;
    setZoom(constrainedZoom);
    setPan(constrainedPan);
  }

  function zoomAt(nextZoom: number, clientPoint?: Point) {
    const currentZoom = zoomRef.current;
    const currentPan = panRef.current;
    const constrainedZoom = Math.min(
      maximumZoom,
      Math.max(minimumZoom, nextZoom),
    );
    let nextPan = currentPan;
    const viewport = viewportRef.current;

    if (clientPoint && viewport && currentZoom > 0) {
      const rect = viewport.getBoundingClientRect();
      const focalPoint = {
        x: clientPoint.x - (rect.left + rect.width / 2),
        y: clientPoint.y - (rect.top + rect.height / 2),
      };
      const ratio = constrainedZoom / currentZoom;
      nextPan = {
        x: focalPoint.x - (focalPoint.x - currentPan.x) * ratio,
        y: focalPoint.y - (focalPoint.y - currentPan.y) * ratio,
      };
    }

    commitInspection(constrainedZoom, nextPan);
  }

  function handleInspectionWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    zoomAt(zoomRef.current * Math.exp(-delta * 0.002), {
      x: event.clientX,
      y: event.clientY,
    });
  }

  function handleInspectionPointerDown(event: PointerEvent<HTMLDivElement>) {
    viewerPointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    trySetPointerCapture(event.currentTarget, event.pointerId);
    const points = [...viewerPointers.current.values()];

    if (points.length === 1) {
      dragGesture.current = {
        pointerId: event.pointerId,
        start: points[0]!,
        pan: panRef.current,
      };
      setIsDragging(zoomRef.current > minimumZoom);
    } else if (points.length === 2) {
      const [first, second] = points as [Point, Point];
      pinchGesture.current = {
        distance: pointDistance(first, second),
        zoom: zoomRef.current,
        pan: panRef.current,
        center: pointCenter(first, second),
      };
      dragGesture.current = null;
      setIsDragging(true);
    }
  }

  function handleInspectionPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!viewerPointers.current.has(event.pointerId)) return;
    viewerPointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const points = [...viewerPointers.current.values()];

    if (points.length >= 2 && pinchGesture.current) {
      const [first, second] = points as [Point, Point];
      const gesture = pinchGesture.current;
      const currentCenter = pointCenter(first, second);
      const currentDistance = pointDistance(first, second);
      const targetZoom = Math.min(
        maximumZoom,
        Math.max(
          minimumZoom,
          gesture.zoom * (currentDistance / Math.max(gesture.distance, 1)),
        ),
      );
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const viewportCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const startCenter = {
        x: gesture.center.x - viewportCenter.x,
        y: gesture.center.y - viewportCenter.y,
      };
      const movedCenter = {
        x: currentCenter.x - viewportCenter.x,
        y: currentCenter.y - viewportCenter.y,
      };
      const ratio = targetZoom / gesture.zoom;
      commitInspection(targetZoom, {
        x: movedCenter.x - (startCenter.x - gesture.pan.x) * ratio,
        y: movedCenter.y - (startCenter.y - gesture.pan.y) * ratio,
      });
      return;
    }

    const gesture = dragGesture.current;
    if (
      points.length === 1 &&
      gesture?.pointerId === event.pointerId &&
      zoomRef.current > minimumZoom
    ) {
      commitInspection(zoomRef.current, {
        x: gesture.pan.x + event.clientX - gesture.start.x,
        y: gesture.pan.y + event.clientY - gesture.start.y,
      });
    }
  }

  function handleInspectionPointerEnd(event: PointerEvent<HTMLDivElement>) {
    viewerPointers.current.delete(event.pointerId);
    const remaining = [...viewerPointers.current.entries()];
    pinchGesture.current = null;

    if (remaining.length === 1) {
      const [pointerId, point] = remaining[0]!;
      dragGesture.current = {
        pointerId,
        start: point,
        pan: panRef.current,
      };
      setIsDragging(zoomRef.current > minimumZoom);
    } else {
      dragGesture.current = null;
      setIsDragging(false);
    }
  }

  function handleInspectionKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomAt(zoomRef.current + 0.5);
      return;
    }
    if (event.key === "-") {
      event.preventDefault();
      zoomAt(zoomRef.current - 0.5);
      return;
    }
    if (event.key === "0") {
      event.preventDefault();
      resetInspection();
      return;
    }
    if (zoomRef.current === minimumZoom && event.key === "ArrowRight") {
      event.preventDefault();
      selectIndex(activeIndex + 1);
    }
    if (zoomRef.current === minimumZoom && event.key === "ArrowLeft") {
      event.preventDefault();
      selectIndex(activeIndex - 1);
    }
  }

  return (
    <section className="gallery" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <h2 id="gallery-title">Specimen photography</h2>
        <p className="gallery-count" aria-live="polite">
          {activeIndex + 1} / {assets.length} ·{" "}
          {canonicalViewLabels[activeAsset.view]}
        </p>
      </div>

      <div className="gallery-viewer">
        <div className="gallery-main">
          <figure
            ref={stageRef}
            className="gallery-stage"
            tabIndex={0}
            aria-label={`${commonName} gallery. Use left and right arrow keys to change view; press Enter to inspect the image.`}
            onDoubleClick={(event) => {
              event.preventDefault();
              openInspection(event.currentTarget);
            }}
            onKeyDown={handleGalleryKeyDown}
            onPointerDown={handleGalleryPointerDown}
            onPointerUp={handleGalleryPointerUp}
          >
            <div className="gallery-light" aria-hidden="true" />
            <Image
              key={activeAsset.publicPath}
              className="gallery-image"
              src={activeAsset.publicPath}
              alt={activeAsset.alt}
              width={activeAsset.width}
              height={activeAsset.height}
              sizes="(max-width: 48rem) calc(100vw - 2rem), (max-width: 64rem) calc(100vw - 6rem), (max-width: 100rem) calc(100vw - 23rem), 1250px"
              quality={90}
              priority={activeIndex === 0}
            />
            <figcaption>
              <span>{canonicalViewLabels[activeAsset.view]} view</span>
              <span>Photo: {activeAsset.credit}</span>
            </figcaption>
          </figure>

          <div className="gallery-controls" aria-label="Gallery controls">
            <button type="button" onClick={() => selectIndex(activeIndex - 1)}>
              <span aria-hidden="true">←</span> Previous
            </button>
            <button
              ref={inspectButtonRef}
              type="button"
              onClick={(event) => openInspection(event.currentTarget)}
            >
              Inspect image
            </button>
            <button type="button" onClick={() => selectIndex(activeIndex + 1)}>
              Next <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className="gallery-hint">
            <span className="desktop-gallery-hint">
              Click the image, then use ← or → to change view. Double-click to
              inspect.
            </span>
            <span className="touch-gallery-hint">
              Swipe to change view. Double-tap to inspect.
            </span>
          </p>
        </div>

        <div className="gallery-thumbnails" aria-label="Choose specimen view">
          {assets.map((asset, index) => (
            <button
              type="button"
              key={asset.view}
              className={index === activeIndex ? "is-selected" : undefined}
              aria-pressed={index === activeIndex}
              aria-label={`Show ${canonicalViewLabels[asset.view].toLowerCase()} view`}
              onClick={() => selectIndex(index)}
            >
              <Image
                src={asset.publicPath}
                alt=""
                width={asset.width}
                height={asset.height}
                sizes="220px"
                quality={70}
              />
              <span>{canonicalViewLabels[asset.view]}</span>
            </button>
          ))}
        </div>
      </div>

      {assets.length < canonicalViews.length ? (
        <p className="gallery-incomplete" role="status">
          Incomplete media set: {assets.length} of {canonicalViews.length}{" "}
          canonical views are available.
        </p>
      ) : null}

      <noscript>
        <div className="no-script-gallery">
          <p>All specimen views (interactive controls require JavaScript):</p>
          <ol>
            {assets.map((asset) => (
              <li key={asset.view}>
                <Image
                  src={asset.publicPath}
                  alt={asset.alt}
                  width={asset.width}
                  height={asset.height}
                />
                <span>{canonicalViewLabels[asset.view]}</span>
              </li>
            ))}
          </ol>
        </div>
      </noscript>

      <dialog
        ref={dialogRef}
        className="inspection-dialog"
        aria-labelledby="inspection-title"
        aria-describedby="inspection-help"
        onClose={() => {
          resetInspection();
          returnFocusRef.current?.focus();
        }}
        onKeyDown={handleInspectionKeyDown}
      >
        <div className="inspection-toolbar">
          <div className="inspection-title-block">
            <p>High-resolution inspection</p>
            <h2 id="inspection-title">
              {canonicalViewLabels[activeAsset.view]} view
            </h2>
          </div>
          <div className="inspection-view-controls" aria-label="Image views">
            <button
              type="button"
              aria-label="Previous view"
              onClick={() => selectIndex(activeIndex - 1)}
            >
              ←
            </button>
            <span aria-live="polite">
              {activeIndex + 1} / {assets.length}
            </span>
            <button
              type="button"
              aria-label="Next view"
              onClick={() => selectIndex(activeIndex + 1)}
            >
              →
            </button>
          </div>
          <button type="button" onClick={closeInspection} autoFocus>
            Close <span aria-hidden="true">×</span>
          </button>
        </div>

        <div
          ref={viewportRef}
          className={`inspection-viewport${isDragging ? "is-dragging" : ""}`}
          onDoubleClick={(event) =>
            zoomAt(zoomRef.current < 2.5 ? 2.5 : minimumZoom, {
              x: event.clientX,
              y: event.clientY,
            })
          }
          onPointerCancel={handleInspectionPointerEnd}
          onPointerDown={handleInspectionPointerDown}
          onPointerMove={handleInspectionPointerMove}
          onPointerUp={handleInspectionPointerEnd}
          onWheel={handleInspectionWheel}
        >
          <Image
            ref={inspectionImageRef}
            className="inspection-image"
            src={activeAsset.publicPath}
            alt={activeAsset.alt}
            width={activeAsset.width}
            height={activeAsset.height}
            sizes="100vw"
            quality={100}
            unoptimized
            draggable={false}
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            }}
          />
        </div>

        <div className="inspection-footer">
          <div className="inspection-zoom-controls" aria-label="Zoom controls">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => zoomAt(zoomRef.current - 0.5)}
              disabled={zoom <= minimumZoom}
            >
              −
            </button>
            <label>
              <span className="visually-hidden">Zoom level</span>
              <input
                type="range"
                min={minimumZoom}
                max={maximumZoom}
                step="0.1"
                value={zoom}
                onChange={(event) => zoomAt(Number(event.currentTarget.value))}
              />
            </label>
            <output aria-live="polite">{Math.round(zoom * 100)}%</output>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => zoomAt(zoomRef.current + 0.5)}
              disabled={zoom >= maximumZoom}
            >
              +
            </button>
            <button type="button" onClick={resetInspection}>
              Reset
            </button>
          </div>
          <p id="inspection-help">
            Scroll or pinch to zoom; drag to move. Double-click to zoom or
            reset. Photo: {activeAsset.credit} · All rights reserved.
          </p>
        </div>
      </dialog>
    </section>
  );
}

function pointDistance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function pointCenter(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function trySetPointerCapture(element: HTMLElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Synthetic test pointers are not registered as active browser pointers.
  }
}
