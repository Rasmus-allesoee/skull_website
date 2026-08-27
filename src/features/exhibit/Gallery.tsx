"use client";

import Image from "next/image";
import {
  type KeyboardEvent,
  type PointerEvent,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { canonicalViewLabels, type MediaAsset } from "@/domain/content/types";

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
  const galleryTouchGesture = useRef<{
    identifier: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    startScale: number;
    hadMultiplePointers: boolean;
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
  const inspectionSwipe = useRef<{
    pointerId: number;
    start: Point;
  } | null>(null);
  const inspectionGestureHadMultiplePointers = useRef(false);
  const zoomRef = useRef(minimumZoom);
  const panRef = useRef<Point>({ x: 0, y: 0 });
  const wheelHandlerRef = useRef<(event: globalThis.WheelEvent) => void>(
    () => undefined,
  );
  const activeIndex = assets.length === 0 ? 0 : requestedIndex % assets.length;
  const activeAsset = assets[activeIndex];

  function resetInspection() {
    zoomRef.current = minimumZoom;
    panRef.current = { x: 0, y: 0 };
    setZoom(minimumZoom);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    viewerPointers.current.clear();
    dragGesture.current = null;
    pinchGesture.current = null;
    inspectionSwipe.current = null;
    inspectionGestureHadMultiplePointers.current = false;
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
    if (event.pointerType !== "pen") return;
    event.currentTarget.focus({ preventScroll: true });
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
    completeGalleryGesture(
      gesture.startX,
      gesture.startY,
      event.clientX,
      event.clientY,
      event.currentTarget,
    );
  }

  function handleGalleryPointerCancel(event: PointerEvent<HTMLElement>) {
    if (swipePointer.current?.pointerId === event.pointerId) {
      swipePointer.current = null;
    }
    lastTouchTap.current = null;
  }

  function handleGalleryTouchStart(event: ReactTouchEvent<HTMLElement>) {
    event.currentTarget.focus({ preventScroll: true });
    if (event.touches.length !== 1) {
      if (galleryTouchGesture.current) {
        galleryTouchGesture.current.hadMultiplePointers = true;
      }
      lastTouchTap.current = null;
      return;
    }
    const touch = event.touches[0]!;
    galleryTouchGesture.current = {
      identifier: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      startScale: getPageScale(),
      hadMultiplePointers: false,
    };
  }

  function handleGalleryTouchMove(event: ReactTouchEvent<HTMLElement>) {
    if (event.touches.length > 1 && galleryTouchGesture.current) {
      galleryTouchGesture.current.hadMultiplePointers = true;
      lastTouchTap.current = null;
      return;
    }
    const gesture = galleryTouchGesture.current;
    if (event.touches.length === 1 && gesture) {
      const touch = Array.from(event.touches).find(
        (candidate) => candidate.identifier === gesture.identifier,
      );
      if (touch) {
        gesture.lastX = touch.clientX;
        gesture.lastY = touch.clientY;
      }
    }
  }

  function handleGalleryTouchEnd(event: ReactTouchEvent<HTMLElement>) {
    const gesture = galleryTouchGesture.current;
    if (!gesture || event.touches.length > 0) return;
    galleryTouchGesture.current = null;
    if (gesture.hadMultiplePointers) return;
    const touch = Array.from(event.changedTouches).find(
      (candidate) => candidate.identifier === gesture.identifier,
    );
    if (!touch || gesture.startScale > 1.01 || getPageScale() > 1.01) {
      return;
    }
    completeGalleryGesture(
      gesture.startX,
      gesture.startY,
      touch?.clientX ?? gesture.lastX,
      touch?.clientY ?? gesture.lastY,
      event.currentTarget,
    );
  }

  function handleGalleryTouchCancel(event: ReactTouchEvent<HTMLElement>) {
    const gesture = galleryTouchGesture.current;
    galleryTouchGesture.current = null;
    lastTouchTap.current = null;
    if (
      !gesture ||
      gesture.hadMultiplePointers ||
      gesture.startScale > 1.01 ||
      getPageScale() > 1.01
    ) {
      return;
    }
    completeGalleryGesture(
      gesture.startX,
      gesture.startY,
      gesture.lastX,
      gesture.lastY,
      event.currentTarget,
      false,
    );
  }

  function completeGalleryGesture(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    trigger: HTMLElement,
    allowTap = true,
  ) {
    const distanceX = endX - startX;
    const distanceY = endY - startY;

    if (
      Math.abs(distanceX) >= swipeThreshold &&
      Math.abs(distanceX) > Math.abs(distanceY) * 1.2
    ) {
      selectIndex(activeIndex + (distanceX < 0 ? 1 : -1));
      return;
    }

    if (!allowTap) return;
    if (Math.hypot(distanceX, distanceY) > 12) return;
    const previousTap = lastTouchTap.current;
    const now = performance.now();
    if (
      previousTap &&
      now - previousTap.at < 325 &&
      Math.hypot(endX - previousTap.x, endY - previousTap.y) < 28
    ) {
      lastTouchTap.current = null;
      openInspection(trigger);
    } else {
      lastTouchTap.current = { at: now, x: endX, y: endY };
    }
  }

  function openInspection(trigger: HTMLElement) {
    if (dialogRef.current?.open) return;
    resetInspection();
    returnFocusRef.current = trigger;
    dialogRef.current?.showModal();
    document.documentElement.classList.add("inspection-open");
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

  function handleInspectionWheel(event: globalThis.WheelEvent) {
    event.preventDefault();
    event.stopPropagation();
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    zoomAt(zoomRef.current * Math.exp(-delta * 0.002), {
      x: event.clientX,
      y: event.clientY,
    });
  }

  wheelHandlerRef.current = handleInspectionWheel;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (event: globalThis.WheelEvent) =>
      wheelHandlerRef.current(event);
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      document.documentElement.classList.remove("inspection-open");
    };
  }, []);

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

  function handleInspectionPointerDown(event: PointerEvent<HTMLDivElement>) {
    viewerPointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    trySetPointerCapture(event.currentTarget, event.pointerId);
    const points = [...viewerPointers.current.values()];

    if (points.length === 1) {
      inspectionGestureHadMultiplePointers.current = false;
      dragGesture.current = {
        pointerId: event.pointerId,
        start: points[0]!,
        pan: panRef.current,
      };
      inspectionSwipe.current =
        (event.pointerType === "touch" || event.pointerType === "pen") &&
        zoomRef.current <= minimumZoom
          ? { pointerId: event.pointerId, start: points[0]! }
          : null;
      setIsDragging(zoomRef.current > minimumZoom);
    } else if (points.length === 2) {
      inspectionGestureHadMultiplePointers.current = true;
      inspectionSwipe.current = null;
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

  function handleInspectionPointerEnd(
    event: PointerEvent<HTMLDivElement>,
    allowSwipe: boolean,
  ) {
    const swipe = inspectionSwipe.current;
    const hadMultiplePointers = inspectionGestureHadMultiplePointers.current;
    viewerPointers.current.delete(event.pointerId);
    const remaining = [...viewerPointers.current.entries()];
    pinchGesture.current = null;

    if (
      allowSwipe &&
      !hadMultiplePointers &&
      swipe?.pointerId === event.pointerId &&
      zoomRef.current <= minimumZoom
    ) {
      const distanceX = event.clientX - swipe.start.x;
      const distanceY = event.clientY - swipe.start.y;
      if (
        Math.abs(distanceX) >= swipeThreshold &&
        Math.abs(distanceX) > Math.abs(distanceY) * 1.2
      ) {
        selectIndex(activeIndex + (distanceX < 0 ? 1 : -1));
        return;
      }
    }

    inspectionSwipe.current = null;

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
      inspectionGestureHadMultiplePointers.current = false;
    }
  }

  function handleInspectionKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.target instanceof HTMLInputElement) return;
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
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectIndex(activeIndex + 1);
    }
    if (event.key === "ArrowLeft") {
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
            onPointerCancel={handleGalleryPointerCancel}
            onPointerDown={handleGalleryPointerDown}
            onPointerUp={handleGalleryPointerUp}
            onTouchCancel={handleGalleryTouchCancel}
            onTouchEnd={handleGalleryTouchEnd}
            onTouchMove={handleGalleryTouchMove}
            onTouchStart={handleGalleryTouchStart}
          >
            <div className="gallery-light" aria-hidden="true" />
            <GallerySubjectImage
              key={activeAsset.publicPath}
              asset={activeAsset}
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
          document.documentElement.classList.remove("inspection-open");
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
          onPointerCancel={(event) => handleInspectionPointerEnd(event, false)}
          onPointerDown={handleInspectionPointerDown}
          onPointerMove={handleInspectionPointerMove}
          onPointerUp={(event) => handleInspectionPointerEnd(event, true)}
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
            Scroll or pinch to zoom; drag when zoomed. Swipe at 100% or use ←/→
            to change view. Double-click to zoom or reset. Photo:{" "}
            {activeAsset.credit} · All rights reserved.
          </p>
        </div>
      </dialog>
    </section>
  );
}

function GallerySubjectImage({ asset }: { asset: MediaAsset }) {
  const { x, y, width, height } = asset.subjectBounds;
  return (
    <svg
      className={`gallery-image gallery-image-${asset.view}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={asset.alt}
    >
      <image
        href={asset.publicPath}
        width={asset.width}
        height={asset.height}
      />
    </svg>
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

function getPageScale() {
  return window.visualViewport?.scale ?? 1;
}
