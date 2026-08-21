import { getCollection } from "@/data/collection";
import type { SkullComparisonRecord } from "@/domain/comparison/types";
import {
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
      aliases: reference.aliases,
      note: reference.note,
      measurementProfile: reference.measurementProfile,
      measurements: reference.measurements,
      image: reference.media,
    }));

  const specimens: SkullComparisonRecord[] = [];
  for (const taxon of collection.taxa) {
    if (taxon.publicationStatus !== "published") continue;
    const specimen = collection.specimens.find(
      (candidate) =>
        candidate.specimenId === taxon.defaultSpecimenId &&
        candidate.taxonId === taxon.taxonId &&
        candidate.publicationStatus === "published",
    );
    if (!specimen) continue;
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
        asset.orientation !== null,
    );
    if (!lateral || lateral.orientation === null) continue;

    const measurements = Object.fromEntries(
      comparisonMeasurementKeys.map((key) => [key, specimen.measurements[key]]),
    ) as SkullComparisonRecord["measurements"];
    specimens.push({
      id: `specimen:${specimen.specimenId}`,
      kind: "specimen",
      label: taxon.names.english ?? taxon.scientificName,
      isDefault: false,
      scientificName: taxon.scientificName,
      specimenId: specimen.specimenId,
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
      image: {
        publicPath: lateral.publicPath,
        width: lateral.width,
        height: lateral.height,
        subjectBounds: lateral.subjectBounds,
        orientation: lateral.orientation,
        alt: lateral.alt,
        credit: lateral.credit,
      },
    });
  }

  return [
    ...references,
    ...specimens.sort((a, b) => a.label.localeCompare(b.label, "en")),
  ];
}
