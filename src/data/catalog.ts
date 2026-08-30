import { getCollection } from "@/data/collection";
import {
  getCatalogModel,
  getSpecimenCardRecords,
  getTaxonSuggestions,
  getTaxonomyLanding,
  getTaxonomyNodes,
  taxonomyHref,
  type TaxonomyRank,
} from "@/domain/catalog/queries";

export function getCatalog() {
  return getCatalogModel(getCollection());
}

export function getTaxonomyStaticParams() {
  return getTaxonomyNodes(getCollection()).map((node) => ({
    rank: node.rank,
    slug: node.slug,
  }));
}

export function getRankLanding(rank: TaxonomyRank, slug: string) {
  return getTaxonomyLanding(getCollection(), rank, slug);
}

export function getRelatedTaxa(taxonId: string) {
  return getTaxonSuggestions(getCollection(), taxonId);
}

export function getGeographicSpecimens() {
  const collection = getCollection();
  return getSpecimenCardRecords(collection).filter(
    ({ specimen }) =>
      specimen.location.latitude !== null &&
      specimen.location.longitude !== null &&
      specimen.location.precision !== "unknown",
  );
}

export function getPublicRoutePaths(): string[] {
  const collection = getCollection();
  const catalog = getCatalogModel(collection);
  const specimenPaths = getSpecimenCardRecords(collection).map(
    ({ href }) => href,
  );
  return [
    "/",
    "/species",
    "/map",
    "/methodology",
    "/guides/skull-preparation",
    ...catalog.taxonomyNodes.map((node) => taxonomyHref(node.rank, node.slug)),
    ...catalog.taxa.map(({ href }) => href),
    ...specimenPaths,
  ].sort((first, second) => first.localeCompare(second, "en"));
}
