import { create, insertMultiple, search } from "@orama/orama";

import {
  getCatalogSearchMatch,
  getSearchTypePriority,
  normalizeSearchText,
  type CatalogSearchArtifact,
  type CatalogSearchDocument,
  type CatalogSearchMatch,
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
    tolerance: getOramaTolerance(query),
    // Keep index retrieval broad enough to find a misspelled token in a
    // multi-word phrase. The deterministic matcher below owns acceptance.
    threshold: 1,
    limit: Math.max(limit, engine.documents.length),
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
      (
        result,
      ): result is {
        document: CatalogSearchDocument;
        score: number;
      } => result.document !== undefined,
    )
    .map((result) => ({
      ...result,
      match: getCatalogSearchMatch(result.document, query),
    }))
    .filter(
      (
        result,
      ): result is {
        document: CatalogSearchDocument;
        score: number;
        match: CatalogSearchMatch;
      } => result.match !== null,
    )
    .sort(
      (first, second) =>
        first.match.tier - second.match.tier ||
        getSearchTypePriority(first.document, query) -
          getSearchTypePriority(second.document, query) ||
        first.match.editDistance - second.match.editDistance ||
        second.score - first.score ||
        first.document.id.localeCompare(second.document.id, "en"),
    )
    .slice(0, limit)
    .map((result) => result.document);
}

function getOramaTolerance(query: string): number {
  const longestToken = Math.max(
    ...query.split(" ").map((token) => token.length),
  );
  if (longestToken >= 12) return 2;
  if (longestToken >= 4) return 1;
  return 0;
}
