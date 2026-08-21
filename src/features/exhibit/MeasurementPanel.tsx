import { formatMeasurement } from "@/domain/content/display";
import type { SkullComparisonRecord } from "@/domain/comparison/types";
import {
  measurementDefinitions,
  measurementProfileLayouts,
  resolveMeasurementProfile,
  type MeasurementKey,
  type SpecimenRecord,
  type TaxonRecord,
} from "@/domain/content/types";

import { MeasurementGuide } from "./RecordGuides";
import { ScaleComparison } from "@/features/comparison/ScaleComparison";

export function MeasurementPanel({
  taxon,
  specimen,
  comparisonPrimary,
  comparisonOptions,
  defaultComparisonId,
}: {
  taxon: TaxonRecord;
  specimen: SpecimenRecord;
  comparisonPrimary: SkullComparisonRecord | null;
  comparisonOptions: SkullComparisonRecord[];
  defaultComparisonId: string | null;
}) {
  const measurementProfile = resolveMeasurementProfile(
    taxon.hierarchy.classSlug,
    taxon.hierarchy.className,
  );
  const layout = measurementProfileLayouts[measurementProfile];
  return (
    <section
      className="measurements content-section"
      aria-labelledby="measurements-title"
      data-measurement-profile={measurementProfile}
    >
      <div className="measurement-layout">
        <div className="measurement-data">
          <div className="section-heading">
            <p className="section-kicker">Reference data</p>
            <h2 id="measurements-title">Measurements</h2>
            <p>
              Values describe {specimen.specimenId}; they are not a species
              range.
            </p>
          </div>
          <MeasurementList keys={layout.primary} specimen={specimen} />
          <details>
            <summary>Show additional recorded measurements</summary>
            <MeasurementList keys={layout.additional} specimen={specimen} />
          </details>
          <MeasurementGuide profile={measurementProfile} />
        </div>
        {comparisonPrimary && defaultComparisonId ? (
          <ScaleComparison
            primary={comparisonPrimary}
            options={comparisonOptions}
            defaultComparisonId={defaultComparisonId}
          />
        ) : (
          <section className="scale-comparison scale-comparison-unavailable">
            <p className="data-label">Relative length</p>
            <h3>A sense of scale</h3>
            <p>
              True-to-scale comparison is unavailable without a reviewed lateral
              image and maximum skull length.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}

function MeasurementList({
  keys,
  specimen,
}: {
  keys: readonly MeasurementKey[];
  specimen: SpecimenRecord;
}) {
  return (
    <dl className="data-list measurement-list">
      {keys.map((key) => (
        <div key={key}>
          <dt>{measurementDefinitions[key].label}</dt>
          <dd>{formatMeasurement(specimen.measurements[key])}</dd>
        </div>
      ))}
    </dl>
  );
}
