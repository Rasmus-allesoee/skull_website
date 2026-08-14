export const publicationStatuses = [
  "draft",
  "review",
  "published",
  "archived",
] as const;

export const canonicalViews = [
  "lateral",
  "oblique",
  "frontal",
  "dorsal",
  "ventral",
  "mandible-dorsal",
] as const;

export const canonicalViewLabels: Record<CanonicalView, string> = {
  lateral: "Lateral",
  oblique: "Oblique",
  frontal: "Frontal",
  dorsal: "Dorsal",
  ventral: "Ventral",
  "mandible-dorsal": "Mandible — dorsal",
};

export const measurementDefinitions = {
  skullLength: { label: "Maximum skull length", unit: "mm" },
  condylobasalLength: { label: "Condylobasal length", unit: "mm" },
  skullWidth: { label: "Maximum skull width", unit: "mm" },
  skullHeight: { label: "Skull height", unit: "mm" },
  skullMass: { label: "Prepared skull mass", unit: "g" },
  craniumWidth: { label: "Cranium width", unit: "mm" },
  mandibleLength: { label: "Maximum mandible length", unit: "mm" },
  mandibularToothRowLength: {
    label: "Mandibular tooth-row length",
    unit: "mm",
  },
  mandibleRamusHeight: { label: "Mandibular ramus height", unit: "mm" },
  mandibleBodyHeight: { label: "Mandibular body height", unit: "mm" },
  maxillaryCanineLength: { label: "Maxillary canine length", unit: "mm" },
  mandibularCanineLength: { label: "Mandibular canine length", unit: "mm" },
  bodyMass: { label: "Animal body mass", unit: "g" },
} as const;

export type PublicationStatus = (typeof publicationStatuses)[number];
export type CanonicalView = (typeof canonicalViews)[number];
export type MeasurementKey = keyof typeof measurementDefinitions;
export type MeasurementUnit = "mm" | "g" | "days" | "hours" | "percent";
export type MeasurementStatus =
  "measured" | "approximate" | "not_recorded" | "not_applicable";

export type ObservationStatus = "yes" | "no" | "not_recorded";

export type AgeClass =
  | "juvenile"
  | "subadult"
  | "young_adult"
  | "adult"
  | "old_adult"
  | "indeterminate"
  | "not_recorded";

export type SpecimenCondition =
  "excellent" | "good" | "fair" | "poor" | "fragmentary" | "not_recorded";

export type TeethCompleteness =
  "complete" | "partially_complete" | "incomplete" | "not_recorded";

export type SkeletonCompleteness = "full" | "partial" | "none" | "not_recorded";

export type Measurement =
  | {
      status: "measured" | "approximate";
      value: number;
      unit: MeasurementUnit;
    }
  | {
      status: "not_recorded" | "not_applicable";
      value: null;
      unit: MeasurementUnit;
    };

export type PartialDate =
  | { value: string; precision: "year" | "month" | "day" }
  | { value: null; precision: "unknown" };

export interface TaxonomicHierarchy {
  className: string;
  classSlug: string;
  orderName: string | null;
  orderSlug: string | null;
  familyName: string | null;
  familySlug: string | null;
  genusName: string;
  genusSlug: string;
}

export interface TaxonRecord {
  taxonId: string;
  slug: string;
  scientificName: string;
  rank: "subspecies" | "species" | "genus";
  identificationQualifier: "confirmed" | "probable" | "uncertain" | "sp";
  identificationConfidence: "high" | "medium" | "low" | "unassessed";
  taxonomicStatus: "accepted" | "synonym" | "unresolved" | "not_checked";
  names: {
    english: string | null;
    danish: string | null;
    aliases: string[];
  };
  hierarchy: TaxonomicHierarchy;
  externalIds: {
    gbifTaxonKey: number | null;
    catalogueOfLifeTaxonId: string | null;
  };
  taxonomyCheckedOn: string | null;
  taxonomySnapshotId: string | null;
  defaultSpecimenId: string;
  previousSlugs: string[];
  publicationStatus: PublicationStatus;
  publishedOn: string | null;
  updatedOn: string | null;
}

