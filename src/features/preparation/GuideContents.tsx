"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PreparationGuide } from "@/domain/guides/guide";
const subscribe = () => () => {};
export function GuideContents({
  headings,
}: {
  headings: PreparationGuide["headings"];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const destination = useRef<string | null>(null);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);
  const [active, setActive] = useState("");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const current = headings
        .filter((h) => h.level === 2)
        .findLast(
          (h) =>
            (document.getElementById(h.id)?.getBoundingClientRect().top ??
              Infinity) <= 150,
        );
      setActive(current?.id ?? "");
      frame = 0;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    frame = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [headings]);
  const links = (
    <ol>
      {headings
        .filter((h) => h.level < 4)
        .map((h) => (
          <li key={h.id} className={h.level === 3 ? "prep-contents-sub" : ""}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              onClick={() => {
                destination.current = h.id;
                dialog.current?.close();
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      <li>
        <a
          href="#references"
          onClick={() => {
            destination.current = "references";
            dialog.current?.close();
          }}
        >
          References
        </a>
      </li>
    </ol>
  );
  return (
    <>
      <div className="prep-nav-bar">
        <a href="#workflow">↑ Process overview</a>
        <button
          ref={trigger}
          hidden={!ready}
          onClick={() => {
            destination.current = null;
            dialog.current?.showModal();
            setOpen(true);
          }}
          aria-haspopup="dialog"
        >
          Contents <span aria-hidden="true">☰</span>
        </button>
        <span className="prep-current" aria-hidden="true">
          {headings.find((h) => h.id === active)?.text ?? "Preparation guide"}
        </span>
      </div>
      {!ready && (
        <details className="prep-static-contents">
          <summary>Guide contents</summary>
          <nav aria-label="Guide contents">{links}</nav>
        </details>
      )}
      <dialog
        ref={dialog}
        className="prep-drawer"
        aria-labelledby="guide-contents-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button, a[href]",
            ),
          );
          const first = controls[0];
          const last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => {
          setOpen(false);
          if (destination.current)
            document
              .getElementById(destination.current)
              ?.focus({ preventScroll: true });
          else trigger.current?.focus({ preventScroll: true });
        }}
      >
        <div className="prep-drawer-frame">
          <header>
            <h2 id="guide-contents-title">Guide contents</h2>
            <button
              autoFocus
              onClick={() => dialog.current?.close()}
              aria-label="Close guide contents"
            >
              Close ×
            </button>
          </header>
          <nav aria-label="Guide contents">{links}</nav>
        </div>
      </dialog>
    </>
  );
}
