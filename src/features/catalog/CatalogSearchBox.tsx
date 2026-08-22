"use client";

import { useId, useMemo, useState } from "react";

import { SubjectImage } from "@/components/SubjectImage";
import type {
  CatalogSearchDocument,
  CatalogSearchDocumentType,
} from "@/domain/search/documents";

export function CatalogSearchBox({
  query,
  results,
  loading,
  error,
  onQueryChange,
  onSelect,
}: {
  query: string;
  results: CatalogSearchDocument[];
  loading: boolean;
  error: string | null;
  onQueryChange: (query: string) => void;
  onSelect: (document: CatalogSearchDocument) => void;
}) {
  const inputId = useId();
  const listboxId = useId();
  const statusId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = results.slice(0, 10);
  const grouped = useMemo(() => {
    const typeOrder = [
      ...new Set(suggestions.map((document) => document.type)),
    ];
    return typeOrder
      .map((type) => ({
        type,
        documents: suggestions.filter((document) => document.type === type),
      }))
      .filter((group) => group.documents.length > 0);
  }, [suggestions]);
  const orderedSuggestions = grouped.flatMap((group) => group.documents);

  const activeDocument = orderedSuggestions[activeIndex] ?? null;

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
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          onChange={(event) => {
            setActiveIndex(-1);
            setOpen(Boolean(event.target.value.trim()));
            onQueryChange(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                Math.min(current + 1, orderedSuggestions.length - 1),
              );
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => Math.max(current - 1, 0));
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
          onBlur={() => window.setTimeout(() => setOpen(false), 100)}
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
              ? `${results.length} search suggestions available.`
              : "Enter a scientific, English, Danish, taxonomic, or specimen name."}
      </p>
      {open && query.trim() ? (
        <div className="catalog-suggestions-surface">
          {loading ? (
            <p>Preparing collection search…</p>
          ) : error ? (
            <p>{error}</p>
          ) : suggestions.length === 0 ? (
            <p>No indexed names or specimen IDs match this query.</p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Search suggestions">
              {grouped.map((group) => (
                <li
                  key={group.type}
                  role="group"
                  aria-label={groupLabel(group.type)}
                >
                  <p>{groupLabel(group.type)}</p>
                  <ul>
                    {group.documents.map((document) => {
                      const index = orderedSuggestions.findIndex(
                        (candidate) => candidate.id === document.id,
                      );
                      return (
                        <li
                          id={suggestionId(listboxId, document.id)}
                          key={document.id}
                          role="option"
                          aria-selected={index === activeIndex}
                          className={index === activeIndex ? "is-active" : ""}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setOpen(false);
                            onSelect(document);
                          }}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <SuggestionCopy document={document} />
                          <div
                            className="catalog-suggestion-image"
                            aria-hidden="true"
                          >
                            {document.image ? (
                              <SubjectImage
                                asset={document.image}
                                sizes="6rem"
                              />
                            ) : (
                              <span>No image</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SuggestionCopy({ document }: { document: CatalogSearchDocument }) {
  const state =
    document.type === "rank"
      ? `${document.rank} · Filter catalog`
      : document.type === "specimen"
        ? `${document.specimenId} · Physical specimen`
        : "Taxon display";
  return (
    <span className="catalog-suggestion-copy">
      <strong>{document.label}</strong>
      {document.scientificName ? <em>{document.scientificName}</em> : null}
      {document.danishName ? <small>({document.danishName})</small> : null}
      <b>{state}</b>
    </span>
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
