import type {
  CompiledCollection,
  MediaAsset,
  SpecimenRecord,
  TaxonRecord,
} from "@/domain/content/types";

export const taxonomyRanks = ["class", "order", "family", "genus"] as const;

export type TaxonomyRank = (typeof taxonomyRanks)[number];
export type CatalogSort = "common-name" | "scientific-name";
export type SortDirection = "ascending" | "descending";

export interface TaxonomyNodeRef {
  rank: TaxonomyRank;
  name: string;
  slug: string;
}

export interface TaxonomyNode extends TaxonomyNodeRef {
  parent: TaxonomyNodeRef | null;
  taxonIds: string[];
  taxonCount: number;
  specimenCount: number;
}

export interface TaxonCardRecord {
  taxon: TaxonRecord;
  defaultSpecimen: SpecimenRecord;
  specimenCount: number;
  specimens: SpecimenCardRecord[];
  image: MediaAsset | null;
  href: string;
}

export interface SpecimenCardRecord {
  specimen: SpecimenRecord;
  taxon: TaxonRecord;
  image: MediaAsset | null;
  href: string;
}

export interface ClassEntry {
  node: TaxonomyNode;
  representative: TaxonCardRecord | null;
}

export interface FamilyTaxonGroup {
  family: TaxonomyNodeRef | null;
  cards: TaxonCardRecord[];
}

export interface FamilySpecimenGroup {
  family: TaxonomyNodeRef | null;
  cards: SpecimenCardRecord[];
}

export interface TaxonomyTreeBranch {
  node: TaxonomyNode;
  representative: TaxonCardRecord | null;
  children: TaxonomyTreeBranch[];
}

export interface CatalogTaxonomyBranch {
  node: TaxonomyNode;
  children: CatalogTaxonomyBranch[];
  taxa: TaxonCardRecord[];
}

export interface CatalogRankCounts {
  species: number;
  genusLevelRecords: number;
  classes: number;
  orders: number;
  families: number;
  genera: number;
}

export interface CatalogModel {
  taxonCount: number;
  specimenCount: number;
  rankCounts: CatalogRankCounts;
  classEntries: ClassEntry[];
  taxonomyNodes: TaxonomyNode[];
  taxonomyTree: TaxonomyTreeBranch[];
  taxonomyBrowserTree: CatalogTaxonomyBranch[];
  taxa: TaxonCardRecord[];
  specimens: SpecimenCardRecord[];
}

export interface TaxonomyLandingModel {
  node: TaxonomyNode;
  ancestors: TaxonomyNode[];
  children: TaxonomyNode[];
  descendantGroups: Partial<Record<TaxonomyRank, TaxonomyNode[]>>;
  taxa: TaxonCardRecord[];
}

export interface TaxonSuggestions {
  sameFamily: TaxonCardRecord[];
  collectionWide: TaxonCardRecord[];
}

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

export function getCatalogModel(
  collection: CompiledCollection,
  sort: CatalogSort = "common-name",
): CatalogModel {
  const publishedTaxa = getPublishedTaxa(collection);
  const publishedSpecimens = getPublishedSpecimens(collection);
  const taxonomyNodes = getTaxonomyNodes(collection);
  const taxa = getTaxonCardRecords(collection, publishedTaxa, sort);
  const classEntries = taxonomyNodes
    .filter((node) => node.rank === "class")
    .map((node) => ({
      node,
      representative:
        taxa.find((card) => node.taxonIds.includes(card.taxon.taxonId)) ?? null,
    }));
  const countRank = (rank: TaxonomyRank) =>
    taxonomyNodes.filter((node) => node.rank === rank).length;

  return {
    taxonCount: publishedTaxa.length,
    specimenCount: publishedSpecimens.length,
    rankCounts: {
      species: publishedTaxa.filter((taxon) => taxon.rank !== "genus").length,
      genusLevelRecords: publishedTaxa.filter((taxon) => taxon.rank === "genus")
        .length,
      classes: countRank("class"),
      orders: countRank("order"),
      families: countRank("family"),
      genera: countRank("genus"),
    },
    classEntries,
    taxonomyNodes,
    taxonomyTree: getTaxonomyTree(taxonomyNodes, taxa),
    taxonomyBrowserTree: getCatalogTaxonomyTree(taxonomyNodes, taxa),
    taxa,
    specimens: getSpecimenCardRecords(collection, publishedSpecimens),
  };
}

export function getPublishedTaxa(
  collection: CompiledCollection,
): TaxonRecord[] {
  return collection.taxa.filter(
    (taxon) => taxon.publicationStatus === "published",
  );
}

