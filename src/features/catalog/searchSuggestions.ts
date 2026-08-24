import {
  normalizeSearchText,
  type CatalogSearchDocument,
} from "@/domain/search/documents";

import type { CatalogMode } from "./catalogState";

export interface CatalogSearchTaxonMeta {
  taxonId: string;
  slug: string;
  defaultSpecimenId: string;
}

export interface TaxonSuggestion {
  document: CatalogSearchDocument;
  taxonId: string;
  defaultSpecimenId: string;
  otherSpecimens: CatalogSearchDocument[];
  exactSpecimenId: string | null;
}

export interface CatalogSuggestionModel {
  ranks: CatalogSearchDocument[];
  taxa: TaxonSuggestion[];
  specimens: CatalogSearchDocument[];
  autoExpandedTaxonIds: string[];
}

export interface CatalogSuggestionEntry {
  key: string;
  document: CatalogSearchDocument;
  kind: "rank" | "taxon" | "specimen";
  taxonId: string | null;
}

export function buildCatalogSuggestionModel({
  results,
  availableDocuments,
  taxonMeta,
  query,
}: {
  results: CatalogSearchDocument[];
  availableDocuments: CatalogSearchDocument[];
  taxonMeta: CatalogSearchTaxonMeta[];
  query: string;
}): CatalogSuggestionModel {
  const allDocuments = availableDocuments.length ? availableDocuments : results;
  const taxonMetaById = new Map(taxonMeta.map((meta) => [meta.taxonId, meta]));
  const taxonDocuments = new Map(
    allDocuments
      .filter((document) => document.type === "taxon")
      .map((document) => [document.taxonId, document]),
  );
  const specimenDocuments = allDocuments.filter(
    (document) => document.type === "specimen",
  );
  const specimensByTaxon = groupByTaxon(specimenDocuments);
  const resultOrder = new Map(
    results.map((document, index) => [document.id, index]),
  );
  const queryText = normalizeSearchText(query);
  const exactSpecimenId = results.find(
    (document) =>
      document.type === "specimen" &&
      normalizeSearchText(document.specimenId) === queryText,
  )?.specimenId;

  const ranks = uniqueDocuments(
    results.filter((document) => document.type === "rank"),
  );
  const orderedTaxonIds = orderedMatchedTaxonIds(results);
  const taxa = orderedTaxonIds.map((taxonId) => {
    const matchedSpecimens = results.filter(
      (document) =>
        document.type === "specimen" && document.taxonId === taxonId,
    );
    const taxonDocument =
      taxonDocuments.get(taxonId) ??
      matchedSpecimens[0] ??
      createFallbackTaxonDocument(taxonId, taxonMetaById, specimenDocuments);
    const meta = taxonMetaById.get(taxonId);
    const defaultSpecimenId = meta?.defaultSpecimenId ?? "";
    const exactSpecimenId =
      matchedSpecimens.find(
        (document) => normalizeSearchText(document.specimenId) === queryText,
      )?.specimenId ?? null;
    const otherSpecimens = (specimensByTaxon.get(taxonId) ?? [])
      .filter((document) => document.specimenId !== defaultSpecimenId)
      .sort((first, second) =>
        compareSpecimenSuggestions(first, second, exactSpecimenId, resultOrder),
      );

    return {
      document:
        taxonDocument.type === "specimen"
          ? createFallbackTaxonDocument(taxonId, taxonMetaById, [taxonDocument])
          : taxonDocument,
      taxonId,
      defaultSpecimenId,
      otherSpecimens,
      exactSpecimenId,
    } satisfies TaxonSuggestion;
  });

  const broadMatchedTaxonIds = new Set(
    results
      .filter((document) => document.type !== "specimen")
      .flatMap((document) => document.taxonIds),
  );
  const matchedSpecimenIds = new Set(
    results
      .filter((document) => document.type === "specimen")
      .map((document) => document.specimenId),
  );
  const specimens = specimenDocuments
    .filter((document) => {
      if (document.type !== "specimen") return false;
      return (
        broadMatchedTaxonIds.has(document.taxonId) ||
        matchedSpecimenIds.has(document.specimenId)
      );
    })
    .sort((first, second) =>
      compareSpecimenSuggestions(
        first,
        second,
        exactSpecimenId ?? null,
        resultOrder,
      ),
    );

  return {
    ranks,
    taxa,
    specimens,
    autoExpandedTaxonIds: taxa
      .filter((suggestion) => suggestion.exactSpecimenId !== null)
      .map((suggestion) => suggestion.taxonId),
  };
}

