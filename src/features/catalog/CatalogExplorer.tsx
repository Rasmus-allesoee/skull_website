"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import {
  taxonomyHref,
  type CatalogModel,
  type TaxonomyNode,
} from "@/domain/catalog/queries";
import { humanizeToken } from "@/domain/content/display";
import {
  catalogSearchArtifactVersion,
  catalogSearchPublicPath,
  type CatalogSearchArtifact,
  type CatalogSearchDocument,
} from "@/domain/search/documents";

import { CatalogSearchBox } from "./CatalogSearchBox";
import {
  CatalogFilters,
  type CatalogFilterOption,
  type CatalogFilterOptions,
} from "./CatalogFilters";
import { CatalogTaxonomyDrawer } from "./CatalogTaxonomy";
import { SpecimenCard, TaxonCardGrid } from "./CatalogCards";
import { FamilyGroupedTaxonGallery } from "./FamilyGroupedTaxonGallery";
import {
  catalogStateIsActive,
  defaultCatalogState,
  normalizeCatalogState,
  parseCatalogState,
  serializeCatalogState,
  type CatalogScope,
  type CatalogState,
  type CatalogViewSort,
} from "./catalogState";
import { filterCatalog, hasSpecimenFeatureFilters } from "./catalogFiltering";
import type { CatalogSearchEngine } from "./searchEngine";