export function getPublishedSpecimens(
  collection: CompiledCollection,
): SpecimenRecord[] {
  const publishedTaxonIds = new Set(
    getPublishedTaxa(collection).map((taxon) => taxon.taxonId),
  );
  return collection.specimens.filter(
    (specimen) =>
      specimen.publicationStatus === "published" &&
      publishedTaxonIds.has(specimen.taxonId),
  );
}

export function getTaxonCardRecords(
  collection: CompiledCollection,
  taxa: TaxonRecord[] = getPublishedTaxa(collection),
  sort: CatalogSort = "common-name",
): TaxonCardRecord[] {
  const publishedSpecimens = getPublishedSpecimens(collection);
  return taxa
    .flatMap((taxon) => {
      const specimens = publishedSpecimens.filter(
        (specimen) => specimen.taxonId === taxon.taxonId,
      );
      const defaultSpecimen = specimens.find(
        (specimen) => specimen.specimenId === taxon.defaultSpecimenId,
      );
      if (!defaultSpecimen) return [];
      const specimenCards = specimens
        .map((specimen) =>
          createSpecimenCardRecord(collection, specimen, taxon),
        )
        .sort((first, second) =>
          collator.compare(
            first.specimen.specimenId,
            second.specimen.specimenId,
          ),
        );
      return [
        {
          taxon,
          defaultSpecimen,
          specimenCount: specimens.length,
          specimens: specimenCards,
          image: getLateralAsset(collection, defaultSpecimen.specimenId),
          href: `/species/${taxon.slug}`,
        },
      ];
    })
    .sort((first, second) => compareTaxonCards(first, second, sort));
}

export function getSpecimenCardRecords(
  collection: CompiledCollection,
  specimens: SpecimenRecord[] = getPublishedSpecimens(collection),
): SpecimenCardRecord[] {
  const taxaById = new Map(
    getPublishedTaxa(collection).map((taxon) => [taxon.taxonId, taxon]),
  );
  return specimens
    .flatMap((specimen) => {
      const taxon = taxaById.get(specimen.taxonId);
      if (!taxon) return [];
      return [createSpecimenCardRecord(collection, specimen, taxon)];
    })
    .sort(
      (first, second) =>
        collator.compare(
          first.taxon.names.english ?? first.taxon.scientificName,
          second.taxon.names.english ?? second.taxon.scientificName,
        ) ||
        collator.compare(first.specimen.specimenId, second.specimen.specimenId),
    );
}

export function groupTaxonCardsByFamily(
  cards: TaxonCardRecord[],
  direction: SortDirection = "ascending",
): FamilyTaxonGroup[] {
  const groups = new Map<string, FamilyTaxonGroup>();
  for (const card of cards) {
    const family =
      card.taxon.hierarchy.familyName && card.taxon.hierarchy.familySlug
        ? {
            rank: "family" as const,
            name: card.taxon.hierarchy.familyName,
            slug: card.taxon.hierarchy.familySlug,
          }
        : null;
    const key = family ? family.slug : "__unrecorded__";
    const group = groups.get(key) ?? { family, cards: [] };
    group.cards.push(card);
    groups.set(key, group);
  }
  return sortFamilyGroups([...groups.values()], direction);
}

export function groupSpecimenCardsByFamily(
  cards: SpecimenCardRecord[],
  direction: SortDirection = "ascending",
): FamilySpecimenGroup[] {
  const groups = new Map<string, FamilySpecimenGroup>();
  for (const card of cards) {
    const family =
      card.taxon.hierarchy.familyName && card.taxon.hierarchy.familySlug
        ? {
            rank: "family" as const,
            name: card.taxon.hierarchy.familyName,
            slug: card.taxon.hierarchy.familySlug,
          }
        : null;
    const key = family ? family.slug : "__unrecorded__";
    const group = groups.get(key) ?? { family, cards: [] };
    group.cards.push(card);
    groups.set(key, group);
  }
  return sortFamilyGroups([...groups.values()], direction);
}

function sortFamilyGroups<T extends FamilyTaxonGroup | FamilySpecimenGroup>(
  groups: T[],
  direction: SortDirection,
): T[] {
  const multiplier = direction === "ascending" ? 1 : -1;
  return groups.sort(
    (first, second) =>
      multiplier *
      collator.compare(
        first.family?.name ?? "Family not recorded",
        second.family?.name ?? "Family not recorded",
      ),
  );
}