export function flattenCatalogSuggestionEntries(
  model: CatalogSuggestionModel,
  mode: CatalogMode,
  expandedTaxonIds: ReadonlySet<string>,
): CatalogSuggestionEntry[] {
  const entries: CatalogSuggestionEntry[] = model.ranks.map((document) => ({
    key: document.id,
    document,
    kind: "rank",
    taxonId: null,
  }));

  if (mode === "specimens") {
    entries.push(
      ...model.specimens.map((document) => ({
        key: document.id,
        document,
        kind: "specimen" as const,
        taxonId: document.taxonId,
      })),
    );
    return entries;
  }

  for (const suggestion of model.taxa) {
    entries.push({
      key: suggestion.document.id,
      document: suggestion.document,
      kind: "taxon",
      taxonId: suggestion.taxonId,
    });
    if (expandedTaxonIds.has(suggestion.taxonId)) {
      entries.push(
        ...suggestion.otherSpecimens.map((document) => ({
          key: `${suggestion.taxonId}:${document.id}`,
          document,
          kind: "specimen" as const,
          taxonId: suggestion.taxonId,
        })),
      );
    }
  }
  return entries;
}

function orderedMatchedTaxonIds(results: CatalogSearchDocument[]): string[] {
  const taxonIds: string[] = [];
  const seen = new Set<string>();
  const add = (taxonId: string) => {
    if (!seen.has(taxonId)) {
      seen.add(taxonId);
      taxonIds.push(taxonId);
    }
  };

  for (const document of results) {
    if (document.type === "rank") {
      document.taxonIds.forEach(add);
    } else {
      add(document.taxonId);
    }
  }
  return taxonIds;
}

function groupByTaxon(
  documents: CatalogSearchDocument[],
): Map<string, CatalogSearchDocument[]> {
  const grouped = new Map<string, CatalogSearchDocument[]>();
  for (const document of documents) {
    const group = grouped.get(document.taxonId) ?? [];
    group.push(document);
    grouped.set(document.taxonId, group);
  }
  return grouped;
}

function uniqueDocuments(
  documents: CatalogSearchDocument[],
): CatalogSearchDocument[] {
  return [
    ...new Map(documents.map((document) => [document.id, document])).values(),
  ];
}

function compareSpecimenSuggestions(
  first: CatalogSearchDocument,
  second: CatalogSearchDocument,
  exactSpecimenId: string | null,
  resultOrder: ReadonlyMap<string, number>,
): number {
  const firstIsExact = exactSpecimenId === first.specimenId ? 0 : 1;
  const secondIsExact = exactSpecimenId === second.specimenId ? 0 : 1;
  return (
    firstIsExact - secondIsExact ||
    (resultOrder.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
      (resultOrder.get(second.id) ?? Number.MAX_SAFE_INTEGER) ||
    first.specimenId.localeCompare(second.specimenId, "en")
  );
}

function createFallbackTaxonDocument(
  taxonId: string,
  taxonMetaById: ReadonlyMap<string, CatalogSearchTaxonMeta>,
  specimenDocuments: CatalogSearchDocument[],
): CatalogSearchDocument {
  const specimen = specimenDocuments.find(
    (document) => document.taxonId === taxonId,
  );
  const meta = taxonMetaById.get(taxonId);
  if (!specimen || !meta) {
    throw new Error(`Cannot create a search result for taxon ${taxonId}.`);
  }
  return {
    ...specimen,
    id: `taxon:${taxonId}`,
    type: "taxon",
    specimenId: "",
    rank: "taxon",
    rankSlug: meta.slug,
    url: `/species/${meta.slug}`,
    taxonIds: [taxonId],
  };
}
