"use client";

import Link from "next/link";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { SubjectImage } from "@/components/SubjectImage";
import type { HomeSpecimenState } from "@/data/home";

const visitCursorKey = "skull-collection:home-field-state-v1";

export function SpecimenField({ states }: { states: HomeSpecimenState[] }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const activationInput = useRef<"touch" | "keyboard" | null>(null);
  const outsidePointer = useRef<{
    id: number;
    x: number;
    y: number;
  } | null>(null);
  const [stateIndex, setStateIndex] = useState(0);
  const [activeSpecimenId, setActiveSpecimenId] = useState<string | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const state = states[stateIndex] ?? states[0];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsEnhanced(true);
      if (states.length < 2) return;
      try {
        const stored = Number.parseInt(
          localStorage.getItem(visitCursorKey) ?? "0",
        );
        const nextState = Number.isFinite(stored)
          ? Math.abs(stored) % states.length
          : 0;
        setStateIndex(nextState);
        localStorage.setItem(
          visitCursorKey,
          String((nextState + 1) % states.length),
        );
      } catch {
        // Storage is optional. The server-rendered first arrangement stays useful.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [states.length]);

  if (!state) {
    return (
      <div className="specimen-field specimen-field-empty">
        <p>No specimen imagery is currently available.</p>
      </div>
    );
  }

  const moveParallax = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--field-x-far", `${x * 3}px`);
    event.currentTarget.style.setProperty("--field-y-far", `${y * 2}px`);
    event.currentTarget.style.setProperty("--field-x-mid", `${x * 7}px`);
    event.currentTarget.style.setProperty("--field-y-mid", `${y * 5}px`);
    event.currentTarget.style.setProperty("--field-x-near", `${x * 12}px`);
    event.currentTarget.style.setProperty("--field-y-near", `${y * 8}px`);
  };

  const resetParallax = () => {
    fieldRef.current?.style.setProperty("--field-x-far", "0px");
    fieldRef.current?.style.setProperty("--field-y-far", "0px");
    fieldRef.current?.style.setProperty("--field-x-mid", "0px");
    fieldRef.current?.style.setProperty("--field-y-mid", "0px");
    fieldRef.current?.style.setProperty("--field-x-near", "0px");
    fieldRef.current?.style.setProperty("--field-y-near", "0px");
  };

  const beginOutsidePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (target.closest(".specimen-field-link, .specimen-field-identity")) {
      outsidePointer.current = null;
      return;
    }
    outsidePointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const finishOutsidePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = outsidePointer.current;
    outsidePointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 10) {
      setActiveSpecimenId(null);
    }
  };

  const selectNextState = () => {
    setActiveSpecimenId(null);
    setStateIndex((current) => {
      const next = (current + 1) % states.length;
      try {
        localStorage.setItem(
          visitCursorKey,
          String((next + 1) % states.length),
        );
      } catch {
        // Storage is optional.
      }
      return next;
    });
  };

  return (
    <div className="specimen-field-shell">
      <div
        ref={fieldRef}
        className="specimen-field"
        data-arrangement={state.id}
        onPointerMove={moveParallax}
        onPointerLeave={resetParallax}
        onPointerDown={beginOutsidePointer}
        onPointerUp={finishOutsidePointer}
        onPointerCancel={() => {
          outsidePointer.current = null;
        }}
      >
        <div className="specimen-field-light" aria-hidden="true" />
        {state.specimens.map((specimen, index) => {
          const isActive = activeSpecimenId === specimen.specimenId;
          const accessibleName = `View ${specimen.commonName}, ${specimen.scientificName}, specimen ${specimen.specimenId}`;
          return (
            <Link
              key={specimen.specimenId}
              className={`specimen-field-link specimen-field-slot-${index + 1}${isActive ? "is-active" : ""}`}
              href={specimen.href}
              aria-label={accessibleName}
              aria-describedby={
                isActive ? `field-identity-${specimen.specimenId}` : undefined
              }
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  setActiveSpecimenId(specimen.specimenId);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setActiveSpecimenId(null);
                }
              }}
              onPointerDown={(event) => {
                activationInput.current =
                  event.pointerType === "touch" ? "touch" : null;
              }}
              onTouchStart={() => {
                activationInput.current = "touch";
              }}
              onFocus={() => setActiveSpecimenId(specimen.specimenId)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setActiveSpecimenId(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  activationInput.current = "keyboard";
                }
                if (event.key === " ") {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              onClick={(event) => {
                const usesTouchSelection =
                  activationInput.current !== "keyboard" &&
                  (activationInput.current === "touch" ||
                    window.matchMedia("(hover: none), (pointer: coarse)")
                      .matches);
                activationInput.current = null;
                if (
                  usesTouchSelection &&
                  activeSpecimenId !== specimen.specimenId
                ) {
                  event.preventDefault();
                  setActiveSpecimenId(specimen.specimenId);
                }
              }}
            >
              <SubjectImage
                asset={specimen.image}
                priority={index < 2 && stateIndex === 0}
                sizes="(max-width: 48rem) 42vw, (max-width: 72rem) 28vw, 24vw"
              />
              <span
                className="specimen-field-identity"
                id={`field-identity-${specimen.specimenId}`}
              >
                <strong>{specimen.commonName}</strong>
                <em>{specimen.scientificName}</em>
                <small>{specimen.specimenId}</small>
                <b>View specimen →</b>
              </span>
            </Link>
          );
        })}
      </div>
      {isEnhanced && states.length > 1 ? (
        <button
          className="specimen-field-next"
          type="button"
          onClick={selectNextState}
          aria-label={`Show another specimen arrangement. Arrangement ${stateIndex + 1} of ${states.length}.`}
        >
          Another arrangement
          <span aria-hidden="true">
            {stateIndex + 1}/{states.length}
          </span>
        </button>
      ) : null}
    </div>
  );
}
