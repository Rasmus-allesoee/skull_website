"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import type { CatalogModel } from "@/domain/catalog/queries";
import type { MapProjectionArtifact } from "@/domain/map/types";
import {
  catalogSearchArtifactVersion,
  catalogSearchPublicPath,
  type CatalogSearchArtifact,
  type CatalogSearchDocument,
} from "@/domain/search/documents";
import { CatalogSearchBox } from "@/features/catalog/CatalogSearchBox";
import {
  CatalogFilters,
  type CatalogFilterOption,
  type CatalogFilterOptions,
} from "@/features/catalog/CatalogFilters";
import type { CatalogSearchEngine } from "@/features/catalog/searchEngine";
import type { CatalogSearchTaxonMeta } from "@/features/catalog/searchSuggestions";

import {
  LayersIcon,
  ResetViewIcon,
  ResultsIcon,
  UncertaintyIcon,
} from "./MapControlIcons";
import { MapCanvasLoader } from "./MapCanvasLoader";
import { filterMapRecords } from "./mapFiltering";
import { MapResultList } from "./MapResultList";
import {
  clearMapCollectionState,
  defaultMapState,
  normalizeMapState,
  parseMapState,
  serializeMapState,
  type MapState,
} from "./mapState";
import { mapStyles, type MapStyleKey } from "./provider";

