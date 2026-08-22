import type {
  CatalogModel,
  SpecimenCardRecord,
  TaxonCardRecord,
  TaxonomyRank,
} from "@/domain/catalog/queries";
import type { CatalogSearchDocument } from "@/domain/search/documents";

import type { CatalogState } from "./catalogState";

export interface SpeciesMatchSummary {
  matchedCount: number;
  totalCount: number;
  lengthRange: [number, number] | null;
  massRange: [number, number] | null;
}

export interface FilteredCatalog {
  taxa: TaxonCardRecord[];
  specimens: SpecimenCardRecord[];
  summaries: Record<string, SpeciesMatchSummary>;
}

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

export function filterCatalog(
  catalog: CatalogModel,
  state: CatalogState,
  searchDocuments: CatalogSearchDocument[] | null,
): FilteredCatalog {
  const queryActive = state.query.trim().length > 0;
  const queryTaxonOrder = new Map<string, number>();
  const querySpecimenOrder = new Map<string, number>();
  const broadQueryTaxonIds = new Set<string>();

  if (queryActive && searchDocuments) {
    searchDocuments.forEach((document, index) => {
      if (document.type !== "specimen") {
        for (const taxonId of document.taxonIds) {
          broadQueryTaxonIds.add(taxonId);
          keepLowest(queryTaxonOrder, taxonId, index);
        }
      } else {
        keepLowest(queryTaxonOrder, document.taxonId, index);
        keepLowest(querySpecimenOrder, document.specimenId, index);
      }
    });
  }

  const summaries: Record<string, SpeciesMatchSummary> = {};
  const filteredTaxa = catalog.taxa.flatMap((card) => {
    if (!taxonMatchesScope(card, state)) return [];
    if (
      queryActive &&
      searchDocuments &&
      !queryTaxonOrder.has(card.taxon.taxonId)
    ) {
      return [];
    }

    const querySpecimenRestricted =
      queryActive &&
      searchDocuments !== null &&
      !broadQueryTaxonIds.has(card.taxon.taxonId);
    const matchingSpecimens = card.specimens.filter(
      (specimenCard) =>
        (!querySpecimenRestricted ||
          querySpecimenOrder.has(specimenCard.specimen.specimenId)) &&
        specimenMatchesFeatures(specimenCard, state),
    );
    if (matchingSpecimens.length === 0) return [];

    summaries[card.taxon.taxonId] = {
      matchedCount: matchingSpecimens.length,
      totalCount: card.specimenCount,
      lengthRange: measurementRange(
        matchingSpecimens.map(
          ({ specimen }) => specimen.measurements.skullLength,
        ),
      ),
      massRange: measurementRange(
        matchingSpecimens.map(
          ({ specimen }) => specimen.measurements.skullMass,
        ),
      ),
    };
    return [card];
  });

  const filteredSpecimens = catalog.specimens.filter((card) => {
    if (!taxonMatchesScope(card, state)) return false;
    if (queryActive && searchDocuments) {
      const broadMatch = broadQueryTaxonIds.has(card.taxon.taxonId);
      if (!broadMatch && !querySpecimenOrder.has(card.specimen.specimenId)) {
        return false;
      }
    }
    return specimenMatchesFeatures(card, state);
  });

  return {
    taxa: sortTaxa(filteredTaxa, state, queryTaxonOrder),
    specimens: sortSpecimens(
      filteredSpecimens,
      state,
      broadQueryTaxonIds,
      queryTaxonOrder,
      querySpecimenOrder,
    ),
    summaries,
  };
}

export function hasSpecimenFeatureFilters(state: CatalogState): boolean {
  return (
    state.sex.length > 0 ||
    state.age.length > 0 ||
    state.condition.length > 0 ||
    state.preparation.length > 0 ||
    state.lengthMin !== null ||
    state.lengthMax !== null ||
    state.massMin !== null ||
    state.massMax !== null
  );
}

function taxonMatchesScope(
  card: TaxonCardRecord | SpecimenCardRecord,
  state: CatalogState,
): boolean {
  const taxon = card.taxon;
  if (state.classSlug && taxon.hierarchy.classSlug !== state.classSlug) {
    return false;
  }
  if (!state.scope) return true;
  return taxonomySlug(taxon.hierarchy, state.scope.rank) === state.scope.slug;
}

function taxonomySlug(
  hierarchy: TaxonCardRecord["taxon"]["hierarchy"],
  rank: TaxonomyRank,
): string | null {
  return {
    class: hierarchy.classSlug,
    order: hierarchy.orderSlug,
    family: hierarchy.familySlug,
    genus: hierarchy.genusSlug,
  }[rank];
}

