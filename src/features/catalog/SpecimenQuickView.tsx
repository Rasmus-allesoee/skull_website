"use client";

import { useRef } from "react";
import Link from "next/link";

import { SubjectImage } from "@/components/SubjectImage";
import type { SpecimenCardRecord } from "@/domain/catalog/queries";
import { formatMeasurement, humanizeToken } from "@/domain/content/display";
import type { Measurement, PartialDate } from "@/domain/content/types";

export function SpecimenQuickView({
  specimens,
  defaultSpecimenId,
}: {
  specimens: SpecimenCardRecord[];
  defaultSpecimenId: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="specimen-quick-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-label={`Choose from ${specimens.length} specimens`}
        title="Choose a specimen"
        onClick={() => dialogRef.current?.showModal()}
      >
        <InteractionHint />
        <span>{specimens.length} skulls</span>
      </button>
      <dialog
        className="specimen-quick-dialog"
        ref={dialogRef}
        aria-labelledby={`specimen-dialog-${defaultSpecimenId}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="specimen-quick-dialog-inner">
          <header>
            <div>
              <p className="card-overline">Physical skulls</p>
              <h2 id={`specimen-dialog-${defaultSpecimenId}`}>
                Choose a specimen
              </h2>
            </div>
            <form method="dialog">
              <button className="dialog-close" type="submit">
                <span aria-hidden="true">×</span>
                <span className="visually-hidden">Close specimen chooser</span>
              </button>
            </form>
          </header>
          <ul>
            {specimens.map(({ specimen, image, href }) => (
              <li key={specimen.specimenId}>
                <Link href={href}>
                  <div className="specimen-quick-image">
                    {image ? (
                      <SubjectImage asset={image} sizes="8rem" />
                    ) : (
                      <span className="media-placeholder">No image</span>
                    )}
                  </div>
                  <div className="specimen-quick-copy">
                    <div>
                      <strong>{specimen.specimenId}</strong>
                      {specimen.specimenId === defaultSpecimenId ? (
                        <span className="default-specimen-label">Default</span>
                      ) : null}
                    </div>
                    <dl>
                      <div>
                        <dt>Age</dt>
                        <dd>{formatChooserToken(specimen.ageClass)}</dd>
                      </div>
                      <div>
                        <dt>Sex</dt>
                        <dd>{formatChooserToken(specimen.sex)}</dd>
                      </div>
                      <div>
                        <dt>Length</dt>
                        <dd>
                          {formatChooserMeasurement(
                            specimen.measurements.skullLength,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>Mass</dt>
                        <dd>
                          {formatChooserMeasurement(
                            specimen.measurements.skullMass,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>Condition</dt>
                        <dd>{formatChooserToken(specimen.condition)}</dd>
                      </div>
                      <div>
                        <dt>Date</dt>
                        <dd>{formatChooserDate(specimen.acquisitionDate)}</dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}

function formatChooserToken(value: string): string {
  const formatted = humanizeToken(value);
  if (formatted === "Not recorded" || formatted === "Not applicable") {
    return "N/A";
  }
  return formatted === "Excellent" ? "Ex." : formatted;
}

function formatChooserMeasurement(measurement: Measurement): string {
  const formatted = formatMeasurement(measurement);
  return formatted === "Not recorded" || formatted === "Not applicable"
    ? "N/A"
    : formatted;
}

function formatChooserDate(date: PartialDate): string {
  if (date.value === null) return "N/A";
  const [year, month] = date.value.split("-");
  if (!month) return year ?? "N/A";
  const monthLabel = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][Number(month) - 1];
  return monthLabel ? `${monthLabel} ${year}` : (year ?? "N/A");
}

function InteractionHint() {
  return (
    <>
      <span
        className="specimen-quick-hint specimen-quick-hint-mouse"
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" focusable="false">
          <rect x="5" y="1.5" width="10" height="17" rx="5" />
          <path d="M10 1.5v5M8.5 5.5h3" />
        </svg>
      </span>
      <span
        className="specimen-quick-hint specimen-quick-hint-tap"
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" focusable="false">
          <path d="M8.2 10V4.6a1.3 1.3 0 0 1 2.6 0v4.1l.8-1.3a1.25 1.25 0 0 1 2.2 1.2l-1 2.1 1.1-.7a1.2 1.2 0 0 1 1.3 2l-3.5 2.7a3.7 3.7 0 0 1-5.2-.7L4.3 12a1.25 1.25 0 0 1 2-1.5l1.9 1.8V10Z" />
          <path d="M6.4 5.7 5.2 4.5M14.7 5.7l1.1-1.2" />
        </svg>
      </span>
    </>
  );
}
