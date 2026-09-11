"use client";

import Image from "next/image";
import { type KeyboardEvent, useId, useMemo, useRef, useState } from "react";

import { comparisonSearchText } from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";

export function WorkbenchSubjectPicker({
  records,
  selectedIds,
  disabled,
  onSelect,
}: {
  records: SkullComparisonRecord[];
  selectedIds: string[];
  disabled: boolean;
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
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en");
    return normalizedQuery
      ? records.filter((record) =>
          comparisonSearchText(record).includes(normalizedQuery),
        )
      : records;
  }, [query, records]);

  function open() {
    if (disabled) return;
    setQuery("");
    setActiveIndex(0);
    dialogRef.current?.showModal();
    queueMicrotask(() => inputRef.current?.focus());
  }

  function close() {
    dialogRef.current?.close();
  }

  function choose(record: SkullComparisonRecord) {
    if (selected.has(record.id)) return;
    onSelect(record.id);
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length > 0 ? (index + 1) % filtered.length : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length > 0
          ? (index - 1 + filtered.length) % filtered.length
          : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const record = filtered[activeIndex];
      if (record) choose(record);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  const active = filtered[activeIndex];
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="compare-add-skull"
        disabled={disabled}
        aria-haspopup="dialog"
        onClick={open}
      >
        <span aria-hidden="true">＋</span>
        <span>
          <strong>Add skull</strong>
          <small>
            {disabled ? "5-skull limit reached" : "Search collection"}
          </small>
        </span>
      </button>
      <dialog
        ref={dialogRef}
        className="comparison-dialog workbench-subject-dialog"
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className="comparison-dialog-frame">
          <header>
            <div>
              <p className="data-label">Comparison subject</p>
              <h2 id={titleId}>Add a skull</h2>
            </div>
            <button type="button" onClick={close}>
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
              placeholder="Name, taxonomy, or specimen ID"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded="true"
              aria-activedescendant={
                active
                  ? `${optionPrefix}-${active.id.replace(":", "-")}`
                  : undefined
              }
              onChange={(event) => {
                setQuery(event.currentTarget.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div
            className="comparison-options workbench-subject-options"
            id={listboxId}
            role="listbox"
            aria-label="Calibrated skulls"
          >
            {filtered.length > 0 ? (
              filtered.map((record, index) => {
                const isSelected = selected.has(record.id);
                return (
                  <button
                    key={record.id}
                    id={`${optionPrefix}-${record.id.replace(":", "-")}`}
                    type="button"
                    role="option"
                    className={index === activeIndex ? "is-active" : undefined}
                    aria-selected={isSelected}
                    disabled={isSelected}
                    onPointerMove={() => setActiveIndex(index)}
                    onClick={() => choose(record)}
                  >
                    <span className="workbench-subject-option-image">
                      <Image
                        src={record.image.publicPath}
                        alt=""
                        fill
                        sizes="4rem"
                      />
                    </span>
                    <span>
                      <strong>{record.label}</strong>
                      {record.scientificName ? (
                        <i>{record.scientificName}</i>
                      ) : (
                        <small>Reviewed comparison reference</small>
                      )}
                    </span>
                    <b>
                      {isSelected
                        ? "Selected"
                        : (record.specimenId ?? "Reference")}
                    </b>
                  </button>
                );
              })
            ) : (
              <p role="status">No calibrated skulls match this search.</p>
            )}
          </div>
          <p className="comparison-eligibility-note">
            Every listed subject has at least one reviewed, calibrated view.
          </p>
        </div>
      </dialog>
    </>
  );
}
