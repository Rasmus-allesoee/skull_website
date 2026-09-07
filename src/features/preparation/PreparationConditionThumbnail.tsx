"use client";

import Image from "next/image";
import { useRef, type MouseEvent } from "react";
import type { GuideMediaAsset } from "@/domain/guides/guide";

export function PreparationConditionThumbnail({
  asset,
}: {
  asset: GuideMediaAsset;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const titleId = `prep-condition-${asset.assetId}-title`;

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
      <span className="prep-condition-thumbnail">
        <a
          ref={triggerRef}
          href={asset.publicPath}
          aria-label={`Enlarge ${asset.alt}`}
          onClick={openPreview}
        >
          <Image
            src={asset.publicPath}
            width={asset.width}
            height={asset.height}
            alt={asset.alt}
            sizes="(max-width: 42rem) 4rem, 4.5rem"
          />
        </a>
      </span>
      <dialog
        ref={dialogRef}
        className="prep-condition-lightbox"
        aria-labelledby={titleId}
        onClick={closeOnBackdrop}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className="prep-condition-lightbox-frame">
          <form method="dialog">
            <button type="submit">Close image</button>
          </form>
          <h2 id={titleId}>{asset.alt}</h2>
          <Image
            className="prep-condition-lightbox-image"
            src={asset.publicPath}
            width={asset.width}
            height={asset.height}
            alt=""
            sizes="(max-width: 42rem) calc(100vw - 2rem), 44rem"
          />
          <p>{asset.caption}</p>
        </div>
      </dialog>
    </>
  );
}
