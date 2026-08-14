import { formatMeasurement } from "@/domain/content/display";
import {
  measurementDefinitions,
  type MeasurementKey,
  type SpecimenRecord,
} from "@/domain/content/types";

import { MeasurementGuide } from "./RecordGuides";
import { SizeReference } from "./SizeReference";

const primaryMeasurements: MeasurementKey[] = [
  "skullLength",
  "skullWidth",
  "skullHeight",
  "skullMass",
  "craniumWidth",
  "mandibleLength",
];

const additionalMeasurements: MeasurementKey[] = [
  "condylobasalLength",
  "mandibularToothRowLength",
  "mandibleRamusHeight",
  "mandibleBodyHeight",
  "maxillaryCanineLength",
  "mandibularCanineLength",
  "bodyMass",
];

export function MeasurementPanel({ specimen }: { specimen: SpecimenRecord }) {
  return (
    <section
      className="measurements content-section"
      aria-labelledby="measurements-title"
    >
      <div className="section-heading">
        <p className="section-kicker">Reference data</p>
        <h2 id="measurements-title">Measurements</h2>
        <p>
          Values describe {specimen.specimenId}; they are not a species range.
        </p>
        <MeasurementGuide />
      </div>
      <div className="measurement-layout">
        <SizeReference skullLength={specimen.measurements.skullLength} />
        <div className="measurement-data">
          <MeasurementList keys={primaryMeasurements} specimen={specimen} />
          <details>
            <summary>Show additional recorded measurements</summary>
            <MeasurementList
              keys={additionalMeasurements}
              specimen={specimen}
            />
          </details>
        </div>
      </div>
    </section>
  );
}

function MeasurementList({
  keys,
  specimen,
}: {
  keys: MeasurementKey[];
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