export function CatalogExplorer({ catalog }: { catalog: CatalogModel }) {
  const [state, setState] = useState(defaultCatalogState);
  const [searchDocuments, setSearchDocuments] = useState<
    CatalogSearchDocument[] | null
  >(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
  const searchEngineRef = useRef<Promise<CatalogSearchEngine> | null>(null);
  const taxonomyTriggerRef = useRef<HTMLButtonElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const initialize = window.setTimeout(
      () => setState(parseCatalogState(window.location.search)),
      0,
    );
    const restore = () => setState(parseCatalogState(window.location.search));
    window.addEventListener("popstate", restore);
    return () => {
      window.clearTimeout(initialize);
      window.removeEventListener("popstate", restore);
    };
  }, []);

  const loadSearchEngine = useCallback(async () => {
    searchEngineRef.current ??= (async () => {
      const [response, module] = await Promise.all([
        fetch(catalogSearchPublicPath),
        import("./searchEngine"),
      ]);
      if (!response.ok) {
        throw new Error(`Search index returned ${response.status}.`);
      }
      const artifact = (await response.json()) as CatalogSearchArtifact;
      if (
        artifact.schemaVersion !== catalogSearchArtifactVersion ||
        !Array.isArray(artifact.documents)
      ) {
        throw new Error("Search index version does not match the catalog.");
      }
      return module.createCatalogSearchEngine(artifact);
    })();
    return searchEngineRef.current;
  }, []);

  useEffect(() => {
    const query = state.query.trim();
    if (!query) {
      const clear = window.setTimeout(() => {
        setSearchDocuments(null);
        setSearchLoading(false);
        setSearchError(null);
      }, 0);
      return () => window.clearTimeout(clear);
    }
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setSearchLoading(true);
      setSearchError(null);
      void loadSearchEngine()
        .then(async (engine) => {
          const searchModule = await import("./searchEngine");
          if (!cancelled) {
            setSearchDocuments(
              await searchModule.searchCatalogDocuments(engine, query),
            );
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setSearchDocuments([]);
            setSearchError(
              error instanceof Error
                ? `Collection search is unavailable: ${error.message}`
                : "Collection search is unavailable.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false);
        });
    }, 100);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [loadSearchEngine, state.query]);

  const commitState = useCallback(
    (next: CatalogState, history: "push" | "replace" = "push") => {
      const normalized = normalizeCatalogState(next);
      setState(normalized);
      const url = new URL(window.location.href);
      url.search = serializeCatalogState(normalized);
      window.history[history === "push" ? "pushState" : "replaceState"](
        null,
        "",
        url,
      );
    },
    [],
  );

  const filtered = useMemo(
    () => filterCatalog(catalog, state, searchDocuments),
    [catalog, searchDocuments, state],
  );
  const resultCount =
    state.mode === "species" ? filtered.taxa.length : filtered.specimens.length;
  const featureFiltersActive = hasSpecimenFeatureFilters(state);
  const filterOptions = useMemo(() => buildFilterOptions(catalog), [catalog]);
  const selectedScopeNode = state.scope
    ? (catalog.taxonomyNodes.find(
        (node) =>
          node.rank === state.scope?.rank && node.slug === state.scope.slug,
      ) ?? null)
    : null;
  const groupByFamily =
    state.mode === "species" && state.sort === "browse" && !state.query.trim();

  const selectTaxonomyNode = (node: TaxonomyNode) => {
    if (node.rank === "class") {
      commitState({ ...state, classSlug: node.slug, scope: null });
    } else {
      commitState({
        ...state,
        classSlug: null,
        scope: { rank: node.rank, slug: node.slug },
      });
    }
  };

  return (
    <>
      <section
        id="catalog-search"
        className="catalog-control-region"
        aria-label="Catalog controls"
      >
        <div className="catalog-primary-controls">
          <CatalogSearchBox
            query={state.query}
            results={searchDocuments ?? []}
            loading={searchLoading}
            error={searchError}
            onQueryChange={(query) =>
              commitState({ ...state, query }, "replace")
            }
            onSelect={(document) => {
              if (document.type === "rank") {
                const scope = {
                  rank: document.rank as CatalogScope["rank"],
                  slug: document.rankSlug,
                };
                commitState({
                  ...state,
                  query: "",
                  classSlug: scope.rank === "class" ? scope.slug : null,
                  scope: scope.rank === "class" ? null : scope,
                });
              } else {
                window.location.assign(document.url);
              }
            }}
          />
          <fieldset className="catalog-mode-control">
            <legend>Result mode</legend>
            <label>
              <input
                type="radio"
                name="catalog-mode"
                value="species"
                checked={state.mode === "species"}
                onChange={() =>
                  commitState({ ...state, mode: "species", sort: "browse" })
                }
              />
              <span>Species</span>
            </label>
            <label>
              <input
                type="radio"
                name="catalog-mode"
                value="specimens"
                checked={state.mode === "specimens"}
                onChange={() => commitState({ ...state, mode: "specimens" })}
              />
              <span>Specimens</span>
            </label>
          </fieldset>
        </div>

        <div className="catalog-secondary-controls">
          <div className="catalog-class-presets" aria-label="Filter by class">
            <button
              type="button"
              aria-pressed={state.classSlug === null}
              onClick={() =>
                commitState({ ...state, classSlug: null, scope: null })
              }
            >
              <span>All classes</span>
              <small>{catalog.taxonCount} taxa</small>
            </button>
            {catalog.classEntries.map((entry) => (
              <button
                key={entry.node.slug}
                type="button"
                aria-pressed={state.classSlug === entry.node.slug}
                onClick={() =>
                  commitState({
                    ...state,
                    classSlug:
                      state.classSlug === entry.node.slug
                        ? null
                        : entry.node.slug,
                    scope: null,
                  })
                }
              >
                <span>{entry.node.name}</span>
                <small>
                  {entry.node.taxonCount} taxa · {entry.node.specimenCount}{" "}
                  skulls
                </small>
              </button>
            ))}
          </div>
          <div className="catalog-action-controls">
            <CatalogFilters
              state={state}
              options={filterOptions}
              triggerRef={filterTriggerRef}
              onApply={(next) => commitState(next)}
            />
            <label className="catalog-sort-control">
              <span>Sort</span>
              <select
                value={state.sort}
                onChange={(event) =>
                  commitState({
                    ...state,
                    sort: event.target.value as CatalogViewSort,
                  })
                }
              >
                <option value="browse">Family groups</option>
                <option value="common-name">Common name</option>
                <option value="scientific-name">Scientific name</option>
                {state.mode === "specimens" ? (
                  <>
                    <option value="skull-length">Skull length</option>
                    <option value="skull-mass">Skull mass</option>
                  </>
                ) : null}
              </select>
            </label>
            <button
              ref={taxonomyTriggerRef}
              type="button"
              className="catalog-action-button"
              aria-expanded={taxonomyOpen}
              onClick={() => setTaxonomyOpen((open) => !open)}
            >
              Browse taxonomy
            </button>
          </div>
        </div>

        <div className="catalog-active-state">
          <p role="status" aria-live="polite">
            <strong>{resultCount}</strong>{" "}
            {state.mode === "species"
              ? resultCount === 1
                ? "taxon"
                : "taxa"
              : resultCount === 1
                ? "specimen"
                : "specimens"}
            {searchLoading ? " · Searching…" : ""}
          </p>
          <ActiveStateChips
            state={state}
            selectedScopeNode={selectedScopeNode}
            onChange={commitState}
          />
          {catalogStateIsActive(state) ? (
            <button
              type="button"
              className="catalog-clear-all"
              onClick={() => commitState(defaultCatalogState)}
            >
              Clear all
            </button>
          ) : null}
        </div>
      </section>

      <div
        className={`catalog-workspace ${taxonomyOpen ? "taxonomy-is-open" : ""}`}
      >
        <CatalogTaxonomyDrawer
          branches={catalog.taxonomyBrowserTree}
          open={taxonomyOpen}
          selectedScope={state.scope}
          classSlug={state.classSlug}
          openerRef={taxonomyTriggerRef}
          onClose={() => setTaxonomyOpen(false)}
          onSelect={(node) => {
            selectTaxonomyNode(node);
            if (window.matchMedia("(max-width: 64rem)").matches) {
              setTaxonomyOpen(false);
              taxonomyTriggerRef.current?.focus();
            }
          }}
        />

        <section
          id="catalog-results"
          className="catalog-live-results"
          aria-labelledby="catalog-results-title"
          aria-busy={searchLoading}
        >
          <header className="catalog-live-results-heading">
            <div>
              <p className="section-kicker">Published displays</p>
              <h2 id="catalog-results-title">{resultHeading(state)}</h2>
            </div>
            <p>{resultContext(state, selectedScopeNode)}</p>
          </header>
          {resultCount === 0 && !searchLoading ? (
            <div className="catalog-empty-state">
              <p className="card-overline">No matching records</p>
              <h3>No published skulls match this catalog state.</h3>
              <p>
                Unrecorded measurements are excluded only while a numeric range
                is active. Clear the current state or switch result mode to
                recover the full collection.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => commitState(defaultCatalogState)}
                >
                  Clear filters and search
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commitState({
                      ...state,
                      mode: state.mode === "species" ? "specimens" : "species",
                      sort: "browse",
                    })
                  }
                >
                  Show {state.mode === "species" ? "specimens" : "species"}
                </button>
              </div>
            </div>
          ) : state.mode === "species" ? (
            groupByFamily ? (
              <FamilyGroupedTaxonGallery
                cards={filtered.taxa}
                matchSummaries={filtered.summaries}
                showMatchSummary={featureFiltersActive}
              />
            ) : (
              <TaxonCardGrid
                cards={filtered.taxa}
                matchSummaries={filtered.summaries}
                showMatchSummary={featureFiltersActive}
              />
            )
          ) : (
            <div className="catalog-grid">
              {filtered.specimens.map((card) => (
                <SpecimenCard key={card.specimen.specimenId} card={card} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ActiveStateChips({
  state,
  selectedScopeNode,
  onChange,
}: {
  state: CatalogState;
  selectedScopeNode: TaxonomyNode | null;
  onChange: (state: CatalogState) => void;
}) {
  const chips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (state.query.trim()) {
    chips.push({
      key: "query",
      label: `Search: ${state.query.trim()}`,
      clear: () => onChange({ ...state, query: "" }),
    });
  }
  if (state.classSlug) {
    chips.push({
      key: "class",
      label: `Class: ${humanizeToken(state.classSlug)}`,
      clear: () => onChange({ ...state, classSlug: null }),
    });
  }
  if (selectedScopeNode) {
    chips.push({
      key: "scope",
      label: `${humanizeToken(selectedScopeNode.rank)}: ${selectedScopeNode.name}`,
      clear: () => onChange({ ...state, scope: null }),
    });
  }
  for (const [key, values, label] of [
    ["sex", state.sex, "Sex"],
    ["age", state.age, "Age"],
    ["condition", state.condition, "Condition"],
    ["preparation", state.preparation, "Preparation"],
  ] as const) {
    for (const value of values) {
      chips.push({
        key: `${key}:${value}`,
        label: `${label}: ${humanizeToken(value)}`,
        clear: () =>
          onChange({
            ...state,
            [key]: values.filter((candidate) => candidate !== value),
          }),
      });
    }
  }
  for (const [key, value, label, unit] of [
    ["lengthMin", state.lengthMin, "Length at least", "mm"],
    ["lengthMax", state.lengthMax, "Length at most", "mm"],
    ["massMin", state.massMin, "Mass at least", "g"],
    ["massMax", state.massMax, "Mass at most", "g"],
  ] as const) {
    if (value !== null) {
      chips.push({
        key,
        label: `${label}: ${value} ${unit}`,
        clear: () => onChange({ ...state, [key]: null }),
      });
    }
  }
  if (state.sort !== "browse") {
    chips.push({
      key: "sort",
      label: `Sorted: ${humanizeToken(state.sort)}`,
      clear: () => onChange({ ...state, sort: "browse" }),
    });
  }

  if (chips.length === 0 && !selectedScopeNode) {
    return <span className="catalog-default-state">All published records</span>;
  }
  return (
    <div className="catalog-filter-chips" aria-label="Active catalog state">
      {chips.map((chip) => (
        <button key={chip.key} type="button" onClick={chip.clear}>
          {chip.label} <span aria-hidden="true">×</span>
          <span className="visually-hidden">Remove {chip.label}</span>
        </button>
      ))}
      {selectedScopeNode ? (
        <Link
          href={taxonomyHref(selectedScopeNode.rank, selectedScopeNode.slug)}
        >
          Open {selectedScopeNode.rank} page
        </Link>
      ) : null}
    </div>
  );
}

function buildFilterOptions(catalog: CatalogModel): CatalogFilterOptions {
  const specimens = catalog.specimens.map((card) => card.specimen);
  return {
    sex: countOptions(specimens.map((specimen) => specimen.sex)),
    age: countOptions(specimens.map((specimen) => specimen.ageClass)),
    condition: countOptions(specimens.map((specimen) => specimen.condition)),
    preparation: countOptions(
      specimens.flatMap((specimen) => specimen.preparation.defleshing.method),
    ),
  };
}

function countOptions(values: string[]): CatalogFilterOption[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((first, second) =>
      humanizeToken(first.value).localeCompare(
        humanizeToken(second.value),
        "en",
      ),
    );
}

function resultHeading(state: CatalogState): string {
  if (state.query.trim()) return `Results for “${state.query.trim()}”`;
  return state.mode === "species" ? "Collection taxa" : "Physical specimens";
}

function resultContext(
  state: CatalogState,
  selectedScopeNode: TaxonomyNode | null,
): string {
  const parts: string[] = [];
  if (selectedScopeNode) parts.push(`${selectedScopeNode.name} scope`);
  if (
    state.sort === "browse" &&
    state.mode === "species" &&
    !state.query.trim()
  ) {
    parts.push("Grouped by family");
  } else if (state.query.trim()) {
    parts.push("Ranked across all results");
  } else {
    parts.push(`Sorted across all results by ${humanizeToken(state.sort)}`);
  }
  return parts.join(" · ");
}