export function MapExplorer({
  catalog,
  projection,
}: {
  catalog: CatalogModel;
  projection: MapProjectionArtifact;
}) {
  const [state, setState] = useState(defaultMapState);
  const [searchDocuments, setSearchDocuments] = useState<
    CatalogSearchDocument[] | null
  >(null);
  const [availableSearchDocuments, setAvailableSearchDocuments] = useState<
    CatalogSearchDocument[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const [desktopResultsOpen, setDesktopResultsOpen] = useState(true);
  const [isNarrowViewport, setIsNarrowViewport] = useState<boolean | null>(
    null,
  );
  const [resetToken, setResetToken] = useState(0);
  const [status, setStatus] = useState("Map and specimen list are ready.");
  const searchEngineRef = useRef<Promise<CatalogSearchEngine> | null>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTaxonMeta = useMemo<CatalogSearchTaxonMeta[]>(
    () =>
      catalog.taxa.map(({ taxon, defaultSpecimen }) => ({
        taxonId: taxon.taxonId,
        slug: taxon.slug,
        defaultSpecimenId: defaultSpecimen.specimenId,
      })),
    [catalog.taxa],
  );

  useEffect(() => {
    const initialize = window.setTimeout(
      () => setState(parseMapState(window.location.search)),
      0,
    );
    const restore = () => setState(parseMapState(window.location.search));
    window.addEventListener("popstate", restore);
    return () => {
      window.clearTimeout(initialize);
      window.removeEventListener("popstate", restore);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 64rem)");
    const synchronize = () => setIsNarrowViewport(media.matches);
    synchronize();
    media.addEventListener("change", synchronize);
    return () => media.removeEventListener("change", synchronize);
  }, []);

  const loadSearchEngine = useCallback(async () => {
    searchEngineRef.current ??= (async () => {
      const [response, module] = await Promise.all([
        fetch(catalogSearchPublicPath),
        import("@/features/catalog/searchEngine"),
      ]);
      if (!response.ok)
        throw new Error(`Search index returned ${response.status}.`);
      const artifact = (await response.json()) as CatalogSearchArtifact;
      if (
        artifact.schemaVersion !== catalogSearchArtifactVersion ||
        !Array.isArray(artifact.documents)
      ) {
        throw new Error("Search index version does not match the collection.");
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
          const searchModule = await import("@/features/catalog/searchEngine");
          if (!cancelled) {
            setAvailableSearchDocuments(engine.documents);
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
    (next: MapState, history: "push" | "replace" = "push") => {
      const normalized = normalizeMapState(next);
      setState(normalized);
      const url = new URL(window.location.href);
      url.search = serializeMapState(normalized);
      window.history[history === "push" ? "pushState" : "replaceState"](
        null,
        "",
        url,
      );
    },
    [],
  );

  const filtered = useMemo(
    () => filterMapRecords(catalog, projection, state, searchDocuments),
    [catalog, projection, searchDocuments, state],
  );
  const filterOptions = useMemo(() => buildFilterOptions(catalog), [catalog]);
  const selectedRecord = state.selectedSpecimenId
    ? (projection.records.find(
        (record) => record.specimenId === state.selectedSpecimenId,
      ) ?? null)
    : null;
  const selectionMessage = state.selectedSpecimenId
    ? selectedRecord
      ? selectedRecord.coordinatePrecision === "unknown"
        ? `${selectedRecord.specimenId} has no public coordinates to plot.`
        : null
      : `${state.selectedSpecimenId} is not an available published specimen.`
    : null;

  useEffect(() => {
    if (
      state.selectedSpecimenId &&
      selectedRecord &&
      !filtered.records.some(
        (record) => record.specimenId === state.selectedSpecimenId,
      )
    ) {
      const timeout = window.setTimeout(() => {
        setStatus(
          `${state.selectedSpecimenId} no longer matches the active search or filters.`,
        );
        commitState({ ...state, selectedSpecimenId: null }, "replace");
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [commitState, filtered.records, selectedRecord, state]);

  const selectSpecimen = useCallback(
    (specimenId: string) => {
      const record = projection.records.find(
        (candidate) => candidate.specimenId === specimenId,
      );
      commitState({ ...state, selectedSpecimenId: specimenId });
      setStatus(
        record
          ? `${record.commonName}, ${specimenId}, selected.`
          : `${specimenId} is not available.`,
      );
    },
    [commitState, projection.records, state],
  );

  const activeCollectionState =
    state.query.trim() ||
    state.classSlug ||
    state.scope ||
    state.sex.length ||
    state.age.length ||
    state.condition.length ||
    state.preparation.length ||
    state.lengthMin !== null ||
    state.lengthMax !== null ||
    state.massMin !== null ||
    state.massMax !== null;
  const resultsVisible =
    isNarrowViewport === null
      ? undefined
      : isNarrowViewport
        ? mobileResultsOpen
        : desktopResultsOpen;
  const toggleResults = () => {
    if (window.matchMedia("(max-width: 64rem)").matches) {
      setMobileResultsOpen((open) => !open);
    } else {
      setDesktopResultsOpen((open) => !open);
    }
  };
  const closeResults = () => {
    if (window.matchMedia("(max-width: 64rem)").matches) {
      setMobileResultsOpen(false);
    } else {
      setDesktopResultsOpen(false);
    }
  };
  const resultsButtonLabel = resultsVisible === false ? "View" : "Hide";

  return (
    <section className="map-explorer" aria-label="Collection map explorer">
      <div className="map-toolbar" aria-label="Map controls">
        <div className="map-toolbar-heading">
          <div>
            <p className="eyebrow">Geographic collection</p>
            <h1>Explore the collection map</h1>
          </div>
          <p aria-live="polite">
            <strong>{filtered.mapped.length}</strong> mapped ·{" "}
            {filtered.notMapped.length} without public coordinates
          </p>
        </div>
        <div className="map-toolbar-controls">
          <CatalogSearchBox
            query={state.query}
            mode="specimens"
            results={searchDocuments ?? []}
            availableDocuments={availableSearchDocuments}
            taxonMeta={searchTaxonMeta}
            loading={searchLoading}
            error={searchError}
            rankActionLabel="Filter results"
            onQueryChange={(query) =>
              commitState(
                { ...state, query, selectedSpecimenId: null },
                "replace",
              )
            }
            onSelect={(document) => {
              if (document.type === "rank") {
                const rank = document.rank as
                  "class" | "order" | "family" | "genus";
                commitState({
                  ...state,
                  query: "",
                  selectedSpecimenId: null,
                  classSlug: rank === "class" ? document.rankSlug : null,
                  scope:
                    rank === "class" ? null : { rank, slug: document.rankSlug },
                });
              } else if (document.type === "taxon") {
                commitState({
                  ...state,
                  query: document.scientificName || document.label,
                  selectedSpecimenId: null,
                });
              } else {
                commitState({
                  ...state,
                  query: document.specimenId,
                  selectedSpecimenId: document.specimenId,
                });
              }
            }}
          />
          <div className="map-toolbar-actions">
            <label className="map-class-control">
              <span>Class</span>
              <select
                aria-label="Filter map by class"
                value={state.classSlug ?? ""}
                onChange={(event) =>
                  commitState({
                    ...state,
                    classSlug: event.target.value || null,
                    scope: null,
                    selectedSpecimenId: null,
                  })
                }
              >
                <option value="">All classes</option>
                {catalog.classEntries.map((entry) => (
                  <option key={entry.node.slug} value={entry.node.slug}>
                    {entry.node.name}
                  </option>
                ))}
              </select>
            </label>
            <CatalogFilters
              state={state}
              options={filterOptions}
              triggerRef={filterTriggerRef}
              context="map"
              onApply={(next) =>
                commitState({ ...state, ...next, selectedSpecimenId: null })
              }
            />
            <label
              className="map-style-control catalog-icon-button"
              data-tooltip="Choose base map"
              title="Choose base map"
            >
              <LayersIcon />
              <span>Base map</span>
              <select
                aria-label="Base map style"
                value={state.style}
                onChange={(event) =>
                  commitState({
                    ...state,
                    style: event.target.value as MapStyleKey,
                  })
                }
              >
                {mapStyles.map((style) => (
                  <option key={style.key} value={style.key}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="catalog-icon-button map-icon-control"
              aria-label="Show uncertainty areas"
              aria-pressed={state.showUncertainty}
              data-tooltip="Show uncertainty areas"
              title="Show uncertainty areas"
              onClick={() =>
                commitState({
                  ...state,
                  showUncertainty: !state.showUncertainty,
                })
              }
            >
              <UncertaintyIcon />
            </button>
            <button
              type="button"
              className="catalog-icon-button map-icon-control"
              aria-label="Reset map view"
              data-tooltip="Fit current mapped results"
              title="Fit current mapped results"
              onClick={() => setResetToken((value) => value + 1)}
            >
              <ResetViewIcon />
            </button>
            <button
              type="button"
              className="catalog-icon-button map-icon-control map-results-trigger"
              aria-label={`${resultsButtonLabel} ${filtered.records.length} specimen records`}
              aria-expanded={resultsVisible}
              aria-controls="map-results"
              data-tooltip={`${resultsButtonLabel} specimen records`}
              title={`${resultsButtonLabel} specimen records`}
              onClick={toggleResults}
            >
              <ResultsIcon />
              <b>{filtered.records.length}</b>
            </button>
          </div>
        </div>
        <div className="map-active-state">
          <div className="map-active-state-scroll">
            <span>
              {activeCollectionState
                ? "Filtered collection"
                : "All published specimens"}
            </span>
            {state.scope ? (
              <span>
                {state.scope.rank}: {state.scope.slug.replaceAll("-", " ")}
              </span>
            ) : null}
            {selectionMessage ? <strong>{selectionMessage}</strong> : null}
            {activeCollectionState ? (
              <button
                type="button"
                onClick={() => commitState(clearMapCollectionState(state))}
              >
                Clear search and filters
              </button>
            ) : null}
          </div>
          <details className="map-key">
            <summary>Map key</summary>
            <div>
              <span>
                <Image
                  className="map-key-marker"
                  src="/media/map/mammal-marker.webp"
                  alt=""
                  width="24"
                  height="24"
                />
                Mammal
              </span>
              <span>
                <Image
                  className="map-key-marker map-key-marker-bird"
                  src="/media/map/bird-marker.webp"
                  alt=""
                  width="24"
                  height="24"
                />
                Bird
              </span>
              <span>
                <MapKeyLocationMarker /> Approximate location
              </span>
              <span>
                <b className="map-key-area" /> Uncertainty area
              </span>
              <span>
                <b className="map-key-cluster">3</b> Cluster count
              </span>
            </div>
          </details>
        </div>
      </div>

      <div
        className={`map-workspace ${desktopResultsOpen ? "" : "is-results-hidden"}`}
      >
        <div
          className="map-region"
          role="region"
          aria-label="Interactive specimen map"
        >
          <MapCanvasLoader
            records={filtered.records}
            selectedSpecimenId={state.selectedSpecimenId}
            styleKey={state.style}
            showUncertainty={state.showUncertainty}
            resetToken={resetToken}
            fitOnPopupClose={Boolean(activeCollectionState)}
            onSelect={selectSpecimen}
            onClearSelection={() =>
              commitState({ ...state, selectedSpecimenId: null })
            }
            onStatus={setStatus}
          />
          <noscript>
            <div className="map-no-script-note">
              The interactive map requires JavaScript. The complete published
              specimen list and exact record links remain available.
            </div>
          </noscript>
        </div>
        <button
          type="button"
          className={`map-results-scrim ${mobileResultsOpen ? "is-open" : ""}`}
          aria-label="Close specimen records"
          onClick={() => setMobileResultsOpen(false)}
        />
        <MapResultList
          mapped={filtered.mapped}
          notMapped={filtered.notMapped}
          selectedSpecimenId={state.selectedSpecimenId}
          onSelect={selectSpecimen}
          onClose={closeResults}
          mobileOpen={mobileResultsOpen}
          desktopOpen={desktopResultsOpen}
        />
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}

function MapKeyLocationMarker() {
  return <span className="map-key-location-marker" aria-hidden="true" />;
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
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((first, second) => first.value.localeCompare(second.value, "en"));
}