export interface SpecimenLocation {
  label: string | null;
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
  precision: "exact" | "approximate" | "unknown";
  uncertaintyM: number | null;
}

export interface PreparationStep {
  method: string[];
  duration: Measurement;
}

export interface PreparationRecord {
  defleshing: PreparationStep;
  degreasing: PreparationStep;
  whitening: PreparationStep & {
    hydrogenPeroxidePercent: Measurement;
  };
  notes: string | null;
}

export interface RightsRecord {
  specimenCredit: string;
  dataRights: "all_rights_reserved";
  mediaCredit: string;
  mediaRights: "all_rights_reserved";
}

export interface SpecimenRecord {
  specimenId: string;
  taxonId: string;
  publicationStatus: PublicationStatus;
  isTypeOrReferenceSpecimen: boolean;
  condition: SpecimenCondition;
  distinguishingFeatures: string | null;
  sex: "female" | "male" | "intersex" | "unknown" | "not_recorded";
  ageClass: AgeClass;
  ageDetail: string | null;
  pathology: {
    status: ObservationStatus;
    description: string | null;
  };
  trauma: {
    status: ObservationStatus;
    description: string | null;
  };
  teethCompleteness: TeethCompleteness;
  skeletonCompleteness: SkeletonCompleteness;
  acquisitionSource:
    | "roadkill"
    | "beach_washup"
    | "hunting"
    | "found_remains"
    | "captive"
    | "donation"
    | "other"
    | "unknown";
  acquisitionDate: PartialDate;
  location: SpecimenLocation;
  collectorCredit: string | null;
  ownerCredit: string;
  collectionHistory: string | null;
  preparation: PreparationRecord;
  photographedOn: PartialDate;
  uploadedOn: string | null;
  measurements: Record<MeasurementKey, Measurement>;
  rights: RightsRecord;
  publicNotes: string | null;
  sourceReferences: string[];
}

export interface SubjectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MediaAsset {
  specimenId: string;
  view: CanonicalView;
  width: number;
  height: number;
  bytes: number;
  subjectBounds: SubjectBounds;
  alt: string;
  credit: string;
  rights: "all_rights_reserved";
  publicPath: string;
}

export interface Citation {
  key: string;
  title: string;
  authors: string;
  year: number;
  url: string;
  accessed: string;
}

export interface ProfileSection {
  heading:
    "Overview" | "Skull identification" | "Comparison notes" | "References";
  paragraphs: string[];
}

export interface TaxonProfile {
  taxonId: string;
  reviewStatus: "draft" | "reviewed";
  lastReviewed: string;
  summary: string;
  citations: Citation[];
  sections: ProfileSection[];
  allowedComponents: readonly string[];
}

export interface CompiledCollection {
  schemaVersion: 2;
  taxa: TaxonRecord[];
  specimens: SpecimenRecord[];
  media: MediaAsset[];
  profiles: TaxonProfile[];
}

export interface Diagnostic {
  source: string;
  row?: number;
  key?: string;
  field?: string;
  value?: unknown;
  rule: string;
  suggestion: string;
}

export class ValidationError extends Error {
  readonly diagnostics: Diagnostic[];

  constructor(message: string, diagnostics: Diagnostic[]) {
    super(message);
    this.name = "ValidationError";
    this.diagnostics = diagnostics;
  }
}

export function formatDiagnostics(diagnostics: Diagnostic[]): string {
  return diagnostics
    .map((diagnostic) => {
      const location = [
        diagnostic.source,
        diagnostic.row === undefined ? null : `row ${diagnostic.row}`,
        diagnostic.key === undefined ? null : `key ${diagnostic.key}`,
        diagnostic.field === undefined ? null : `field ${diagnostic.field}`,
      ]
        .filter(Boolean)
        .join(" · ");
      const value =
        diagnostic.value === undefined
          ? ""
          : ` Received ${JSON.stringify(diagnostic.value)}.`;

      return `${location}: ${diagnostic.rule}.${value} ${diagnostic.suggestion}`;
    })
    .join("\n");
}
