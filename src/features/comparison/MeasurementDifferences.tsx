"use client";

import { useId } from "react";

import { calculateMeasurementDifference } from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";
import type { ComparisonMeasurementKey } from "@/domain/content/types";

const rows: { key: ComparisonMeasurementKey; label: string }[] = [
  { key: "skullLength", label: "Max length" },
  { key: "skullWidth", label: "Max width" },
  { key: "skullHeight", label: "Max height" },
  { key: "skullMass", label: "Skull mass" },
  { key: "craniumWidth", label: "Cranium width" },
  { key: "mandibleLength", label: "Max mandible length" },
];

export function MeasurementDifferences({
  primary,
  comparison,
}: {
  primary: SkullComparisonRecord;
  comparison: SkullComparisonRecord;
}) {
  const titleId = useId();
  const differences = rows.map(({ key, label }) => ({
    key,
    label,
    difference: calculateMeasurementDifference(
      key,
      primary.measurements[key],
      comparison.measurements[key],
    ),
  }));
  const hasApproximateDifference = differences.some(
    ({ difference }) =>
      difference.approximate && difference.direction !== "unavailable",
  );

  return (
    <section
      className="measurement-differences"
      aria-labelledby={titleId}
      aria-live="polite"
    >
      <p className="data-label" id={titleId}>
        Measurement differences
      </p>
      <p className="difference-context">
        {primary.specimenId ?? primary.label} vs {comparison.label}
      </p>
      <dl>
        {differences.map(({ key, label, difference }) => {
          return (
            <div key={key} className={`difference-${difference.direction}`}>
              <dt>{label}</dt>
              <dd>
                <span>{difference.text}</span>
                {difference.ratioText ? (
                  <small>({difference.ratioText})</small>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
      {hasApproximateDifference ? (
        <p className="difference-note">
          Approximate source values make the resulting difference approximate.
        </p>
      ) : null}
    </section>
  );
}
