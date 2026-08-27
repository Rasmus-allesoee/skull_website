import { readFileSync } from "node:fs";
import path from "node:path";

import type {
  CompiledCollection,
  MediaAsset,
  SpecimenRecord,
  TaxonProfile,
  TaxonRecord,
} from "@/domain/content/types";
import { resolvePublishedTaxonSlug } from "@/domain/catalog/queries";

let collectionCache: CompiledCollection | undefined;

export interface ExhibitRecord {
  taxon: TaxonRecord;
  specimen: SpecimenRecord;
  specimens: SpecimenRecord[];
  media: MediaAsset[];
  profile: TaxonProfile | null;
}

export function getCollection(): CompiledCollection {
  collectionCache ??= JSON.parse(
    readFileSync(
      path.join(process.cwd(), ".generated", "collection.json"),
      "utf8",
    ),
  ) as CompiledCollection;
  return collectionCache;
}

export function getPublishedTaxa(): TaxonRecord[] {
  return getCollection().taxa.filter(
    (taxon) => taxon.publicationStatus === "published",
  );
}

export function getTaxonSlugResolution(taxonSlug: string) {
  return resolvePublishedTaxonSlug(getCollection(), taxonSlug);
}

export function getExhibit(
  taxonSlug: string,
  specimenId?: string,
): ExhibitRecord | null {
  const collection = getCollection();
  const taxon = collection.taxa.find(
    (candidate) =>
      candidate.slug === taxonSlug &&
      candidate.publicationStatus === "published",
  );
  if (!taxon) return null;

  const specimens = collection.specimens.filter(
    (candidate) =>
      candidate.taxonId === taxon.taxonId &&
      candidate.publicationStatus === "published",
  );
  const selectedId = specimenId ?? taxon.defaultSpecimenId;
  const specimen = specimens.find(
    (candidate) => candidate.specimenId === selectedId,
  );
  const profile = collection.profiles.find(
    (candidate) =>
      candidate.taxonId === taxon.taxonId &&
      candidate.reviewStatus === "reviewed",
  );
  if (!specimen) return null;

  return {
    taxon,
    specimen,
    specimens,
    media: collection.media.filter(
      (asset) => asset.specimenId === specimen.specimenId,
    ),
    profile: profile ?? null,
  };
}