function specimenMatchesFeatures(
  card: SpecimenCardRecord,
  state: CatalogState,
): boolean {
  const specimen = card.specimen;
  if (state.sex.length > 0 && !state.sex.includes(specimen.sex)) return false;
  if (state.age.length > 0 && !state.age.includes(specimen.ageClass)) {
    return false;
  }
  if (
    state.condition.length > 0 &&
    !state.condition.includes(specimen.condition)
  ) {
    return false;
  }
  if (
    state.preparation.length > 0 &&
    !specimen.preparation.defleshing.method.some((method) =>
      state.preparation.includes(method),
    )
  ) {
    return false;
  }
  return (
    measurementMatchesRange(
      specimen.measurements.skullLength,
      state.lengthMin,
      state.lengthMax,
    ) &&
    measurementMatchesRange(
      specimen.measurements.skullMass,
      state.massMin,
      state.massMax,
    )
  );
}

function measurementMatchesRange(
  measurement: SpecimenCardRecord["specimen"]["measurements"]["skullLength"],
  minimum: number | null,
  maximum: number | null,
): boolean {
  if (minimum === null && maximum === null) return true;
  if (measurement.value === null) return false;
  return (
    (minimum === null || measurement.value >= minimum) &&
    (maximum === null || measurement.value <= maximum)
  );
}

function measurementRange(
  measurements: Array<
    SpecimenCardRecord["specimen"]["measurements"]["skullLength"]
  >,
): [number, number] | null {
  const values = measurements.flatMap((measurement) =>
    measurement.status === "measured" || measurement.status === "approximate"
      ? [measurement.value]
      : [],
  );
  return values.length > 0 ? [Math.min(...values), Math.max(...values)] : null;
}

function sortTaxa(
  cards: TaxonCardRecord[],
  state: CatalogState,
  queryOrder: Map<string, number>,
): TaxonCardRecord[] {
  return [...cards].sort((first, second) => {
    if (state.query.trim()) {
      return (
        (queryOrder.get(first.taxon.taxonId) ?? Number.MAX_SAFE_INTEGER) -
          (queryOrder.get(second.taxon.taxonId) ?? Number.MAX_SAFE_INTEGER) ||
        collator.compare(first.taxon.taxonId, second.taxon.taxonId)
      );
    }
    const scientific = state.sort === "scientific-name";
    const firstName = scientific
      ? first.taxon.scientificName
      : (first.taxon.names.english ?? first.taxon.scientificName);
    const secondName = scientific
      ? second.taxon.scientificName
      : (second.taxon.names.english ?? second.taxon.scientificName);
    return (
      collator.compare(firstName, secondName) ||
      collator.compare(first.taxon.taxonId, second.taxon.taxonId)
    );
  });
}

function sortSpecimens(
  cards: SpecimenCardRecord[],
  state: CatalogState,
  broadTaxonIds: Set<string>,
  taxonOrder: Map<string, number>,
  specimenOrder: Map<string, number>,
): SpecimenCardRecord[] {
  return [...cards].sort((first, second) => {
    if (state.query.trim()) {
      const firstOrder = broadTaxonIds.has(first.taxon.taxonId)
        ? (taxonOrder.get(first.taxon.taxonId) ?? Number.MAX_SAFE_INTEGER)
        : (specimenOrder.get(first.specimen.specimenId) ??
          Number.MAX_SAFE_INTEGER);
      const secondOrder = broadTaxonIds.has(second.taxon.taxonId)
        ? (taxonOrder.get(second.taxon.taxonId) ?? Number.MAX_SAFE_INTEGER)
        : (specimenOrder.get(second.specimen.specimenId) ??
          Number.MAX_SAFE_INTEGER);
      if (firstOrder !== secondOrder) return firstOrder - secondOrder;
    }
    if (state.sort === "skull-length" || state.sort === "skull-mass") {
      const key = state.sort === "skull-length" ? "skullLength" : "skullMass";
      const difference = compareMeasurements(
        first.specimen.measurements[key],
        second.specimen.measurements[key],
      );
      if (difference !== 0) return difference;
    }
    const scientific = state.sort === "scientific-name";
    const firstName = scientific
      ? first.taxon.scientificName
      : (first.taxon.names.english ?? first.taxon.scientificName);
    const secondName = scientific
      ? second.taxon.scientificName
      : (second.taxon.names.english ?? second.taxon.scientificName);
    return (
      collator.compare(firstName, secondName) ||
      collator.compare(first.specimen.specimenId, second.specimen.specimenId)
    );
  });
}

function compareMeasurements(
  first: SpecimenCardRecord["specimen"]["measurements"]["skullLength"],
  second: SpecimenCardRecord["specimen"]["measurements"]["skullLength"],
): number {
  const firstValue =
    first.status === "measured" || first.status === "approximate"
      ? first.value
      : null;
  const secondValue =
    second.status === "measured" || second.status === "approximate"
      ? second.value
      : null;
  if (firstValue === null && secondValue === null) return 0;
  if (firstValue === null) return 1;
  if (secondValue === null) return -1;
  return firstValue - secondValue;
}

function keepLowest(map: Map<string, number>, key: string, value: number) {
  map.set(key, Math.min(map.get(key) ?? Number.MAX_SAFE_INTEGER, value));
}
