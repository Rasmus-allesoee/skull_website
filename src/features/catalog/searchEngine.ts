import { create, insertMultiple, search } from "@orama/orama";

import {
  getSearchEditDistance,
  getSearchMatchTier,
  getSearchTypePriority,
  normalizeSearchText,
  type CatalogSearchArtifact,
  type CatalogSearchDocument,
} from "@/domain/search/documents";

const schema = {
  id: "string",
  type: "string",
  primary: "string",
  aliases: "string",
  taxonomy: "string",
  profileText: "string",
} as const;

export interface CatalogSearchEngine {
  documents: CatalogSearchDocument[];
  database: ReturnType<typeof create<typeof schema>>;
}

export function createCatalogSearchEngine(
  artifact: CatalogSearchArtifact,
): CatalogSearchEngine {
  const database = create({ schema });
  insertMultiple(
    database,
    artifact.documents.map((document) => ({
      id: document.id,
      type: document.type,
      primary: document.primary,
      aliases: document.aliases,
      taxonomy: document.taxonomy,
      profileText: document.profileText,
    })),
  );
  return { documents: artifact.documents, database };
}

export async function searchCatalogDocuments(
  engine: CatalogSearchEngine,
  rawQuery: string,
  limit = 60,
): Promise<CatalogSearchDocument[]> {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];
  const result = await search(engine.database, {
    term: query,
    properties: ["primary", "aliases", "taxonomy", "profileText"],
    boost: {
      primary: 5,
      aliases: 3,
      taxonomy: 1.5,
      profileText: 0.5,
    },
    tolerance: query.length >= 7 ? 2 : query.length >= 4 ? 1 : 0,
    limit,
  });
  const documentsById = new Map(
    engine.documents.map((document) => [document.id, document]),
  );
  return result.hits
    .map((hit) => ({
      document: documentsById.get(String(hit.id)),
      score: hit.score,
    }))
    .filter(
      (result): result is { document: CatalogSearchDocument; score: number } =>
        result.document !== undefined,
    )
    .sort(
      (first, second) =>
        getSearchMatchTier(first.document, query) -
          getSearchMatchTier(second.document, query) ||
        getSearchTypePriority(first.document, query) -
          getSearchTypePriority(second.document, query) ||
        getSearchEditDistance(first.document, query) -
          getSearchEditDistance(second.document, query) ||
        second.score - first.score ||
        first.document.id.localeCompare(second.document.id, "en"),
    )
    .map((result) => result.document);
}
