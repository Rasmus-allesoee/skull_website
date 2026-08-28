"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from "react";

import { SubjectImage } from "@/components/SubjectImage";
import type {
  CatalogSearchDocument,
  CatalogSearchDocumentType,
} from "@/domain/search/documents";

import type { CatalogMode } from "./catalogState";
import {
  buildCatalogSuggestionModel,
  flattenCatalogSuggestionEntries,
  type CatalogSearchTaxonMeta,
  type CatalogSuggestionEntry,
  type CatalogSuggestionModel,
  type TaxonSuggestion,
} from "./searchSuggestions";

export function CatalogSearchBox({
  query,
  mode,
  results,
  availableDocuments,
  taxonMeta,
  loading,
  error,
  rankActionLabel = "Filter catalog",
  onQueryChange,
  onSelect,
}: {
  query: string;
  mode: CatalogMode;
  results: CatalogSearchDocument[];
  availableDocuments: CatalogSearchDocument[];
  taxonMeta: CatalogSearchTaxonMeta[];
  loading: boolean;
  error: string | null;
  rankActionLabel?: string;
  onQueryChange: (query: string) => void;
  onSelect: (document: CatalogSearchDocument) => void;
}) {
  const inputId = useId();
  const listboxId = useId();
  const statusId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expandedTaxonIds, setExpandedTaxonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const suggestionsSurfaceRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const suggestionModel = useMemo<CatalogSuggestionModel>(
    () =>
      buildCatalogSuggestionModel({
        results,
        availableDocuments,
        taxonMeta,
        query,
      }),
    [availableDocuments, query, results, taxonMeta],
  );
  const effectiveExpandedTaxonIds = useMemo(() => {
    const expanded = new Set(expandedTaxonIds);
    suggestionModel.autoExpandedTaxonIds.forEach((taxonId) =>
      expanded.add(taxonId),
    );
    return expanded;
  }, [expandedTaxonIds, suggestionModel.autoExpandedTaxonIds]);
  const suggestionEntries = useMemo(
    () =>
      flattenCatalogSuggestionEntries(
        suggestionModel,
        mode,
        effectiveExpandedTaxonIds,
      ),
    [effectiveExpandedTaxonIds, mode, suggestionModel],
  );
  const activeEntry = suggestionEntries[activeIndex] ?? null;
  const activeDocument = activeEntry?.document ?? null;

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const surface = suggestionsSurfaceRef.current;
    if (!surface || !open || !query.trim()) return;

    const updateAvailableHeight = () => {
      const surfaceTop = surface.getBoundingClientRect().top;
      const availableHeight = Math.max(0, window.innerHeight - surfaceTop - 16);
      surface.style.setProperty(
        "--catalog-suggestions-available-height",
        `${availableHeight}px`,
      );
    };

    updateAvailableHeight();
    const resizeObserver = new ResizeObserver(updateAvailableHeight);
    resizeObserver.observe(surface.parentElement ?? surface);
    window.addEventListener("resize", updateAvailableHeight);
    window.addEventListener("scroll", updateAvailableHeight, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateAvailableHeight);
      window.removeEventListener("scroll", updateAvailableHeight, true);
    };
  }, [open, query, loading, error, results.length]);

  const handleSuggestionsWheel = (event: WheelEvent<HTMLDivElement>) => {
    const surface = event.currentTarget;
    const atTop = surface.scrollTop <= 0;
    const atBottom =
      surface.scrollTop + surface.clientHeight >= surface.scrollHeight - 1;
    const scrollingBeyondSurface =
      (event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom);

    if (scrollingBeyondSurface) {
      event.preventDefault();
      window.scrollBy({ top: event.deltaY, behavior: "instant" });
    }
  };

  return (
    <div className="catalog-search-box">
      <label htmlFor={inputId}>Search names, taxonomy, or specimen ID</label>
      <div className="catalog-search-input-wrap">
        <span aria-hidden="true">⌕</span>
        <input
          id={inputId}
          type="search"
          value={query}
          role="combobox"
          autoComplete="off"
          spellCheck="false"
          placeholder="Raccoon dog, Nyctereutes, Mårhund, SPEC-0013…"
          aria-expanded={open && query.trim().length > 0}
          aria-controls={listboxId}
          aria-activedescendant={
            activeDocument
              ? suggestionId(listboxId, activeDocument.id)
              : undefined
          }
          aria-describedby={statusId}
          onMouseDown={() => {
            if (blurTimeoutRef.current !== null) {
              window.clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = null;
            }
            if (query.trim()) setOpen(true);
          }}
          onFocus={() => {
            if (blurTimeoutRef.current !== null) {
              window.clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = null;
            }
            if (query.trim()) setOpen(true);
          }}
          onChange={(event) => {
            if (blurTimeoutRef.current !== null) {
              window.clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = null;
            }
            setActiveIndex(-1);
            setExpandedTaxonIds(new Set());
            setOpen(Boolean(event.target.value.trim()));
            onQueryChange(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => {
                const safeCurrent =
                  current >= 0 && current < suggestionEntries.length
                    ? current
                    : -1;
                if (
                  safeCurrent === -1 &&
                  suggestionModel.autoExpandedTaxonIds.length
                ) {
                  const exactIndex = suggestionEntries.findIndex(
                    (entry) =>
                      entry.kind === "specimen" &&
                      entry.document.specimenId ===
                        suggestionModel.taxa.find(
                          (suggestion) => suggestion.exactSpecimenId !== null,
                        )?.exactSpecimenId,
                  );
                  if (exactIndex >= 0) return exactIndex;
                }
                return Math.min(safeCurrent + 1, suggestionEntries.length - 1);
              });
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => {
                const safeCurrent =
                  current >= 0 && current < suggestionEntries.length
                    ? current
                    : 0;
                return Math.max(safeCurrent - 1, 0);
              });
            }
            if (
              event.key === "ArrowRight" &&
              activeEntry?.kind === "taxon" &&
              activeEntry.taxonId &&
              canExpandTaxon(suggestionModel, activeEntry.taxonId)
            ) {
              event.preventDefault();
              setExpandedTaxonIds((current) =>
                new Set(current).add(activeEntry.taxonId!),
              );
            }
            if (
              event.key === "ArrowLeft" &&
              activeEntry?.kind === "specimen" &&
              activeEntry.taxonId
            ) {
              event.preventDefault();
              setExpandedTaxonIds((current) => {
                const next = new Set(current);
                next.delete(activeEntry.taxonId!);
                return next;
              });
            }
            if (event.key === "Enter" && activeDocument) {
              event.preventDefault();
              setOpen(false);
              onSelect(activeDocument);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;
            if (
              nextTarget &&
              suggestionsSurfaceRef.current?.contains(nextTarget)
            ) {
              return;
            }
            if (blurTimeoutRef.current !== null) {
              window.clearTimeout(blurTimeoutRef.current);
            }
            blurTimeoutRef.current = window.setTimeout(() => {
              blurTimeoutRef.current = null;
              setOpen(false);
            }, 100);
          }}
        />
        {query ? (
          <button
            type="button"
            className="catalog-search-clear"
            onClick={() => onQueryChange("")}
          >
            Clear
          </button>
        ) : null}
      </div>
      <p id={statusId} className="visually-hidden" role="status">
        {error
          ? error
          : loading
            ? "Preparing collection search."
            : query.trim()
              ? `${suggestionEntries.length} search suggestions available.`
              : "Enter a scientific, English, Danish, taxonomic, or specimen name."}
      </p>
      {open && query.trim() ? (
        <div
          ref={suggestionsSurfaceRef}
          className="catalog-suggestions-surface"
          onWheel={handleSuggestionsWheel}
        >
          {loading ? (
            <p>Preparing collection search…</p>
          ) : error ? (
            <p>{error}</p>
          ) : suggestionEntries.length === 0 ? (
            <p>No indexed names or specimen IDs match this query.</p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Search suggestions">
              {suggestionModel.ranks.length > 0 ? (
                <SuggestionGroup
                  label={groupLabel("rank")}
                  documents={suggestionModel.ranks}
                  entries={suggestionEntries}
                  activeIndex={activeIndex}
                  listboxId={listboxId}
                  rankActionLabel={rankActionLabel}
                  onSelect={(document) => {
                    setOpen(false);
                    onSelect(document);
                  }}
                  onHover={setActiveIndex}
                />
              ) : null}
              {mode === "species" && suggestionModel.taxa.length > 0 ? (
                <li role="group" aria-label={groupLabel("taxon")}>
                  <p>{groupLabel("taxon")}</p>
                  <ul>
                    {suggestionModel.taxa.map((suggestion) => (
                      <TaxonSuggestionItem
                        key={suggestion.taxonId}
                        suggestion={suggestion}
                        entries={suggestionEntries}
                        activeIndex={activeIndex}
                        expanded={effectiveExpandedTaxonIds.has(
                          suggestion.taxonId,
                        )}
                        listboxId={listboxId}
                        onSelect={(document) => {
                          setOpen(false);
                          onSelect(document);
                        }}
                        onHover={setActiveIndex}
                        onToggle={() => {
                          setActiveIndex(
                            suggestionEntries.findIndex(
                              (entry) => entry.key === suggestion.document.id,
                            ),
                          );
                          setExpandedTaxonIds((current) => {
                            const next = new Set(current);
                            if (next.has(suggestion.taxonId)) {
                              next.delete(suggestion.taxonId);
                            } else {
                              next.add(suggestion.taxonId);
                            }
                            return next;
                          });
                        }}
                      />
                    ))}
                  </ul>
                </li>
              ) : null}
              {mode === "specimens" && suggestionModel.specimens.length > 0 ? (
                <SuggestionGroup
                  label={groupLabel("specimen")}
                  documents={suggestionModel.specimens}
                  entries={suggestionEntries}
                  activeIndex={activeIndex}
                  listboxId={listboxId}
                  onSelect={(document) => {
                    setOpen(false);
                    onSelect(document);
                  }}
                  onHover={setActiveIndex}
                />
              ) : null}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SuggestionGroup({
  label,
  documents,
  entries,
  activeIndex,
  listboxId,
  rankActionLabel,
  onSelect,
  onHover,
}: {
  label: string;
  documents: CatalogSearchDocument[];
  entries: CatalogSuggestionEntry[];
  activeIndex: number;
  listboxId: string;
  rankActionLabel?: string;
  onSelect: (document: CatalogSearchDocument) => void;
  onHover: (index: number) => void;
}) {
  return (
    <li role="group" aria-label={label}>
      <p>{label}</p>
      <ul>
        {documents.map((document) => (
          <SuggestionOption
            key={document.id}
            document={document}
            kind={document.type}
            entries={entries}
            activeIndex={activeIndex}
            listboxId={listboxId}
            rankActionLabel={rankActionLabel}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </ul>
    </li>
  );
}

function TaxonSuggestionItem({
  suggestion,
  entries,
  activeIndex,
  expanded,
  listboxId,
  onSelect,
  onHover,
  onToggle,
}: {
  suggestion: TaxonSuggestion;
  entries: CatalogSuggestionEntry[];
  activeIndex: number;
  expanded: boolean;
  listboxId: string;
  onSelect: (document: CatalogSearchDocument) => void;
  onHover: (index: number) => void;
  onToggle: () => void;
}) {
  const hasOtherSpecimens = suggestion.otherSpecimens.length > 0;
  const childListId = `${suggestionId(listboxId, suggestion.document.id)}-specimens`;
  return (
    <li className="catalog-suggestion-taxon">
      <div className="catalog-suggestion-row">
        <SuggestionOption
          document={suggestion.document}
          kind="taxon"
          defaultSpecimenId={suggestion.defaultSpecimenId}
          entries={entries}
          activeIndex={activeIndex}
          listboxId={listboxId}
          onSelect={onSelect}
          onHover={onHover}
        />
        {hasOtherSpecimens ? (
          <button
            type="button"
            className="catalog-suggestion-expand"
            aria-expanded={expanded}
            aria-controls={childListId}
            aria-label={`${expanded ? "Hide" : "Show"} ${suggestion.otherSpecimens.length} other specimens for ${suggestion.document.label}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onToggle}
          >
            {expanded ? "Hide" : `${suggestion.otherSpecimens.length} more`}
          </button>
        ) : null}
      </div>
      {expanded && hasOtherSpecimens ? (
        <ul
          id={childListId}
          className="catalog-suggestion-specimen-list"
          aria-label={`Other specimens of ${suggestion.document.label}`}
        >
          {suggestion.otherSpecimens.map((document) => (
            <SuggestionOption
              key={document.id}
              document={document}
              kind="specimen"
              entries={entries}
              activeIndex={activeIndex}
              listboxId={listboxId}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function SuggestionOption({
  document,
  kind,
  defaultSpecimenId,
  entries,
  activeIndex,
  listboxId,
  rankActionLabel,
  onSelect,
  onHover,
}: {
  document: CatalogSearchDocument;
  kind: CatalogSuggestionEntry["kind"];
  defaultSpecimenId?: string;
  entries: CatalogSuggestionEntry[];
  activeIndex: number;
  listboxId: string;
  rankActionLabel?: string;
  onSelect: (document: CatalogSearchDocument) => void;
  onHover: (index: number) => void;
}) {
  const entryIndex = entries.findIndex((entry) => {
    if (kind === "specimen" && entry.document.id === document.id) {
      return entry.kind === "specimen";
    }
    return entry.document.id === document.id && entry.kind === kind;
  });
  const isActive = entryIndex === activeIndex;
  return (
    <li
      id={suggestionId(listboxId, document.id)}
      role="option"
      aria-selected={isActive}
      className={isActive ? "is-active" : ""}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(document)}
      onMouseEnter={() => onHover(entryIndex)}
    >
      <SuggestionCopy
        document={document}
        kind={kind}
        defaultSpecimenId={defaultSpecimenId}
        rankActionLabel={rankActionLabel}
      />
      <div className="catalog-suggestion-image" aria-hidden="true">
        {document.image ? (
          <SubjectImage asset={document.image} sizes="6rem" />
        ) : (
          <span>No image</span>
        )}
      </div>
    </li>
  );
}

function SuggestionCopy({
  document,
  kind,
  defaultSpecimenId,
  rankActionLabel,
}: {
  document: CatalogSearchDocument;
  kind: CatalogSuggestionEntry["kind"];
  defaultSpecimenId?: string;
  rankActionLabel?: string;
}) {
  const state =
    kind === "rank"
      ? `${document.rank} · ${rankActionLabel ?? "Filter catalog"}`
      : kind === "specimen"
        ? `${document.specimenId} · Physical specimen`
        : defaultSpecimenId
          ? `${defaultSpecimenId} · Default specimen`
          : "Species record";
  return (
    <span className="catalog-suggestion-copy">
      <strong>{document.label}</strong>
      {document.scientificName ? <em>{document.scientificName}</em> : null}
      {document.danishName ? <small>({document.danishName})</small> : null}
      <b>{state}</b>
    </span>
  );
}

function canExpandTaxon(
  model: CatalogSuggestionModel,
  taxonId: string,
): boolean {
  return (
    (model.taxa.find((suggestion) => suggestion.taxonId === taxonId)
      ?.otherSpecimens.length ?? 0) > 0
  );
}

function suggestionId(listboxId: string, documentId: string): string {
  return `${listboxId}-${documentId.replaceAll(":", "-")}`;
}

function groupLabel(type: CatalogSearchDocumentType): string {
  return {
    rank: "Taxonomic ranks",
    taxon: "Taxa",
    specimen: "Physical specimens",
  }[type];
}
