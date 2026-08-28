import type { PartialDate } from "@/domain/content/types";

export const mapProjectionVersion = 1 as const;

export type CoordinatePrecision = "exact" | "approximate" | "unknown";

export interface MapRecord {
  specimenId: string;
  taxonId: string;
  taxonSlug: string;
  commonName: string;
  scientificName: string;
  danishName: string | null;
  className: string;
  classSlug: string;
  orderName: string | null;
  familyName: string | null;
  genusName: string;
  latitude: number | null;
  longitude: number | null;
  coordinatePrecision: CoordinatePrecision;
  coordinateUncertaintyM: number | null;
  locationLabel: string | null;
  acquisitionDate: PartialDate;
  sex: string;
  ageClass: string;
  condition: string;
  preparationMethods: string[];
  skullLengthMm: number | null;
  skullMassG: number | null;
  image: {
    publicPath: string;
    alt: string;
    width: number;
    height: number;
    subjectBounds: { x: number; y: number; width: number; height: number };
  } | null;
  specimenHref: string;
  taxonHref: string;
}

export interface MapPointProperties {
  specimenId: string;
  taxonId: string;
  classSlug: string;
  coordinatePrecision: Exclude<CoordinatePrecision, "unknown">;
}

export interface MapPointFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: MapPointProperties;
}

export interface MapFeatureCollection {
  type: "FeatureCollection";
  features: MapPointFeature[];
}

export interface MapProjectionArtifact {
  schemaVersion: typeof mapProjectionVersion;
  collectionSchemaVersion: 4;
  records: MapRecord[];
  geoJson: MapFeatureCollection;
}

export interface MapPolygonFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
  properties: {
    specimenId: string;
    selected: boolean;
  };
}

export interface MapPolygonFeatureCollection {
  type: "FeatureCollection";
  features: MapPolygonFeature[];
}
