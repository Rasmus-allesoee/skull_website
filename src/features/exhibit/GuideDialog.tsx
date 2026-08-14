"use client";

import { type ReactNode, useId, useRef } from "react";

export function GuideDialog({
  children,
  title,
  triggerLabel,
}: {
  children: ReactNode;
  title: string;
  triggerLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="guide-trigger"
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        className="guide-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className="guide-dialog-frame">
          <header>
            <h2 id={titleId}>{title}</h2>
            <button type="button" onClick={closeDialog} autoFocus>
              Close <span aria-hidden="true">×</span>
            </button>
          </header>
          <div className="guide-dialog-content">{children}</div>
        </div>
      </dialog>
    </>
  );
}
