import { getCollection } from "@/data/collection";
import type { SkullComparisonRecord } from "@/domain/comparison/types";
import { formatScientificIdentification } from "@/domain/content/display";
import {
  canonicalViews,
  comparisonMeasurementKeys,
  resolveMeasurementProfile,
  type CompiledCollection,
} from "@/domain/content/types";

export function getEligibleSkullComparisons(
  collection: CompiledCollection = getCollection(),
): SkullComparisonRecord[] {
  const references: SkullComparisonRecord[] = collection.comparisonReferences
    .filter((reference) => reference.measurements.skullLength.value !== null)
    .map((reference) => ({
      id: `reference:${reference.referenceId}`,
      kind: "reference",
      label: reference.label,
      isDefault: reference.isDefault,
      scientificName: null,
      specimenId: null,
      taxonId: null,
      genusName: null,
      genusSlug: null,
      href: null,
      aliases: reference.aliases,
      note: reference.note,
      measurementProfile: reference.measurementProfile,
      measurements: reference.measurements,
      views: [
        {
          view: "lateral",
          publicPath: reference.media.publicPath,
          width: reference.media.width,
          height: reference.media.height,
          subjectBounds: reference.media.subjectBounds,
          hitPath: reference.media.hitPath,
          orientation: reference.media.orientation,
          calibration: reference.media.comparisonCalibration,
          alt: reference.media.alt,
          credit: reference.media.credit,
        },
      ],
      image: {
        view: "lateral",
        publicPath: reference.media.publicPath,
        width: reference.media.width,
        height: reference.media.height,
        subjectBounds: reference.media.subjectBounds,
        hitPath: reference.media.hitPath,
        orientation: reference.media.orientation,
        calibration: reference.media.comparisonCalibration,
        alt: reference.media.alt,
        credit: reference.media.credit,
      },
    }));

  const specimens: SkullComparisonRecord[] = [];
  for (const specimen of collection.specimens) {
    if (specimen.publicationStatus !== "published") continue;
    const taxon = collection.taxa.find(
      (candidate) =>
        candidate.taxonId === specimen.taxonId &&
        candidate.publicationStatus === "published",
    );
    if (!taxon) continue;
    const length = specimen.measurements.skullLength;
    if (
      (length.status !== "measured" && length.status !== "approximate") ||
      length.value <= 0
    ) {
      continue;
    }
    const lateral = collection.media.find(
      (asset) =>
        asset.specimenId === specimen.specimenId &&
        asset.view === "lateral" &&
        asset.orientation !== null &&
        asset.comparisonCalibration !== null,
    );
    if (
      !lateral ||
      lateral.orientation === null ||
      lateral.comparisonCalibration === null
    )
      continue;

    const views = collection.media
      .filter(
        (asset) =>
          asset.specimenId === specimen.specimenId &&
          asset.view !== "oblique" &&
          asset.comparisonCalibration !== null,
      )
      .sort(
        (a, b) =>
          canonicalViews.indexOf(a.view) - canonicalViews.indexOf(b.view),
      )
      .map((asset) => ({
        view: asset.view as Exclude<typeof asset.view, "oblique">,
        publicPath: asset.publicPath,
        width: asset.width,
        height: asset.height,
        subjectBounds: asset.subjectBounds,
        hitPath: asset.hitPath,
        orientation: asset.orientation,
        calibration: asset.comparisonCalibration!,
        alt: asset.alt,
        credit: asset.credit,
      }));

    const measurements = Object.fromEntries(
      comparisonMeasurementKeys.map((key) => [key, specimen.measurements[key]]),
    ) as SkullComparisonRecord["measurements"];
    specimens.push({
      id: `specimen:${specimen.specimenId}`,
      kind: "specimen",
      label: taxon.names.english ?? taxon.scientificName,
      isDefault: specimen.specimenId === taxon.defaultSpecimenId,
      scientificName: formatScientificIdentification(taxon),
      specimenId: specimen.specimenId,
      taxonId: taxon.taxonId,
      genusName: taxon.hierarchy.genusName,
      genusSlug: taxon.hierarchy.genusSlug,
      href: `/species/${taxon.slug}/specimens/${specimen.specimenId}`,
      aliases: [
        taxon.names.danish,
        ...taxon.names.aliases,
        taxon.hierarchy.genusName,
      ].filter((value): value is string => Boolean(value)),
      note: null,
      measurementProfile: resolveMeasurementProfile(
        taxon.hierarchy.classSlug,
        taxon.hierarchy.className,
      ),
      measurements,
      views,
      image: {
        view: "lateral",
        publicPath: lateral.publicPath,
        width: lateral.width,
        height: lateral.height,
        subjectBounds: lateral.subjectBounds,
        orientation: lateral.orientation,
        calibration: lateral.comparisonCalibration,
        alt: lateral.alt,
        credit: lateral.credit,
      },
    });
  }

  return [
    ...references,
    ...specimens.sort(
      (a, b) =>
        a.label.localeCompare(b.label, "en") ||
        Number(b.isDefault) - Number(a.isDefault) ||
        (a.specimenId ?? "").localeCompare(b.specimenId ?? "", "en"),
    ),
  ];
}