export function getTaxonomyNodes(
  collection: CompiledCollection,
): TaxonomyNode[] {
  const nodes = new Map<
    string,
    TaxonomyNodeRef & { parent: TaxonomyNodeRef | null; taxonIds: Set<string> }
  >();

  for (const taxon of getPublishedTaxa(collection)) {
    let parent: TaxonomyNodeRef | null = null;
    for (const ref of getTaxonLineage(taxon)) {
      const key = taxonomyNodeKey(ref.rank, ref.slug);
      const existing = nodes.get(key);
      if (existing) {
        existing.taxonIds.add(taxon.taxonId);
      } else {
        nodes.set(key, { ...ref, parent, taxonIds: new Set([taxon.taxonId]) });
      }
      parent = ref;
    }
  }

  const publishedSpecimens = getPublishedSpecimens(collection);
  return [...nodes.values()]
    .map((node) => {
      const taxonIds = [...node.taxonIds].sort(collator.compare);
      const taxonIdSet = new Set(taxonIds);
      return {
        rank: node.rank,
        name: node.name,
        slug: node.slug,
        parent: node.parent,
        taxonIds,
        taxonCount: taxonIds.length,
        specimenCount: publishedSpecimens.filter((specimen) =>
          taxonIdSet.has(specimen.taxonId),
        ).length,
      };
    })
    .sort(
      (first, second) =>
        taxonomyRanks.indexOf(first.rank) -
          taxonomyRanks.indexOf(second.rank) ||
        collator.compare(first.name, second.name),
    );
}

export function getTaxonomyLanding(
  collection: CompiledCollection,
  rank: TaxonomyRank,
  slug: string,
): TaxonomyLandingModel | null {
  const nodes = getTaxonomyNodes(collection);
  const node = nodes.find(
    (candidate) => candidate.rank === rank && candidate.slug === slug,
  );
  if (!node) return null;
  const nodeTaxonIds = new Set(node.taxonIds);
  const descendants = nodes.filter(
    (candidate) =>
      taxonomyRanks.indexOf(candidate.rank) >
        taxonomyRanks.indexOf(node.rank) &&
      candidate.taxonIds.some((taxonId) => nodeTaxonIds.has(taxonId)),
  );
  const descendantGroups = Object.fromEntries(
    taxonomyRanks
      .map((candidateRank) => [
        candidateRank,
        descendants.filter((candidate) => candidate.rank === candidateRank),
      ])
      .filter(([, values]) => (values as TaxonomyNode[]).length > 0),
  ) as Partial<Record<TaxonomyRank, TaxonomyNode[]>>;
  const children = nodes.filter(
    (candidate) =>
      candidate.parent?.rank === node.rank &&
      candidate.parent.slug === node.slug,
  );
  const ancestors: TaxonomyNode[] = [];
  let parent = node.parent;
  while (parent) {
    const parentNode = nodes.find(
      (candidate) =>
        candidate.rank === parent?.rank && candidate.slug === parent.slug,
    );
    if (!parentNode) break;
    ancestors.unshift(parentNode);
    parent = parentNode.parent;
  }
  const scopedTaxa = getPublishedTaxa(collection).filter((taxon) =>
    nodeTaxonIds.has(taxon.taxonId),
  );

  return {
    node,
    ancestors,
    children,
    descendantGroups,
    taxa: getTaxonCardRecords(collection, scopedTaxa),
  };
}

export function getTaxonSuggestions(
  collection: CompiledCollection,
  currentTaxonId: string,
): TaxonSuggestions {
  const current = getPublishedTaxa(collection).find(
    (taxon) => taxon.taxonId === currentTaxonId,
  );
  if (!current) return { sameFamily: [], collectionWide: [] };
  const candidates = getPublishedTaxa(collection).filter(
    (taxon) => taxon.taxonId !== currentTaxonId,
  );
  const sameFamilyTaxa = current.hierarchy.familySlug
    ? candidates
        .filter(
          (taxon) =>
            taxon.hierarchy.familySlug === current.hierarchy.familySlug,
        )
        .sort((first, second) =>
          compareStableDiscovery(currentTaxonId, first, second),
        )
        .slice(0, 3)
    : [];
  const sameFamilyIds = new Set(sameFamilyTaxa.map((taxon) => taxon.taxonId));
  const collectionWideTaxa = candidates
    .filter((taxon) => !sameFamilyIds.has(taxon.taxonId))
    .sort((first, second) =>
      compareStableDiscovery(currentTaxonId, first, second),
    )
    .slice(0, 3);

  return {
    sameFamily: getTaxonCardRecords(collection, sameFamilyTaxa),
    collectionWide: getTaxonCardRecords(collection, collectionWideTaxa),
  };
}

export function resolvePublishedTaxonSlug(
  collection: CompiledCollection,
  slug: string,
): { taxon: TaxonRecord; redirect: boolean } | null {
  const taxa = getPublishedTaxa(collection);
  const current = taxa.find((taxon) => taxon.slug === slug);
  if (current) return { taxon: current, redirect: false };
  const previous = taxa.find((taxon) => taxon.previousSlugs.includes(slug));
  return previous ? { taxon: previous, redirect: true } : null;
}

