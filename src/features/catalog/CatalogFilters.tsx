"use client";

import { useId, useRef, useState } from "react";

import { humanizeToken } from "@/domain/content/display";

import { FilterControlIcon } from "./CatalogControlIcons";
import type { CatalogState } from "./catalogState";

export interface CatalogFilterOption {
  value: string;
  count: number;
}

export interface CatalogFilterOptions {
  sex: CatalogFilterOption[];
  age: CatalogFilterOption[];
  condition: CatalogFilterOption[];
  preparation: CatalogFilterOption[];
}

export function CatalogFilters({
  state,
  options,
  triggerRef,
  context = "catalog",
  onApply,
}: {
  state: CatalogState;
  options: CatalogFilterOptions;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  context?: "catalog" | "map";
  onApply: (state: CatalogState) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [draft, setDraft] = useState(state);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="catalog-action-button catalog-icon-button"
        aria-label="Filters"
        data-tooltip="Filter physical skulls"
        title="Filter physical skulls"
        onClick={() => {
          setDraft(state);
          dialogRef.current?.showModal();
        }}
      >
        <FilterControlIcon />
        <span className="catalog-control-label">Filters</span>
      </button>
      <dialog
        ref={dialogRef}
        className="catalog-filter-dialog"
        aria-labelledby={titleId}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="catalog-filter-frame">
          <header>
            <div>
              <p className="card-overline">Catalog facets</p>
              <h2 id={titleId}>Filter physical skulls</h2>
              <p>
                {context === "catalog"
                  ? "Species mode keeps a taxon when at least one linked specimen matches. "
                  : "Every map result represents one physical specimen. "}
                Measurement ranges exclude unrecorded and non-applicable values;
                they are never treated as zero.
              </p>
            </div>
            <button
              type="button"
              className="dialog-close"
              onClick={() => dialogRef.current?.close()}
            >
              <span aria-hidden="true">×</span>
              <span className="visually-hidden">Close filters</span>
            </button>
          </header>
          <div className="catalog-filter-content">
            <FilterFieldset
              legend="Sex"
              options={options.sex}
              selected={draft.sex}
              onChange={(sex) => setDraft({ ...draft, sex })}
            />
            <FilterFieldset
              legend="Age class"
              options={options.age}
              selected={draft.age}
              onChange={(age) => setDraft({ ...draft, age })}
            />
            <FilterFieldset
              legend="Condition"
              options={options.condition}
              selected={draft.condition}
              onChange={(condition) => setDraft({ ...draft, condition })}
            />
            <FilterFieldset
              legend="Defleshing method"
              options={options.preparation}
              selected={draft.preparation}
              onChange={(preparation) => setDraft({ ...draft, preparation })}
            />
            <fieldset className="catalog-range-fieldset">
              <legend>Maximum skull length</legend>
              <div>
                <NumberFilter
                  label="Minimum length"
                  unit="mm"
                  value={draft.lengthMin}
                  onChange={(lengthMin) => setDraft({ ...draft, lengthMin })}
                />
                <NumberFilter
                  label="Maximum length"
                  unit="mm"
                  value={draft.lengthMax}
                  onChange={(lengthMax) => setDraft({ ...draft, lengthMax })}
                />
              </div>
            </fieldset>
            <fieldset className="catalog-range-fieldset">
              <legend>Prepared skull mass</legend>
              <div>
                <NumberFilter
                  label="Minimum mass"
                  unit="g"
                  value={draft.massMin}
                  onChange={(massMin) => setDraft({ ...draft, massMin })}
                />
                <NumberFilter
                  label="Maximum mass"
                  unit="g"
                  value={draft.massMax}
                  onChange={(massMax) => setDraft({ ...draft, massMax })}
                />
              </div>
            </fieldset>
          </div>
          <footer>
            <button
              type="button"
              onClick={() => setDraft(clearFeatureFilters(draft))}
            >
              Reset feature filters
            </button>
            <button
              type="button"
              className="catalog-filter-apply"
              onClick={() => {
                onApply(draft);
                dialogRef.current?.close();
              }}
            >
              Apply filters
            </button>
          </footer>
        </div>
      </dialog>
    </>
  );
}

function FilterFieldset({
  legend,
  options,
  selected,
  onChange,
}: {
  legend: string;
  options: CatalogFilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <fieldset className="catalog-checkbox-fieldset">
      <legend>{legend}</legend>
      <div>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={(event) => {
                onChange(
                  event.target.checked
                    ? [...selected, option.value]
                    : selected.filter((value) => value !== option.value),
                );
              }}
            />
            <span>{humanizeToken(option.value)}</span>
            <small>{option.count}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function NumberFilter({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <span className="catalog-number-input">
        <input
          id={id}
          type="number"
          min="0"
          step="0.1"
          inputMode="decimal"
          value={value ?? ""}
          onChange={(event) => {
            const next = event.target.valueAsNumber;
            onChange(Number.isFinite(next) && next >= 0 ? next : null);
          }}
        />
        <b>{unit}</b>
      </span>
    </label>
  );
}

function clearFeatureFilters(state: CatalogState): CatalogState {
  return {
    ...state,
    sex: [],
    age: [],
    condition: [],
    preparation: [],
    lengthMin: null,
    lengthMax: null,
    massMin: null,
    massMax: null,
  };
}
