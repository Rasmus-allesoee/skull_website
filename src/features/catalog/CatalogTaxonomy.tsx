"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import Link from "next/link";

import {
  taxonomyHref,
  type CatalogTaxonomyBranch,
  type TaxonomyNode,
} from "@/domain/catalog/queries";

import type { CatalogScope } from "./catalogState";

export function CatalogTaxonomyDrawer({
  branches,
  open,
  selectedScope,
  classSlug,
  openerRef,
  onClose,
  onSelect,
}: {
  branches: CatalogTaxonomyBranch[];
  open: boolean;
  selectedScope: CatalogScope | null;
  classSlug: string | null;
  openerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSelect: (node: TaxonomyNode) => void;
}) {
  const headingId = useId();
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(branches.map((branch) => nodeKey(branch.node))),
  );

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        openerRef.current?.focus();
      }
      if (
        event.key === "Tab" &&
        window.matchMedia("(max-width: 64rem)").matches
      ) {
        keepFocusInside(event, drawerRef.current);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open, openerRef]);

  if (!open) return null;

  return (
    <>
      <button
        className="catalog-taxonomy-scrim"
        type="button"
        aria-label="Close taxonomy drawer"
        onClick={() => {
          onClose();
          openerRef.current?.focus();
        }}
      />
      <aside
        ref={drawerRef}
        className="catalog-taxonomy-drawer"
        aria-labelledby={headingId}
        aria-modal={
          typeof window === "undefined"
            ? undefined
            : window.matchMedia("(max-width: 64rem)").matches
        }
        role="dialog"
      >
        <header>
          <div>
            <p className="card-overline">Systematic browsing</p>
            <h2 id={headingId}>Browse taxonomy</h2>
            <p>Filter the catalog or open a stable taxonomy page.</p>
          </div>
          <div className="catalog-taxonomy-header-actions">
            <button
              type="button"
              className="catalog-taxonomy-reset"
              title="Collapse all taxonomy branches"
              onClick={() => setExpanded(new Set())}
            >
              Reset
            </button>
            <button
              ref={closeRef}
              type="button"
              className="dialog-close"
              onClick={() => {
                onClose();
                openerRef.current?.focus();
              }}
            >
              <span aria-hidden="true">×</span>
              <span className="visually-hidden">Close taxonomy drawer</span>
            </button>
          </div>
        </header>
        <nav aria-label="Published collection taxonomy">
          <ul className="catalog-taxonomy-list">
            {branches.map((branch) => (
              <TaxonomyBranch
                key={nodeKey(branch.node)}
                branch={branch}
                expanded={expanded}
                selectedScope={selectedScope}
                classSlug={classSlug}
                onToggle={(node) => {
                  setExpanded((current) => {
                    const next = new Set(current);
                    const key = nodeKey(node);
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    return next;
                  });
                }}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export function CatalogTaxonomyFallback({
  branches,
}: {
  branches: CatalogTaxonomyBranch[];
}) {
  return (
    <details className="catalog-no-script-taxonomy">
      <summary>Browse the complete taxonomy list</summary>
      <p>
        Interactive filtering needs JavaScript. These stable links reach every
        published rank and taxon without it.
      </p>
      <nav aria-label="Complete no-JavaScript taxonomy">
        <ul>
          {branches.map((branch) => (
            <FallbackBranch key={nodeKey(branch.node)} branch={branch} />
          ))}
        </ul>
      </nav>
    </details>
  );
}

function TaxonomyBranch({
  branch,
  expanded,
  selectedScope,
  classSlug,
  onToggle,
  onSelect,
}: {
  branch: CatalogTaxonomyBranch;
  expanded: Set<string>;
  selectedScope: CatalogScope | null;
  classSlug: string | null;
  onToggle: (node: TaxonomyNode) => void;
  onSelect: (node: TaxonomyNode) => void;
}) {
  const key = nodeKey(branch.node);
  const childId = `taxonomy-children-${key.replace(":", "-")}`;
  const isExpanded = expanded.has(key);
  const hasChildren = branch.children.length > 0 || branch.taxa.length > 0;
  const selected =
    (branch.node.rank === "class" && branch.node.slug === classSlug) ||
    (selectedScope?.rank === branch.node.rank &&
      selectedScope.slug === branch.node.slug);

  return (
    <li>
      <div className="catalog-taxonomy-node">
        {hasChildren ? (
          <button
            type="button"
            className="catalog-taxonomy-expand"
            aria-expanded={isExpanded}
            aria-controls={childId}
            onClick={() => onToggle(branch.node)}
          >
            <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
            <span className="visually-hidden">
              {isExpanded ? "Collapse" : "Expand"} {branch.node.name}
            </span>
          </button>
        ) : (
          <span className="catalog-taxonomy-indent" aria-hidden="true" />
        )}
        <button
          type="button"
          className="catalog-taxonomy-filter"
          aria-pressed={selected}
          onClick={() => onSelect(branch.node)}
        >
          <span>{branch.node.name}</span>
          <small>
            {branch.node.taxonCount}{" "}
            {branch.node.taxonCount === 1 ? "taxon" : "taxa"}
          </small>
        </button>
        <Link
          href={taxonomyHref(branch.node.rank, branch.node.slug)}
          aria-label={`Open ${branch.node.name} ${branch.node.rank} page`}
        >
          Open
        </Link>
      </div>
      {hasChildren ? (
        <ul id={childId} hidden={!isExpanded}>
          {branch.children.map((child) => (
            <TaxonomyBranch
              key={nodeKey(child.node)}
              branch={child}
              expanded={expanded}
              selectedScope={selectedScope}
              classSlug={classSlug}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
          {branch.taxa.map((card) => (
            <li key={card.taxon.taxonId} className="catalog-taxonomy-taxon">
              <Link href={card.href}>
                <span>
                  {card.taxon.names.english ?? card.taxon.scientificName}
                </span>
                <small>{card.taxon.scientificName}</small>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function FallbackBranch({ branch }: { branch: CatalogTaxonomyBranch }) {
  return (
    <li>
      <Link href={taxonomyHref(branch.node.rank, branch.node.slug)}>
        {branch.node.name} ({branch.node.taxonCount})
      </Link>
      {branch.children.length > 0 || branch.taxa.length > 0 ? (
        <ul>
          {branch.children.map((child) => (
            <FallbackBranch key={nodeKey(child.node)} branch={child} />
          ))}
          {branch.taxa.map((card) => (
            <li key={card.taxon.taxonId}>
              <Link href={card.href}>
                {card.taxon.names.english ?? card.taxon.scientificName}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function nodeKey(node: TaxonomyNode): string {
  return `${node.rank}:${node.slug}`;
}

function keepFocusInside(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const focusable = [
    ...container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => !element.hidden);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
