import { buildContent } from "./lib/content";

import {
  canonicalViewLabels,
  type CanonicalView,
  type MediaAsset,
} from "../src/domain/content/types";

const comparisonViews: CanonicalView[] = [
  "lateral",
  "frontal",
  "dorsal",
  "ventral",
  "mandible-dorsal",
];

const { collection } = await buildContent();
const rows: Array<{
  subject: string;
  view: string;
  status: string;
  basis: string;
  pixelSpan: string;
}> = [];

for (const specimen of collection.specimens) {
  if (specimen.publicationStatus !== "published") continue;
  for (const view of comparisonViews) {
    const asset = collection.media.find(
      (candidate) =>
        candidate.specimenId === specimen.specimenId && candidate.view === view,
    );
    rows.push(
      getAuditRow(specimen.specimenId, view, asset, specimen.measurements),
    );
  }
}

for (const reference of collection.comparisonReferences) {
  rows.push(
    getAuditRow(
      `reference:${reference.referenceId}`,
      "lateral",
      reference.media,
      reference.measurements,
    ),
  );
  for (const view of comparisonViews.slice(1)) {
    rows.push({
      subject: `reference:${reference.referenceId}`,
      view: canonicalViewLabels[view],
      status: "media missing",
      basis: "—",
      pixelSpan: "—",
    });
  }
}

console.table(rows);
const counts = Object.groupBy(rows, (row) => row.status);
console.log(
  Object.entries(counts)
    .map(([status, entries]) => `${status}: ${entries?.length ?? 0}`)
    .join("; "),
);

function getAuditRow(
  subject: string,
  view: CanonicalView,
  asset:
    | MediaAsset
    | {
        comparisonCalibration: MediaAsset["comparisonCalibration"];
      }
    | undefined,
  measurements: Parameters<typeof resolveCalibrationStatus>[1],
) {
  const calibration = asset?.comparisonCalibration ?? null;
  const status = resolveCalibrationStatus(calibration, measurements);
  return {
    subject,
    view: canonicalViewLabels[view],
    status: asset ? status : "media missing",
    basis: calibration?.measurementKey ?? "—",
    pixelSpan: calibration ? calibration.pixelSpan.toFixed(1) : "—",
  };
}

function resolveCalibrationStatus(
  calibration: NonNullable<MediaAsset["comparisonCalibration"]> | null,
  measurements: Record<
    string,
    { status: string; value: number | null; unit: string }
  >,
) {
  if (!calibration) return "calibration missing";
  const measurement = measurements[calibration.measurementKey];
  if (
    !measurement ||
    (measurement.status !== "measured" &&
      measurement.status !== "approximate") ||
    measurement.value === null ||
    measurement.value <= 0 ||
    measurement.unit !== "mm"
  ) {
    return "measurement missing/non-applicable";
  }
  return "calibrated and eligible";
}
