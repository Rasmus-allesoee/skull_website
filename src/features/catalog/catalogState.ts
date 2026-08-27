import type { SortDirection, TaxonomyRank } from "@/domain/catalog/queries";

export const catalogModes = ["species", "specimens"] as const;
export const catalogSorts = [
  "browse",
  "common-name",
  "scientific-name",
  "skull-length",
  "skull-mass",
] as const;
export const catalogSortDirections = ["ascending", "descending"] as const;

export type CatalogMode = (typeof catalogModes)[number];
export type CatalogViewSort = (typeof catalogSorts)[number];

export interface CatalogScope {
  rank: TaxonomyRank;
  slug: string;
}

export interface CatalogState {
  query: string;
  mode: CatalogMode;
  classSlug: string | null;
  scope: CatalogScope | null;
  sex: string[];
  age: string[];
  condition: string[];
  preparation: string[];
  lengthMin: number | null;
  lengthMax: number | null;
  massMin: number | null;
  massMax: number | null;
  sort: CatalogViewSort;
  direction: SortDirection;
}

export const defaultCatalogState: CatalogState = {
  query: "",
  mode: "species",
  classSlug: null,
  scope: null,
  sex: [],
  age: [],
  condition: [],
  preparation: [],
  lengthMin: null,
  lengthMax: null,
  massMin: null,
  massMax: null,
  sort: "browse",
  direction: "ascending",
};

export function parseCatalogState(search: string): CatalogState {
  const parameters = new URLSearchParams(search);
  const mode = parameters.get("mode");
  const sort = parameters.get("sort");
  const direction = parameters.get("direction");
  const scope = parseScope(parameters.get("scope"));

  return normalizeCatalogState({
    query: parameters.get("q")?.trim() ?? "",
    mode: catalogModes.includes(mode as CatalogMode)
      ? (mode as CatalogMode)
      : "species",
    classSlug: parseSlug(parameters.get("class")),
    scope,
    sex: parseList(parameters.get("sex")),
    age: parseList(parameters.get("age")),
    condition: parseList(parameters.get("condition")),
    preparation: parseList(parameters.get("preparation")),
    lengthMin: parseNumber(parameters.get("lengthMin")),
    lengthMax: parseNumber(parameters.get("lengthMax")),
    massMin: parseNumber(parameters.get("massMin")),
    massMax: parseNumber(parameters.get("massMax")),
    sort: catalogSorts.includes(sort as CatalogViewSort)
      ? (sort as CatalogViewSort)
      : "browse",
    direction: catalogSortDirections.includes(direction as SortDirection)
      ? (direction as SortDirection)
      : "ascending",
  });
}

export function normalizeCatalogState(state: CatalogState): CatalogState {
  return {
    ...state,
    query: state.query.trimStart().slice(0, 120),
    sex: uniqueSorted(state.sex),
    age: uniqueSorted(state.age),
    condition: uniqueSorted(state.condition),
    preparation: uniqueSorted(state.preparation),
    lengthMin: normalizeRangeValue(state.lengthMin),
    lengthMax: normalizeRangeValue(state.lengthMax),
    massMin: normalizeRangeValue(state.massMin),
    massMax: normalizeRangeValue(state.massMax),
    direction: catalogSortDirections.includes(state.direction)
      ? state.direction
      : "ascending",
  };
}

export function serializeCatalogState(state: CatalogState): string {
  const normalized = normalizeCatalogState(state);
  const parameters = new URLSearchParams();
  if (normalized.query.trim()) parameters.set("q", normalized.query.trim());
  if (normalized.mode !== "species") parameters.set("mode", normalized.mode);
  if (normalized.classSlug) parameters.set("class", normalized.classSlug);
  if (normalized.scope) {
    parameters.set(
      "scope",
      `${normalized.scope.rank}:${normalized.scope.slug}`,
    );
  }
  setList(parameters, "sex", normalized.sex);
  setList(parameters, "age", normalized.age);
  setList(parameters, "condition", normalized.condition);
  setList(parameters, "preparation", normalized.preparation);
  setNumber(parameters, "lengthMin", normalized.lengthMin);
  setNumber(parameters, "lengthMax", normalized.lengthMax);
  setNumber(parameters, "massMin", normalized.massMin);
  setNumber(parameters, "massMax", normalized.massMax);
  if (normalized.sort !== "browse") parameters.set("sort", normalized.sort);
  if (normalized.direction !== "ascending") {
    parameters.set("direction", normalized.direction);
  }
  return parameters.toString();
}

export function catalogStateIsActive(state: CatalogState): boolean {
  return serializeCatalogState(state).length > 0;
}

function parseScope(value: string | null): CatalogScope | null {
  if (!value) return null;
  const [rank, slug, ...rest] = value.split(":");
  if (
    rest.length > 0 ||
    !["class", "order", "family", "genus"].includes(rank ?? "") ||
    !parseSlug(slug ?? null)
  ) {
    return null;
  }
  return { rank: rank as TaxonomyRank, slug: slug! };
}

function parseSlug(value: string | null): string | null {
  return value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : null;
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .filter((item) => /^[a-z0-9_]+$/.test(item))
    .slice(0, 20);
}

function parseNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeRangeValue(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 ? value : null;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((first, second) =>
    first.localeCompare(second, "en"),
  );
}

function setList(parameters: URLSearchParams, key: string, values: string[]) {
  if (values.length > 0) parameters.set(key, values.join(","));
}

function setNumber(
  parameters: URLSearchParams,
  key: string,
  value: number | null,
) {
  if (value !== null) parameters.set(key, String(value));
}
