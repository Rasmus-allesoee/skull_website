"use client";

import Image from "next/image";
import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react";

import {
  canonicalViewLabels,
  canonicalViews,
  type MediaAsset,
} from "@/domain/content/types";

export function Gallery({
  assets,
  commonName,
}: {
  assets: MediaAsset[];
  commonName: string;
}) {
  const [requestedIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const zoomButtonRef = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef<number | null>(null);
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

  function selectIndex(index: number) {
    setActiveIndex((index + assets.length) % assets.length);
  }

  function handleKeyDown(event: KeyboardEvent) {
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
  }

  function handlePointerDown(event: PointerEvent) {
    pointerStart.current = event.clientX;
  }

  function handlePointerUp(event: PointerEvent) {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 48) return;
    selectIndex(activeIndex + (distance < 0 ? 1 : -1));
  }

  function openZoom() {
    setZoom(1);
    dialogRef.current?.showModal();
  }

  function closeZoom() {
    dialogRef.current?.close();
  }

  return (
    <section className="gallery" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <div>
          <p className="section-kicker">Six-view study</p>
          <h2 id="gallery-title">Specimen photography</h2>
        </div>
        <p className="gallery-count" aria-live="polite">
          {activeIndex + 1} / {assets.length} ·{" "}
          {canonicalViewLabels[activeAsset.view]}
        </p>
      </div>

      <figure
        className="gallery-stage"
        tabIndex={0}
        aria-label={`${commonName} gallery. Use left and right arrow keys to change view.`}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div className="gallery-light" aria-hidden="true" />
        <Image
          key={activeAsset.publicPath}
          className="gallery-image"
          src={activeAsset.publicPath}
          alt={activeAsset.alt}
          width={activeAsset.width}
          height={activeAsset.height}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 1000px"
          priority={activeIndex === 0}
        />
        <figcaption>
          <span>{canonicalViewLabels[activeAsset.view]} view</span>
          <span>{activeAsset.credit}</span>
        </figcaption>
      </figure>

      <div className="gallery-controls" aria-label="Gallery controls">
        <button type="button" onClick={() => selectIndex(activeIndex - 1)}>
          <span aria-hidden="true">←</span> Previous
        </button>
        <button ref={zoomButtonRef} type="button" onClick={openZoom}>
          Inspect full view
        </button>
        <button type="button" onClick={() => selectIndex(activeIndex + 1)}>
          Next <span aria-hidden="true">→</span>
        </button>
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
              sizes="110px"
            />
            <span>{canonicalViewLabels[asset.view]}</span>
          </button>
        ))}
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
        className="zoom-dialog"
        aria-labelledby="zoom-dialog-title"
        onClose={() => {
          setZoom(1);
          zoomButtonRef.current?.focus();
        }}
        onKeyDown={handleKeyDown}
      >
        <div className="zoom-toolbar">
          <div>
            <p className="section-kicker">High-resolution inspection</p>
            <h2 id="zoom-dialog-title">
              {canonicalViewLabels[activeAsset.view]} view
            </h2>
          </div>
          <button type="button" onClick={closeZoom} autoFocus>
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="zoom-viewport">
          <Image
            className="zoom-image"
            src={activeAsset.publicPath}
            alt={activeAsset.alt}
            width={activeAsset.width}
            height={activeAsset.height}
            sizes="100vw"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
        <div className="zoom-controls" aria-label="Zoom controls">
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
            disabled={zoom === 1}
          >
            Zoom out
          </button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}
            disabled={zoom === 2.5}
          >
            Zoom in
          </button>
          <button type="button" onClick={() => setZoom(1)}>
            Reset
          </button>
        </div>
        <p className="zoom-caption">
          {activeAsset.credit} · All rights reserved · Escape closes this view
        </p>
      </dialog>
    </section>
  );
}
