import {
  getPublishedSpecimens,
  getPublishedTaxa,
  getTaxonomyNodes,
  taxonomyHref,
  type TaxonomyRank,
} from "@/domain/catalog/queries";
import type {
  CompiledCollection,
  MediaAsset,
  TaxonRecord,
} from "@/domain/content/types";

export const catalogSearchArtifactVersion = 1 as const;
export const catalogSearchPublicPath =
  "/generated/catalog-search-v1.json" as const;

export type CatalogSearchDocumentType = "rank" | "taxon" | "specimen";

export interface CatalogSearchDocument {
  id: string;
  type: CatalogSearchDocumentType;
  label: string;
  scientificName: string;
  danishName: string;
  specimenId: string;
  taxonId: string;
  rank: TaxonomyRank | "taxon" | "specimen";
  rankSlug: string;
  url: string;
  primary: string;
  aliases: string;
  taxonomy: string;
  profileText: string;
  exactValues: string[];
  prefixValues: string[];
  aliasValues: string[];
  taxonIds: string[];
  image: MediaAsset | null;
}

export interface CatalogSearchArtifact {
  schemaVersion: typeof catalogSearchArtifactVersion;
  collectionSchemaVersion: CompiledCollection["schemaVersion"];
  documents: CatalogSearchDocument[];
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function buildCatalogSearchArtifact(
  collection: CompiledCollection,
): CatalogSearchArtifact {
  const taxa = getPublishedTaxa(collection);
  const specimens = getPublishedSpecimens(collection);
  const taxaById = new Map(taxa.map((taxon) => [taxon.taxonId, taxon]));
  const profilesByTaxonId = new Map(
    collection.profiles
      .filter((profile) => profile.reviewStatus === "reviewed")
      .map((profile) => [profile.taxonId, profile]),
  );
  const lateralBySpecimenId = new Map(
    collection.media
      .filter((asset) => asset.view === "lateral")
      .map((asset) => [asset.specimenId, asset]),
  );

  const rankDocuments = getTaxonomyNodes(collection).map((node) => {
    const representative = taxa
      .filter((taxon) => node.taxonIds.includes(taxon.taxonId))
      .map((taxon) => lateralBySpecimenId.get(taxon.defaultSpecimenId) ?? null)
      .find((asset) => asset !== null);
    const values = uniqueNormalized([node.name, node.slug]);
    return {
      id: `rank:${node.rank}:${node.slug}`,
      type: "rank" as const,
      label: node.name,
      scientificName: "",
      danishName: "",
      specimenId: "",
      taxonId: "",
      rank: node.rank,
      rankSlug: node.slug,
      url: taxonomyHref(node.rank, node.slug),
      primary: values.join(" "),
      aliases: "",
      taxonomy: values.join(" "),
      profileText: "",
      exactValues: values,
      prefixValues: values,
      aliasValues: [],
      taxonIds: [...node.taxonIds],
      image: representative ?? null,
    } satisfies CatalogSearchDocument;
  });

  const taxonDocuments = taxa.map((taxon) => {
    const commonName = taxon.names.english ?? taxon.scientificName;
    const exactValues = uniqueNormalized([
      commonName,
      taxon.scientificName,
      taxon.names.danish,
      taxon.taxonId,
    ]);
    const aliasValues = uniqueNormalized([
      ...taxon.names.aliases,
      ...taxon.previousSlugs,
    ]);
    const profile = profilesByTaxonId.get(taxon.taxonId);
    const profileText = profile
      ? normalizeSearchText(
          [
            profile.summary,
            ...profile.sections.flatMap((section) => section.paragraphs),
          ].join(" "),
        )
      : "";
    return {
      id: `taxon:${taxon.taxonId}`,
      type: "taxon" as const,
      label: commonName,
      scientificName: formatSearchScientificName(taxon),
      danishName: taxon.names.danish ?? "",
      specimenId: "",
      taxonId: taxon.taxonId,
      rank: "taxon" as const,
      rankSlug: taxon.slug,
      url: `/species/${taxon.slug}`,
      primary: exactValues.join(" "),
      aliases: aliasValues.join(" "),
      taxonomy: normalizeSearchText(taxonomyText(taxon)),
      profileText,
      exactValues,
      prefixValues: exactValues,
      aliasValues,
      taxonIds: [taxon.taxonId],
      image: lateralBySpecimenId.get(taxon.defaultSpecimenId) ?? null,
    } satisfies CatalogSearchDocument;
  });

  const specimenDocuments = specimens.flatMap((specimen) => {
    const taxon = taxaById.get(specimen.taxonId);
    if (!taxon) return [];
    const commonName = taxon.names.english ?? taxon.scientificName;
    const exactValues = uniqueNormalized([
      specimen.specimenId,
      commonName,
      taxon.scientificName,
      taxon.names.danish,
    ]);
    const aliasValues = uniqueNormalized(taxon.names.aliases);
    return [
      {
        id: `specimen:${specimen.specimenId}`,
        type: "specimen" as const,
        label: commonName,
        scientificName: formatSearchScientificName(taxon),
        danishName: taxon.names.danish ?? "",
        specimenId: specimen.specimenId,
        taxonId: taxon.taxonId,
        rank: "specimen" as const,
        rankSlug: "",
        url: `/species/${taxon.slug}/specimens/${specimen.specimenId}`,
        primary: exactValues.join(" "),
        aliases: aliasValues.join(" "),
        taxonomy: normalizeSearchText(taxonomyText(taxon)),
        profileText: "",
        exactValues,
        prefixValues: exactValues,
        aliasValues,
        taxonIds: [taxon.taxonId],
        image: lateralBySpecimenId.get(specimen.specimenId) ?? null,
      } satisfies CatalogSearchDocument,
    ];
  });

  return {
    schemaVersion: catalogSearchArtifactVersion,
    collectionSchemaVersion: collection.schemaVersion,
    documents: [...rankDocuments, ...taxonDocuments, ...specimenDocuments].sort(
      (first, second) => first.id.localeCompare(second.id, "en"),
    ),
  };
}

export function getSearchMatchTier(
  document: CatalogSearchDocument,
  rawQuery: string,
): number {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 5;
  if (document.exactValues.includes(query)) return 0;
  if (document.prefixValues.some((value) => value.startsWith(query))) return 1;
  if (
    document.aliasValues.some(
      (value) => value === query || value.startsWith(query),
    )
  ) {
    return 2;
  }
  if (document.profileText.includes(query)) return 4;
  return 3;
}

export function getSearchTypePriority(
  document: CatalogSearchDocument,
  rawQuery: string,
): number {
  const query = normalizeSearchText(rawQuery);
  if (
    document.type === "specimen" &&
    normalizeSearchText(document.specimenId) === query
  ) {
    return 0;
  }
  if (document.type === "rank" && document.exactValues.includes(query)) {
    return 0;
  }
  if (document.type === "taxon") return 1;
  if (document.type === "specimen") return 2;
  return 3;
}

export function getSearchEditDistance(
  document: CatalogSearchDocument,
  rawQuery: string,
): number {
  const query = normalizeSearchText(rawQuery);
  return Math.min(
    ...[...document.exactValues, ...document.aliasValues].map((value) =>
      levenshteinDistance(value, query),
    ),
  );
}

function taxonomyText(taxon: TaxonRecord): string {
  return [
    taxon.hierarchy.className,
    taxon.hierarchy.orderName,
    taxon.hierarchy.familyName,
    taxon.hierarchy.genusName,
  ]
    .filter((value): value is string => value !== null)
    .join(" ");
}

function uniqueNormalized(values: Array<string | null>): string[] {
  return [
    ...new Set(values.map((value) => normalizeSearchText(value ?? ""))),
  ].filter(Boolean);
}

function formatSearchScientificName(taxon: TaxonRecord): string {
  return taxon.identificationQualifier === "sp"
    ? `${taxon.scientificName} sp.`
    : taxon.scientificName;
}

function levenshteinDistance(first: string, second: string): number {
  const previous = Array.from(
    { length: second.length + 1 },
    (_, index) => index,
  );
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex];
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      current[secondIndex] = Math.min(
        (current[secondIndex - 1] ?? 0) + 1,
        (previous[secondIndex] ?? 0) + 1,
        (previous[secondIndex - 1] ?? 0) +
          (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length] ?? Number.MAX_SAFE_INTEGER;
}
