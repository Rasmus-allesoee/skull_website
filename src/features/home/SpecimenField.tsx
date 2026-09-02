"use client";

import Link from "next/link";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SubjectImage } from "@/components/SubjectImage";
import type { HomeSpecimenState } from "@/data/home";
import { getHeroDepthPresentation } from "@/domain/home/depth";

const visitCursorKey = "skull-collection:home-field-state-v1";
const identityGap = 12;
const identityMargin = 12;

type IdentityPlacement = "above" | "below" | "left" | "right";

interface IdentityPosition {
  specimenId: string;
  left: number;
  top: number;
  placement: IdentityPlacement;
}

export function SpecimenField({ states }: { states: HomeSpecimenState[] }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const identityRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const activationInput = useRef<"touch" | "keyboard" | null>(null);
  const outsidePointer = useRef<{
    id: number;
    x: number;
    y: number;
  } | null>(null);
  const interactionStarted = useRef(false);
  const touchSelection = useRef<string | null>(null);
  const [stateIndex, setStateIndex] = useState(0);
  const [activeSpecimenId, setActiveSpecimenId] = useState<string | null>(null);
  const [identityPosition, setIdentityPosition] =
    useState<IdentityPosition | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const state = states[stateIndex] ?? states[0];
  const activeSpecimen = state?.specimens.find(
    (specimen) => specimen.specimenId === activeSpecimenId,
  );

  useEffect(() => {
    let rotationTimer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      setIsEnhanced(true);
      if (states.length < 2) return;
      rotationTimer = setTimeout(() => {
        if (interactionStarted.current) return;
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
      }, 3000);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (rotationTimer) clearTimeout(rotationTimer);
    };
  }, [states.length]);

  const updateIdentityPosition = useCallback(() => {
    if (!activeSpecimenId) return;
    const field = fieldRef.current;
    const link = linkRefs.current.get(activeSpecimenId);
    const card = identityRef.current;
    if (!field || !link || !card) return;

    const fieldRect = field.getBoundingClientRect();
    const targetRect = link.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const candidates: Array<{
      placement: IdentityPlacement;
      left: number;
      top: number;
    }> = [
      {
        placement: "above",
        left: targetRect.left + (targetRect.width - cardRect.width) / 2,
        top: targetRect.top - cardRect.height - identityGap,
      },
      {
        placement: "below",
        left: targetRect.left + (targetRect.width - cardRect.width) / 2,
        top: targetRect.bottom + identityGap,
      },
      {
        placement: "left",
        left: targetRect.left - cardRect.width - identityGap,
        top: targetRect.top + (targetRect.height - cardRect.height) / 2,
      },
      {
        placement: "right",
        left: targetRect.right + identityGap,
        top: targetRect.top + (targetRect.height - cardRect.height) / 2,
      },
    ];
    const fits = (candidate: (typeof candidates)[number]) =>
      candidate.left >= fieldRect.left + identityMargin &&
      candidate.left + cardRect.width <= fieldRect.right - identityMargin &&
      candidate.top >= fieldRect.top + identityMargin &&
      candidate.top + cardRect.height <= fieldRect.bottom - identityMargin;
    const preferred = candidates.find(fits) ?? candidates[0]!;
    const left = Math.min(
      Math.max(preferred.left, fieldRect.left + identityMargin),
      fieldRect.right - cardRect.width - identityMargin,
    );
    const top = Math.min(
      Math.max(preferred.top, fieldRect.top + identityMargin),
      fieldRect.bottom - cardRect.height - identityMargin,
    );

    setIdentityPosition((previous) => {
      if (
        previous &&
        previous.specimenId === activeSpecimenId &&
        Math.abs(previous.left - (left - fieldRect.left)) < 0.5 &&
        Math.abs(previous.top - (top - fieldRect.top)) < 0.5 &&
        previous.placement === preferred.placement
      ) {
        return previous;
      }
      return {
        specimenId: activeSpecimenId,
        left: left - fieldRect.left,
        top: top - fieldRect.top,
        placement: preferred.placement,
      };
    });
  }, [activeSpecimenId]);

  useEffect(() => {
    if (!activeSpecimenId) return;

    let frame: number | null = null;
    const schedulePosition = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        updateIdentityPosition();
      });
    };

    schedulePosition();
    window.addEventListener("resize", schedulePosition);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && fieldRef.current) {
      observer = new ResizeObserver(schedulePosition);
      observer.observe(fieldRef.current);
    }

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedulePosition);
      observer?.disconnect();
    };
  }, [activeSpecimenId, state?.id, updateIdentityPosition]);

  if (!state) {
    return (
      <div className="specimen-field specimen-field-empty">
        <p>No specimen imagery is currently available.</p>
      </div>
    );
  }

  const readyIdentityPosition =
    identityPosition?.specimenId === activeSpecimenId ? identityPosition : null;

  const moveParallax = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (event.pointerType !== "mouse" && event.pointerType !== "touch") {
      return;
    }
    if (event.pointerType === "touch" && event.buttons === 0) return;
    const field = event.currentTarget;
    const bounds = field.getBoundingClientRect();
    const x = Math.max(
      -1,
      Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2),
    );
    const y = Math.max(
      -1,
      Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2),
    );
    field
      .querySelectorAll<HTMLElement>(".specimen-field-link")
      .forEach((link) => {
        const parallaxX = Number.parseFloat(link.dataset.parallaxX ?? "0");
        const parallaxY = Number.parseFloat(link.dataset.parallaxY ?? "0");
        link.style.setProperty("--field-move-x", `${x * parallaxX}px`);
        link.style.setProperty("--field-move-y", `${y * parallaxY}px`);
      });
  };

  const resetParallax = () => {
    fieldRef.current
      ?.querySelectorAll<HTMLElement>(".specimen-field-link")
      .forEach((link) => {
        link.style.setProperty("--field-move-x", "0px");
        link.style.setProperty("--field-move-y", "0px");
      });
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
      touchSelection.current = null;
      setActiveSpecimenId(null);
    }
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    resetParallax();
    finishOutsidePointer(event);
  };

  const selectNextState = () => {
    interactionStarted.current = true;
    touchSelection.current = null;
    setIdentityPosition(null);
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
        onPointerUp={finishPointer}
        onPointerCancel={() => {
          outsidePointer.current = null;
          resetParallax();
        }}
      >
        <div className="specimen-field-light" aria-hidden="true" />
        {state.specimens.map((specimen, index) => {
          const isActive = activeSpecimenId === specimen.specimenId;
          const accessibleName = `View ${specimen.commonName}, ${specimen.scientificName}, specimen ${specimen.specimenId}`;
          const depth = getHeroDepthPresentation(specimen.depth);
          const depthStyle = {
            "--field-scale": String(depth.scale),
            "--field-focus-scale": String(depth.focusScale),
            "--field-opacity": String(depth.opacity),
            "--field-focus-opacity": String(depth.focusOpacity),
            "--field-muted-opacity": String(depth.mutedOpacity),
            "--field-blur": `${depth.blurPx}px`,
            "--field-focus-blur": `${depth.focusBlurPx}px`,
            "--field-brightness": String(depth.brightness),
            "--field-focus-brightness": String(depth.focusBrightness),
            "--field-muted-brightness": String(depth.mutedBrightness),
            "--field-contrast": String(depth.contrast),
            "--field-focus-contrast": String(depth.focusContrast),
            "--field-muted-contrast": String(depth.mutedContrast),
            "--field-z-index": String(depth.zIndex),
            "--field-shadow-y": `${depth.shadowY}px`,
            "--field-shadow-blur": `${depth.shadowBlur}px`,
            "--field-shadow-alpha": String(depth.shadowAlpha),
          } as CSSProperties;
          return (
            <Link
              key={specimen.specimenId}
              ref={(element) => {
                if (element) {
                  linkRefs.current.set(specimen.specimenId, element);
                } else {
                  linkRefs.current.delete(specimen.specimenId);
                }
              }}
              className={[
                "specimen-field-link",
                `specimen-field-slot-${index + 1}`,
                isActive ? "is-active" : null,
              ]
                .filter(Boolean)
                .join(" ")}
              style={depthStyle}
              data-depth={specimen.depth}
              data-parallax-x={depth.parallaxX}
              data-parallax-y={depth.parallaxY}
              href={specimen.href}
              aria-label={accessibleName}
              aria-describedby={
                isActive ? `field-identity-${specimen.specimenId}` : undefined
              }
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  interactionStarted.current = true;
                  touchSelection.current = null;
                  setActiveSpecimenId(specimen.specimenId);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setActiveSpecimenId(null);
                }
              }}
              onPointerDown={(event) => {
                interactionStarted.current = true;
                activationInput.current =
                  event.pointerType === "touch" ? "touch" : null;
              }}
              onTouchStart={() => {
                interactionStarted.current = true;
                activationInput.current = "touch";
              }}
              onFocus={() => {
                interactionStarted.current = true;
                touchSelection.current = null;
                setActiveSpecimenId(specimen.specimenId);
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setActiveSpecimenId(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  touchSelection.current = null;
                  activationInput.current = "keyboard";
                }
                if (event.key === " ") {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              onClick={(event) => {
                interactionStarted.current = true;
                const usesTouchSelection =
                  activationInput.current !== "keyboard" &&
                  (activationInput.current === "touch" ||
                    window.matchMedia("(hover: none), (pointer: coarse)")
                      .matches);
                activationInput.current = null;
                if (usesTouchSelection) {
                  const isSecondTap =
                    touchSelection.current === specimen.specimenId;
                  if (isSecondTap) {
                    touchSelection.current = null;
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  touchSelection.current = specimen.specimenId;
                  setActiveSpecimenId(specimen.specimenId);
                }
              }}
            >
              <SubjectImage
                asset={specimen.image}
                priority={index < 2 && stateIndex === 0}
                sizes="(max-width: 48rem) 42vw, (max-width: 72rem) 28vw, 24vw"
              />
            </Link>
          );
        })}
        {activeSpecimen ? (
          <span
            ref={identityRef}
            className={[
              "specimen-field-identity",
              readyIdentityPosition ? "is-ready" : null,
            ]
              .filter(Boolean)
              .join(" ")}
            id={`field-identity-${activeSpecimen.specimenId}`}
            data-placement={readyIdentityPosition?.placement ?? "above"}
            style={
              readyIdentityPosition
                ? {
                    left: `${readyIdentityPosition.left}px`,
                    top: `${readyIdentityPosition.top}px`,
                  }
                : undefined
            }
          >
            <strong>{activeSpecimen.commonName}</strong>
            <em>{activeSpecimen.scientificName}</em>
            <small>{activeSpecimen.specimenId}</small>
            <b>View specimen →</b>
          </span>
        ) : null}
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
