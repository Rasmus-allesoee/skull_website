import { getSpecimenCardRecords } from "@/domain/catalog/queries";
import type { CompiledCollection, Measurement } from "@/domain/content/types";

import {
  mapProjectionVersion,
  type MapPointFeature,
  type MapPolygonFeature,
  type MapProjectionArtifact,
  type MapRecord,
} from "./types";

const earthRadiusM = 6_371_008.8;

export function buildMapProjection(
  collection: CompiledCollection,
): MapProjectionArtifact {
  const records = getSpecimenCardRecords(collection)
    .map(({ specimen, taxon, image, href }) => {
      const hasCoordinates = hasUsableCoordinates(specimen.location);
      return {
        specimenId: specimen.specimenId,
        taxonId: taxon.taxonId,
        taxonSlug: taxon.slug,
        commonName: taxon.names.english ?? taxon.scientificName,
        scientificName:
          taxon.identificationQualifier === "sp"
            ? `${taxon.scientificName} sp.`
            : taxon.scientificName,
        danishName: taxon.names.danish,
        className: taxon.hierarchy.className,
        classSlug: taxon.hierarchy.classSlug,
        orderName: taxon.hierarchy.orderName,
        familyName: taxon.hierarchy.familyName,
        genusName: taxon.hierarchy.genusName,
        latitude: hasCoordinates ? specimen.location.latitude : null,
        longitude: hasCoordinates ? specimen.location.longitude : null,
        coordinatePrecision: hasCoordinates
          ? specimen.location.precision
          : "unknown",
        coordinateUncertaintyM:
          hasCoordinates && specimen.location.precision === "approximate"
            ? specimen.location.uncertaintyM
            : null,
        locationLabel: specimen.location.label,
        acquisitionDate: specimen.acquisitionDate,
        sex: specimen.sex,
        ageClass: specimen.ageClass,
        condition: specimen.condition,
        preparationMethods: [...specimen.preparation.defleshing.method].sort(),
        skullLengthMm: measuredValue(specimen.measurements.skullLength),
        skullMassG: measuredValue(specimen.measurements.skullMass),
        image: image
          ? {
              publicPath: image.publicPath,
              alt: image.alt,
              width: image.width,
              height: image.height,
              subjectBounds: image.subjectBounds,
            }
          : null,
        specimenHref: href,
        taxonHref: `/species/${taxon.slug}`,
      } satisfies MapRecord;
    })
    .sort((first, second) =>
      first.specimenId.localeCompare(second.specimenId, "en"),
    );

  return {
    schemaVersion: mapProjectionVersion,
    collectionSchemaVersion: collection.schemaVersion,
    records,
    geoJson: {
      type: "FeatureCollection",
      features: records.flatMap((record) => {
        if (!isMappedRecord(record)) return [];
        return [
          {
            type: "Feature",
            id: record.specimenId,
            geometry: {
              type: "Point",
              coordinates: [record.longitude, record.latitude],
            },
            properties: {
              specimenId: record.specimenId,
              taxonId: record.taxonId,
              classSlug: record.classSlug,
              coordinatePrecision: record.coordinatePrecision,
            },
          } satisfies MapPointFeature,
        ];
      }),
    },
  };
}

export function isMappedRecord(record: MapRecord): record is MapRecord & {
  latitude: number;
  longitude: number;
  coordinatePrecision: "exact" | "approximate";
} {
  return (
    record.latitude !== null &&
    record.longitude !== null &&
    record.coordinatePrecision !== "unknown"
  );
}

export function createUncertaintyPolygon(
  record: MapRecord,
  selected: boolean,
  steps = 72,
): MapPolygonFeature | null {
  if (
    !isMappedRecord(record) ||
    record.coordinatePrecision !== "approximate" ||
    record.coordinateUncertaintyM === null ||
    record.coordinateUncertaintyM <= 0
  ) {
    return null;
  }

  const latitudeRadians = degreesToRadians(record.latitude);
  const longitudeRadians = degreesToRadians(record.longitude);
  const angularDistance = record.coordinateUncertaintyM / earthRadiusM;
  const ring: [number, number][] = [];

  for (let index = 0; index <= steps; index += 1) {
    const bearing = (index / steps) * Math.PI * 2;
    const latitude = Math.asin(
      Math.sin(latitudeRadians) * Math.cos(angularDistance) +
        Math.cos(latitudeRadians) *
          Math.sin(angularDistance) *
          Math.cos(bearing),
    );
    const longitude =
      longitudeRadians +
      Math.atan2(
        Math.sin(bearing) *
          Math.sin(angularDistance) *
          Math.cos(latitudeRadians),
        Math.cos(angularDistance) -
          Math.sin(latitudeRadians) * Math.sin(latitude),
      );
    ring.push([
      normalizeLongitude(radiansToDegrees(longitude)),
      radiansToDegrees(latitude),
    ]);
  }

  return {
    type: "Feature",
    id: `uncertainty:${record.specimenId}`,
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: { specimenId: record.specimenId, selected },
  };
}

function hasUsableCoordinates(location: {
  latitude: number | null;
  longitude: number | null;
  precision: "exact" | "approximate" | "unknown";
}) {
  return (
    location.latitude !== null &&
    location.longitude !== null &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180 &&
    location.precision !== "unknown"
  );
}

function measuredValue(measurement: Measurement): number | null {
  return measurement.status === "measured" ||
    measurement.status === "approximate"
    ? measurement.value
    : null;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function normalizeLongitude(value: number) {
  return ((value + 540) % 360) - 180;
}