export function getTaxonLineage(taxon: TaxonRecord): TaxonomyNodeRef[] {
  return [
    {
      rank: "class" as const,
      name: taxon.hierarchy.className,
      slug: taxon.hierarchy.classSlug,
    },
    taxon.hierarchy.orderName && taxon.hierarchy.orderSlug
      ? {
          rank: "order" as const,
          name: taxon.hierarchy.orderName,
          slug: taxon.hierarchy.orderSlug,
        }
      : null,
    taxon.hierarchy.familyName && taxon.hierarchy.familySlug
      ? {
          rank: "family" as const,
          name: taxon.hierarchy.familyName,
          slug: taxon.hierarchy.familySlug,
        }
      : null,
    {
      rank: "genus" as const,
      name: taxon.hierarchy.genusName,
      slug: taxon.hierarchy.genusSlug,
    },
  ].filter((value): value is TaxonomyNodeRef => value !== null);
}

export function taxonomyHref(rank: TaxonomyRank, slug: string): string {
  return `/taxonomy/${rank}/${slug}`;
}

export function pluralizeTaxonomyRank(rank: TaxonomyRank): string {
  return {
    class: "classes",
    order: "orders",
    family: "families",
    genus: "genera",
  }[rank];
}

function getTaxonomyTree(
  nodes: TaxonomyNode[],
  cards: TaxonCardRecord[],
): TaxonomyTreeBranch[] {
  const buildBranch = (
    node: TaxonomyNode,
    childRank: TaxonomyRank | null,
  ): TaxonomyTreeBranch => ({
    node,
    representative:
      cards.find((card) => node.taxonIds.includes(card.taxon.taxonId)) ?? null,
    children: childRank
      ? nodes
          .filter(
            (candidate) =>
              candidate.rank === childRank &&
              candidate.parent?.rank === node.rank &&
              candidate.parent.slug === node.slug,
          )
          .map((candidate) =>
            buildBranch(candidate, childRank === "order" ? "family" : null),
          )
      : [],
  });

  return nodes
    .filter((node) => node.rank === "class")
    .map((node) => buildBranch(node, "order"));
}

function getCatalogTaxonomyTree(
  nodes: TaxonomyNode[],
  cards: TaxonCardRecord[],
): CatalogTaxonomyBranch[] {
  const childRank: Record<TaxonomyRank, TaxonomyRank | null> = {
    class: "order",
    order: "family",
    family: "genus",
    genus: null,
  };

  const buildBranch = (node: TaxonomyNode): CatalogTaxonomyBranch => {
    const nextRank = childRank[node.rank];
    const children = nextRank
      ? nodes
          .filter(
            (candidate) =>
              candidate.rank === nextRank &&
              candidate.parent?.rank === node.rank &&
              candidate.parent.slug === node.slug,
          )
          .map(buildBranch)
      : [];
    const nodeTaxa =
      node.rank === "genus"
        ? cards.filter((card) => node.taxonIds.includes(card.taxon.taxonId))
        : [];

    return { node, children, taxa: nodeTaxa };
  };

  return nodes.filter((node) => node.rank === "class").map(buildBranch);
}

function getLateralAsset(
  collection: CompiledCollection,
  specimenId: string,
): MediaAsset | null {
  return (
    collection.media.find(
      (asset) => asset.specimenId === specimenId && asset.view === "lateral",
    ) ?? null
  );
}

function createSpecimenCardRecord(
  collection: CompiledCollection,
  specimen: SpecimenRecord,
  taxon: TaxonRecord,
): SpecimenCardRecord {
  return {
    specimen,
    taxon,
    image: getLateralAsset(collection, specimen.specimenId),
    href: `/species/${taxon.slug}/specimens/${specimen.specimenId}`,
  };
}

function compareTaxonCards(
  first: TaxonCardRecord,
  second: TaxonCardRecord,
  sort: CatalogSort,
) {
  const firstName =
    sort === "scientific-name"
      ? first.taxon.scientificName
      : (first.taxon.names.english ?? first.taxon.scientificName);
  const secondName =
    sort === "scientific-name"
      ? second.taxon.scientificName
      : (second.taxon.names.english ?? second.taxon.scientificName);
  return (
    collator.compare(firstName, secondName) ||
    collator.compare(first.taxon.taxonId, second.taxon.taxonId)
  );
}

function compareStableDiscovery(
  seed: string,
  first: TaxonRecord,
  second: TaxonRecord,
) {
  return (
    stableHash(`${seed}:${first.taxonId}`) -
      stableHash(`${seed}:${second.taxonId}`) ||
    collator.compare(first.taxonId, second.taxonId)
  );
}

function stableHash(value: string): number {
  let hash = 2_166_136_261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function taxonomyNodeKey(rank: TaxonomyRank, slug: string): string {
  return `${rank}:${slug}`;
}
