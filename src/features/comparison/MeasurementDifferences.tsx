"use client";

import { useId } from "react";

import {
  calculateMeasurementDifference,
  getComparisonDifferenceRows,
  isCrossClassMeasurementPair,
} from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";

export function MeasurementDifferences({
  primary,
  comparison,
}: {
  primary: SkullComparisonRecord;
  comparison: SkullComparisonRecord;
}) {
  const titleId = useId();
  const rows = getComparisonDifferenceRows(
    primary.measurementProfile,
    comparison.measurementProfile,
  );
  const differences = rows.map((row) => ({
    key: row.key,
    label: row.label,
    difference: calculateMeasurementDifference(
      row.primaryKey,
      primary.measurements[row.primaryKey],
      comparison.measurements[row.comparisonKey],
      row.key,
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
      {isCrossClassMeasurementPair(
        primary.measurementProfile,
        comparison.measurementProfile,
      ) ? (
        <p className="difference-note">
          Cross-class width and height rows map different anatomical landmarks;
          each mapping is named in the table.
        </p>
      ) : null}
      {hasApproximateDifference ? (
        <p className="difference-note">
          Approximate source values make the resulting difference approximate.
        </p>
      ) : null}
    </section>
  );
}
