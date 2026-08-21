"use client";

import { useRef } from "react";
import Link from "next/link";

import { SubjectImage } from "@/components/SubjectImage";
import type { SpecimenCardRecord } from "@/domain/catalog/queries";
import { formatMeasurement, humanizeToken } from "@/domain/content/display";

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
        onClick={() => dialogRef.current?.showModal()}
      >
        Choose from {specimens.length} specimens
        <span aria-hidden="true">↗</span>
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
                        <dd>{humanizeToken(specimen.ageClass)}</dd>
                      </div>
                      <div>
                        <dt>Sex</dt>
                        <dd>{humanizeToken(specimen.sex)}</dd>
                      </div>
                      <div>
                        <dt>Length</dt>
                        <dd>
                          {formatMeasurement(specimen.measurements.skullLength)}
                        </dd>
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
