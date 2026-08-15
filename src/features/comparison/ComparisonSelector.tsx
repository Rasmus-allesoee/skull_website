"use client";

import { type KeyboardEvent, useId, useMemo, useRef, useState } from "react";

import { comparisonSearchText } from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";

export function ComparisonSelector({
  options,
  selectedId,
  onSelect,
}: {
  options: SkullComparisonRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const titleId = useId();
  const listboxId = useId();
  const optionPrefix = useId();
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en");
    return normalizedQuery.length === 0
      ? options
      : options.filter((option) =>
          comparisonSearchText(option).includes(normalizedQuery),
        );
  }, [options, query]);

  function openDialog() {
    setQuery("");
    setActiveIndex(0);
    dialogRef.current?.showModal();
    queueMicrotask(() => inputRef.current?.focus());
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function choose(record: SkullComparisonRecord) {
    onSelect(record.id);
    closeDialog();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filteredOptions.length > 0) {
        setActiveIndex((index) => (index + 1) % filteredOptions.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filteredOptions.length > 0) {
        setActiveIndex(
          (index) =>
            (index - 1 + filteredOptions.length) % filteredOptions.length,
        );
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selection = filteredOptions[activeIndex];
      if (selection) choose(selection);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeDialog();
    }
  }

  const activeOption = filteredOptions[activeIndex];
  return (
    <>
      <button
        ref={triggerRef}
        className="comparison-trigger"
        type="button"
        aria-haspopup="dialog"
        onClick={openDialog}
      >
        Compare
      </button>
      <dialog
        ref={dialogRef}
        className="comparison-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className="comparison-dialog-frame">
          <header>
            <div>
              <p className="data-label">True-to-scale reference</p>
              <h2 id={titleId}>Compare with…</h2>
            </div>
            <button type="button" onClick={closeDialog}>
              Close <span aria-hidden="true">×</span>
            </button>
          </header>
          <div className="comparison-search">
            <label htmlFor={`${listboxId}-search`}>Search skulls</label>
            <input
              ref={inputRef}
              id={`${listboxId}-search`}
              role="combobox"
              type="search"
              value={query}
              placeholder="Common name, scientific name, or specimen ID"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded="true"
              aria-activedescendant={
                activeOption
                  ? `${optionPrefix}-${activeOption.id.replace(":", "-")}`
                  : undefined
              }
              onChange={(event) => {
                setQuery(event.currentTarget.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
            />
          </div>
          <div
            className="comparison-options"
            id={listboxId}
            role="listbox"
            aria-label="Eligible comparison skulls"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.id}
                  id={`${optionPrefix}-${option.id.replace(":", "-")}`}
                  type="button"
                  role="option"
                  className={index === activeIndex ? "is-active" : undefined}
                  aria-selected={option.id === selectedId}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  <span>
                    <strong>
                      {option.label}
                      {option.isDefault ? " — default" : ""}
                    </strong>
                    {option.scientificName ? (
                      <i>{option.scientificName}</i>
                    ) : (
                      <small>Approximate adult reference</small>
                    )}
                  </span>
                  {option.specimenId ? <b>{option.specimenId}</b> : null}
                </button>
              ))
            ) : (
              <p role="status">No calibrated skulls match this search.</p>
            )}
          </div>
          <p className="comparison-eligibility-note">
            Only published default specimens with a lateral image and maximum
            skull length are eligible.
          </p>
        </div>
      </dialog>
    </>
  );
}
