"use client";

import { useId, useMemo, useState } from "react";

import { getMeasuredValue } from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";

import { ComparisonSelector } from "./ComparisonSelector";
import { MeasurementDifferences } from "./MeasurementDifferences";
import { ScaledSkullImage } from "./ScaledSkullImage";

export function ScaleComparison({
  primary,
  options,
  defaultComparisonId,
}: {
  primary: SkullComparisonRecord;
  options: SkullComparisonRecord[];
  defaultComparisonId: string;
}) {
  const titleId = useId();
  const [selectedId, setSelectedId] = useState(defaultComparisonId);
  const comparison = useMemo(
    () =>
      options.find((option) => option.id === selectedId) ?? options[0] ?? null,
    [options, selectedId],
  );

  if (!comparison) {
    return (
      <section className="scale-comparison scale-comparison-unavailable">
        <p className="data-label">Relative length</p>
        <h3>A sense of scale</h3>
        <p>No eligible calibrated comparison is available.</p>
      </section>
    );
  }

  const primaryLength = getMeasuredValue(primary.measurements.skullLength);
  const comparisonLength = getMeasuredValue(
    comparison.measurements.skullLength,
  );
  if (primaryLength === null || comparisonLength === null) {
    return (
      <section className="scale-comparison scale-comparison-unavailable">
        <p className="data-label">Relative length</p>
        <h3>A sense of scale</h3>
        <p>
          True-to-scale comparison is unavailable without a reviewed lateral
          image and maximum skull length.
        </p>
      </section>
    );
  }

  const largestLengthMm = Math.max(primaryLength, comparisonLength);
  return (
    <section className="scale-comparison" aria-labelledby={titleId}>
      <header className="scale-comparison-heading">
        <p className="data-label">Relative length</p>
        <h3 id={titleId}>A sense of scale</h3>
        <p>
          Visible lateral skulls share one physical scale; transparent margins
          do not affect their size.
        </p>
      </header>
      <div className="scale-comparison-body">
        <div className="scale-visual-comparison">
          <ScaledSkullImage
            record={primary}
            largestLengthMm={largestLengthMm}
            targetOrientation={primary.image.orientation}
            position="primary"
          />
          <p className="compared-with">Compared with</p>
          <ScaledSkullImage
            record={comparison}
            largestLengthMm={largestLengthMm}
            targetOrientation={primary.image.orientation}
            position="comparison"
          />
          <ComparisonSelector
            options={options}
            selectedId={comparison.id}
            onSelect={setSelectedId}
          />
          {comparison.note ? (
            <p className="comparison-reference-note">{comparison.note}</p>
          ) : null}
        </div>
        <MeasurementDifferences primary={primary} comparison={comparison} />
      </div>
    </section>
  );
}
