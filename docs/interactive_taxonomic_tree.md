# Interactive taxonomic tree implementation guide

**Status:** Phase 3.1 foundation implemented; comprehensive experience deferred to dedicated Phase 3.2

**Product input:** `agent_context/interactive_taxonomic_tree_plan.md` and the owner's local tree sketch

## 1. Outcome and boundary

The comprehensive systematic-browsing experience will visualize the same canonical published taxonomy used by rank pages, cards, search, and breadcrumbs. It is not a separate phylogeny database and must never invent clades, group characteristics, or divergence estimates.

Phase 3.1 implements the bounded foundation:

- a server-rendered class → order → family tree on Home and `/species`;
- representative lateral imagery and live taxon/specimen counts from canonical records;
- stable links to existing rank landings;
- a visually separate but data-equivalent ordinary taxonomy list; and
- full usefulness without client JavaScript.

Phase 3.2 owns the comprehensive interactive tree. Search/facets remain Phase 4 and must not be smuggled into this feature.

## 2. Canonical model

`src/domain/catalog/queries.ts` remains the only tree view-model boundary. Tree nodes are projections of compiled published `TaxonRecord` and `SpecimenRecord` data. The visual and list representations must receive the same node identity, rank, parent, counts, representative image, and stable route.

Allowed public hierarchy for the current source contract:

```text
Class
└── Order
    └── Family
        └── Genus
            └── Taxon identification
```

The future visualization may introduce reviewed intermediate/clade nodes only after a versioned source contract and explicit evidence review. A display branch cannot imply that the current Linnaean rank sequence is a time-calibrated evolutionary tree.

## 3. Phase 3.2 feature plan

### Tree and list equivalence

- Render the comprehensive tree and ordinary nested list from one serialized view model.
- Keep every published terminal taxon reachable through a normal link.
- Omit drafts and blocked migration candidates from both views.
- Preserve exact rank and taxon URLs; expansion state must never become identity.
- If the visual tree cannot load, the server-rendered list remains complete.

### Interaction

- Provide explicit expand/collapse controls with `aria-expanded` and stable controlled-region IDs.
- Support keyboard traversal without requiring drag gestures. Arrow-key behavior, tab order, Home/End behavior, and focus after collapse must be specified and browser-tested.
- On large trees, allow restrained pan/zoom with visible reset controls, but keep browser page zoom and touch scrolling available. Do not make panning the only navigation method.
- Serialize meaningful focused/expanded state only if it produces useful shareable URLs; avoid opaque state blobs.
- Under reduced motion, remove animated branch travel and use immediate state changes.

### Group previews

- Selecting a reviewed group may open a compact preview containing its representative images and canonical counts.
- A carousel is permitted only with direct item controls, keyboard state, touch handling, and a static list equivalent.
- Preview content links to the group's landing page or exact taxon/specimen route; it does not replace those pages.
- Representative-image selection must be deterministic and sourced from a published default specimen.

### Reviewed biological context

- Identification characteristics require curated prose and claim-level citations appropriate to that group.
- Evolutionary divergence estimates require reviewed sources, explicit uncertainty/ranges, and a documented choice of divergence definition.
- No characteristic may be inferred from a common name, one specimen image, or the GBIF classification response.
- If reviewed content is absent, show no placeholder claim; taxonomy and collection counts remain useful on their own.

## 4. Suggested technical shape

- Keep static hierarchy and route links in a React Server Component.
- Add one focused client island only for branch state, keyboard navigation, pan/zoom, and preview controls.
- Pass serialized view models into the island; never import filesystem, CSV, or compiler modules into the client.
- Use semantic nested lists as the DOM baseline. Add SVG branch geometry as a presentational layer, not as the only accessible content.
- Prefer CSS/SVG authored in the repository over rasterized text or labels.
- Measure bundle cost separately from Phase 4 search and load the comprehensive tree code only where used.

## 5. Required inputs before implementation

The owner must approve or supply:

1. whether Phase 3.2 is scheduled before or after Phase 4;
2. whether the first comprehensive version follows only the canonical class/order/family/genus/taxon ranks or also introduces reviewed clade nodes;
3. source-backed group characteristics, or approval to omit them from the first release;
4. reviewed divergence sources/wording, or approval to omit divergence estimates;
5. preferred preview behavior after a functional low-fidelity prototype; and
6. any representative-image overrides that should differ from the deterministic default.

## 6. Acceptance gate

- Visual tree and ordinary list expose identical published node/route sets.
- Keyboard-only and touch users can expand, navigate, reset, and open records without traps.
- No draft/blocked record or unsupported biological claim appears.
- Direct rank/taxon links work with JavaScript disabled.
- Desktop, 200% zoom, 390 px portrait, mobile landscape, reduced motion, and forced-colors checks pass without horizontal page overflow.
- Axe reports no detectable violations, and manual screen-reader landmark/state review is recorded.
- Any sourced characteristics/divergence content passes citation review independently of interface completion.
