"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useRef, useSyncExternalStore, type MouseEvent } from "react";
import type { GuideMediaAsset } from "@/domain/guides/guide";

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function PreparationImageLightbox({
  asset,
  label,
}: {
  asset: GuideMediaAsset;
  label: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const titleId = `prep-image-${asset.assetId}-title`;
  const imageSrc = `${asset.publicPath}?v=${asset.bytes}`;

  function openPreview(event: MouseEvent<HTMLAnchorElement>) {
    const dialog = dialogRef.current;
    if (!dialog || typeof dialog.showModal !== "function") return;
    event.preventDefault();
    dialog.showModal();
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) dialogRef.current?.close();
  }

  return (
    <>
      <a
        ref={triggerRef}
        className="prep-inline-link prep-image-link"
        href={imageSrc}
        aria-label={`Show image: ${label}`}
        onClick={openPreview}
      >
        {label}
      </a>
      {mounted &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="prep-image-lightbox"
            aria-labelledby={titleId}
            onClick={closeOnBackdrop}
            onClose={() => triggerRef.current?.focus()}
          >
            <div className="prep-image-lightbox-frame">
              <form method="dialog">
                <button type="submit">Close image</button>
              </form>
              <h2 id={titleId}>{asset.alt}</h2>
              <Image
                className="prep-image-lightbox-image"
                src={imageSrc}
                width={asset.width}
                height={asset.height}
                alt=""
                unoptimized
                sizes="(max-width: 42rem) calc(100vw - 2rem), 48rem"
              />
              <p>
                {asset.caption} Photo: {asset.credit}.
              </p>
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
