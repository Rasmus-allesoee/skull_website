import {
  formatCoordinate,
  formatPartialDate,
  humanizeToken,
} from "@/domain/content/display";
import type { ObservationStatus, SpecimenRecord } from "@/domain/content/types";

import { AgeGuide, ConditionGuide } from "./RecordGuides";

export function CollectionRecord({ specimen }: { specimen: SpecimenRecord }) {
  const coordinates =
    specimen.location.latitude !== null && specimen.location.longitude !== null
      ? `${formatCoordinate(specimen.location.latitude, "latitude")}, ${formatCoordinate(specimen.location.longitude, "longitude")}`
      : null;

  return (
    <section className="record-panel" aria-labelledby="collection-record-title">
      <p className="section-kicker">Provenance</p>
      <h2 id="collection-record-title">Collection record</h2>
      <dl className="data-list">
        <div>
          <dt>Specimen ID</dt>
          <dd>{specimen.specimenId}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{specimen.ownerCredit}</dd>
        </div>
        <div>
          <dt>Acquisition source</dt>
          <dd>{humanizeToken(specimen.acquisitionSource)}</dd>
        </div>
        <div>
          <dt>Acquisition date</dt>
          <dd>{formatPartialDate(specimen.acquisitionDate)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{specimen.location.label ?? "Not recorded"}</dd>
        </div>
        <div>
          <dt>Coordinates</dt>
          <dd>
            {coordinates ?? "Not recorded"}
            {coordinates ? (
              <small>
                Approximate · uncertainty radius{" "}
                {specimen.location.uncertaintyM?.toLocaleString("en")} m
              </small>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Sex</dt>
          <dd>{humanizeToken(specimen.sex)}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>
            <span className="record-primary-value">
              {humanizeToken(specimen.ageClass)}
            </span>
            {specimen.ageDetail ? <small>{specimen.ageDetail}</small> : null}
            <AgeGuide />
          </dd>
        </div>
        <div>
          <dt>Condition</dt>
          <dd>
            <span className="record-primary-value">
              {humanizeToken(specimen.condition)}
            </span>
            {specimen.distinguishingFeatures ? (
              <small>{specimen.distinguishingFeatures}</small>
            ) : null}
            <ConditionGuide />
          </dd>
        </div>
      </dl>

      <details className="additional-record-data">
        <summary>Show additional recorded data</summary>
        <dl className="data-list">
          <div>
            <dt>Pathology</dt>
            <dd>
              {formatObservation(specimen.pathology.status)}
              {specimen.pathology.description ? (
                <small>{specimen.pathology.description}</small>
              ) : null}
            </dd>
          </div>
          <div>
            <dt>Trauma</dt>
            <dd>
              {formatObservation(specimen.trauma.status)}
              {specimen.trauma.description ? (
                <small>{specimen.trauma.description}</small>
              ) : null}
            </dd>
          </div>
          <div>
            <dt>Teeth set</dt>
            <dd>{humanizeToken(specimen.teethCompleteness)}</dd>
          </div>
          <div>
            <dt>Skeleton</dt>
            <dd>
              {specimen.skeletonCompleteness === "none"
                ? "No"
                : humanizeToken(specimen.skeletonCompleteness)}
            </dd>
          </div>
        </dl>
      </details>
    </section>
  );
}

function formatObservation(status: ObservationStatus) {
  if (status === "not_recorded") return "Not recorded";
  return status === "yes" ? "Yes" : "No";
}
