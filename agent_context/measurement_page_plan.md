# Measurements page — implementation plan

**Status:** Owner-authored product specification; implementation not started

**Primary objective:** Build a public, visual measurement reference that lets a visitor understand all numbered skull measurements by looking at the annotated anatomy, selecting a number, and immediately finding the matching name and landmark/method description.

This document defines the intended product outcome and the important content/media boundaries. You should choose the concrete component structure, state model, SVG-generation method, CSS, test implementation, and any suitable library details. You may replace the suggested implementation approaches when the replacement preserves the requirements and produces a stronger result.

If this document conflicts with `AGENTS.md` or a canonical document in `docs/`, the repository rules and canonical content/rights/accessibility contracts still apply. Resolve material conflicts deliberately rather than silently choosing one.

## 1. Product decision summary

### Canonical destination

Use the already planned `/methodology` route as the public destination for this first methodology/reference page. The visible page title should be **Measurements**, with a concise reference-data eyebrow and a short explanation of what the page contains.

Do not create a competing `/guides/measurements` route for this milestone. The existing specimen-page “Open measurement guide” action should gain a clear link to this full illustrated reference. The `/methodology` route may later grow to include other methodology sections, but this milestone is limited to measurements.

### Interaction model

Use the dialog/detail-surface approach as the primary click behavior:

1. Hovering or keyboard-focusing a numbered annotation gives its measurement name in a compact tooltip.
2. On desktop, clicking or keyboard-activating the number opens an accessible detail surface containing the full matching description from the measurement source. On touch, the first tap shows a compact name-only tooltip/preview; a second deliberate activation of that same number, or an explicit details action in the preview, opens the full detail surface.
3. The selected annotation is highlighted, and every visual occurrence of the same measurement number is highlighted together.
4. The complete measurement table remains available as a stable reference index below the diagram board.

Do not make table filtering the only way to learn a clicked measurement. A dialog/detail surface works when the table is below the fold, is clearer on mobile, and avoids a fragile “click anywhere to reset” interaction. A future table filter can be added without changing the numbering or data model, but it is not required for the first release.

### Visual priority

The diagrams are the main attraction. The page should feel like a functional museum reference board: the skull image remains visually dominant, while the number-to-definition connection is immediate and unambiguous. The table is important, but it should support the diagrams rather than turn the page into a dense spreadsheet.

## 2. Hard requirements

These requirements define the intended result and must not be weakened for implementation convenience.

### 2.1 Source directories and geometry authorities

- In the current checkout, the five annotated positional-reference PNGs are in `agent_context/measurement_page/annotated/`, and the five corresponding raw, unannotated base PNGs are in `agent_context/measurement_page/raw/`. Treat the actual contents and roles of these directories as authoritative for this page.
- Each annotated/raw pair must have exactly identical intrinsic pixel dimensions and matching canvas geometry before overlay coordinates are implemented. Perform and record a dimension/registration preflight for all five pairs; do not merely assume that matching filenames imply a match.
- If a pair fails the exact-dimension or registration check, stop that pair’s overlay work and resolve/document a deterministic transform or source correction before finalizing it. Never guess at anatomical coordinates.
- The annotated PNGs must not be used as the final website images, placed in the production media bundle, or displayed behind a second copy of the annotations.
- The final visual must use the corresponding unannotated skull image as its base and render the dimension annotations programmatically as SVG.
- Every dimension line must preserve the reference image’s endpoints, direction, orientation, extension-line attachment, arrowhead placement, label placement, and measurement number.
- Positional accuracy is more important than making an annotation aesthetically symmetrical or “nicer.” Do not move a landmark endpoint to improve spacing.
- If an annotated reference and its raw source have different pixel dimensions, do not assume that the coordinates are interchangeable. Establish and record a deterministic scale/translation or other appropriate registration transform before rendering the overlay.

### 2.2 Shared coordinate registration

- The base image and overlay must share one intrinsic coordinate system, or a rigorously documented transform between two intrinsic coordinate systems.
- The overlay must remain registered when the diagram is resized, viewed at different aspect ratios, or displayed on a high-density screen.
- The implementation must preserve the source aspect ratio and must not stretch, crop, or independently reposition the skull and overlay.
- A responsive resize must scale the entire diagram composition together. It must never make an annotation label or line drift relative to the skull.
- The implementation should use an intrinsic SVG `viewBox` or an equivalent normalized coordinate system. The exact low-level choice is yours, but viewport-dependent hand-tuned pixel positions are not acceptable.

### 2.3 Independent, addressable measurement groups

- Every numbered visual annotation is its own independent SVG group/element with a stable measurement identity.
- A group contains the relevant dimension line, arrowheads, dashed extension/reference lines, and numeric label.
- The groups must support at least the current hover/focus/selection behavior and remain structurally ready for later show/hide, dynamic color, links, and richer highlighting.
- Repeated appearances of a number in different views are separate visual occurrences linked to one canonical measurement definition. Selecting that number should highlight all of its intentional occurrences.
- The repeated numbering in the supplied references must be preserved exactly; do not renumber per diagram.

### 2.4 Measurement source and table

- Use `agent_context/measurement_page/measurement_descriptions.csv` as the authoritative owner-supplied source for the current table wording.
- The CSV currently contains the header `Number,Measurement,Exact landmarks / method` and 21 numbered data rows.
- The public table must contain, at minimum, these three semantic columns:
  1. measurement number;
  2. measurement name; and
  3. exact landmarks/method description.
- Preserve the source descriptions faithfully. Do not silently shorten, paraphrase, scientifically “correct,” or supplement them with invented claims.
- Sort the table numerically from 1 through 21, not lexicographically.
- The table and visual registry must be validated against one another: every table number must have at least one overlay occurrence, and every overlay number must have exactly one table definition. Intentional repeated visual occurrences are allowed; duplicate CSV definitions are not.
- The staging CSV must not be read directly by the browser or by a normal production build. Promote the reviewed data into the repository’s canonical content/build pipeline, or use another explicitly accepted canonical source, while retaining the supplied CSV as migration/evidence context.

### 2.5 No specimen-schema expansion for this page

- This page documents measurement definitions; it does not add measured values to specimens and does not replace `specimens.csv`.
- Do not create a parallel bird/mammal specimen table or a separate measurement-values source.
- Do not assume that every numbered definition is already a stored field in the current schema. Several definitions in this reference are more detailed or more specialized than the current specimen display fields.
- Where the new definitions overlap existing `measurementDefinitions`, avoid maintaining two silently conflicting public definitions. You should reconcile or clearly separate the general reference wording from the concise specimen-field wording through the canonical content model.

### 2.6 Honest scientific/content scope

- The page must present these as the collection’s measurement definitions/reference method notes unless the supplied sources have been reviewed sufficiently to support stronger protocol language.
- Do not describe the diagrams as a universal osteometric standard or imply that every species can be measured identically when the supplied description does not establish that.
- Do not invent citations, source URLs, landmark claims, species caveats, or measurement values.
- Parenthetical source notes already present in the CSV may be preserved as supplied source context, but they must not be transformed into formal citation records unless the citation is actually available and reviewed.
- If a wording, source, rights, or raw-image decision cannot be resolved from the repository and sound technical judgment, ask the owner rather than publishing an unsupported assumption.

## 3. Design intent and page philosophy

Like the re-designed species catalog and the new map page, the design system should be streamlined and optimize for functionality, efficiency, and features, rather than pure aesthetics that comprises the functionality. The page should share the existing Skull Collection visual language:

- dark natural-history museum atmosphere;
- bone-toned text and transparent skull imagery as the brightest elements;
- Newsreader for the main title and IBM Plex Sans for controls, labels, tables, and numeric content;
- restrained borders, archival rules, compact labels, and brass/gold interaction accents;
- no faux parchment, decorative skeleton motifs, heavy texture, blood-red theme, or game-like interface;
- functionality and clarity before ornamental layout;
- no dependence on color alone for meaning.

The page should be easy to understand for a visitor who knows nothing about osteometry, while still being precise enough that a scientifically literate visitor can inspect the stated landmarks and methods.

The page is a reference surface, not a specimen exhibit. The example skulls are visual measurement references and should not be presented as a species range, as a set of measured values for the visitor, or as a replacement for the specimen pages’ record-specific measurements.

## 4. Source inventory and expected measurement mapping

### 4.1 Supplied source pairs and visual groups

The current references visibly contain these measurement groups:

| Annotated positional reference | Matching raw unannotated base | Visual measurement numbers |
|---|---|---|
| `agent_context/measurement_page/annotated/ms_vulpes_lateral_5.png` | `agent_context/measurement_page/raw/ms_vulpes_lateral_5.png` | 1, 2, 17 |
| `agent_context/measurement_page/annotated/ms_vulpes_dorsal_5.png` | `agent_context/measurement_page/raw/ms_vulpes_dorsal_5.png` | 1, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16 |
| `agent_context/measurement_page/annotated/ms_vulpes_ventral_5.png` | `agent_context/measurement_page/raw/ms_vulpes_ventral_5.png` | 1, 2, 3 |
| `agent_context/measurement_page/annotated/ms_vulpes_mandible_lateral_5.png` | `agent_context/measurement_page/raw/raw_vulpes_mandible_lateral_5.png` | 9, 10, 11, 18, 19 |
| `agent_context/measurement_page/annotated/ms_meles_canines_6.png` | `agent_context/measurement_page/raw/meles_canines_6.png` | 20, 21 |

The current workspace dimension check confirms that each annotated/raw pair has identical intrinsic dimensions: lateral, dorsal, ventral, and canine are each `6000 × 4000`; the mandible pair is `6200 × 4133`. You should rerun this preflight during implementation and still verify canvas framing/registration visually or programmatically. For the pairs that match, the coordinate transform is the identity mapping; no resize or crop transform should be introduced merely because the files have different dimensions from the other views.

The reference images intentionally repeat at least measurements 1 and 2 across views. Those repeats are not errors: they are alternate visual presentations of one canonical measurement and must remain synchronized.

All five raw bases are now supplied in `agent_context/measurement_page/raw/`, paired with the annotated references in `agent_context/measurement_page/annotated/`. Verify every pair’s exact dimensions and coordinate registration before encoding the overlays. When the canvases match, use the shared coordinates directly; never use an annotated reference as a final substitute merely because it already contains the annotations.

### 4.2 Canonical number/name mapping

The CSV remains the source of truth for exact display text. This table records the expected number set and names so that implementation scope is unambiguous; it is not a second description source.

| No. | Measurement name from CSV |
|---:|---|
| 1 | Skull length |
| 2 | Condylobasal length |
| 3 | Maxillary tooth-row length |
| 4 | Upper neurocranium length |
| 5 | Facial length |
| 6 | Viscerocranium length |
| 7 | Snout length |
| 8 | Nasal length |
| 9 | Mandible length |
| 10 | Mandibular tooth-row length |
| 11 | Alveolar length of lower cheek tooth row |
| 12 | Zygomatic width |
| 13 | Cranium width |
| 14 | Postorbital constriction |
| 15 | Interorbital width |
| 16 | Rostrum width |
| 17 | Skull height |
| 18 | Mandible ramus height |
| 19 | Mandible body height |
| 20 | Maxillary canine length |
| 21 | Mandibular canine length |

## 5. Page anatomy and information architecture

The page should use the global museum shell and the following content order.

### 5.1 Shell and introduction

1. Global skip link, header, and footer remain consistent with the rest of the site.
2. Breadcrumb: `Home / Methodology / Measurements` or the equivalent stable route wording.
3. Compact eyebrow: `Reference data` or an equally clear existing design-system label.
4. Main heading: `Measurements`.
5. A short introductory paragraph explaining that the numbered diagrams define the collection’s measurement vocabulary and that selecting a number reveals the corresponding landmarks/method.
6. A compact “How to use” hint/legend near the diagrams:
   - numbers correspond to the table;
   - hover/focus or the first tap reveals the name;
   - click/keyboard activation or a second touch activation opens the detailed definition;
   - the page’s annotation colors are interaction cues, not anatomical data.

Do not put a large hero paragraph or unrelated editorial content above the diagrams. The visitor should reach the first reference image quickly.

### 5.2 Diagram board

The diagram board is the central page component. Each diagram is a labelled figure containing the unannotated base image and its registered SVG overlay.

Preferred wide-desktop arrangement:

- Use a two-column board with a comfortable maximum width.
- Place the wide **lateral skull** figure across both columns first. Its long length and height measurements need enough horizontal space for the arrows and labels to remain easy to read.
- Place **dorsal** and **ventral** figures side by side in the next row. They are related views and benefit from being compared without forcing the visitor through two full viewport-height sections.
- Place the wide **mandible lateral** figure across both columns in the next row. Its long jaw and tooth-row measurements need a wide stage.
- Choose the placement and scale of the **canine-length** figure from the actual source aspect ratio, annotation legibility, and balance of the complete board. It may share a row, span a column, use an inset, or use another arrangement.

These are layout goals and starting considerations, not a fixed desktop grid. At medium widths, choose the arrangement that keeps each figure large enough for its labels and hit targets; collapse to one column when necessary rather than allowing the SVG labels to become unreadable.

On mobile and narrow screens, stack all five figures vertically in the same logical order: lateral, dorsal, ventral, mandible lateral, canine lengths. A long page is acceptable here; the priority is accurate, readable reference material rather than packing every figure into the first viewport.

Each figure should have:

- a concise view title such as `Lateral skull`, `Dorsal skull`, `Ventral skull`, `Mandible — lateral`, or `Canine lengths`;
- a quiet indication of the measurement numbers represented in that view, if it helps orientation;
- a bounded image stage that preserves the source aspect ratio;
- visible annotations by default;
- a text-equivalent relationship to the table and detail surface;
- no visible use of the annotated PNG itself.

The board may use a stronger arrangement if visual QA shows that it improves annotation legibility, but it must preserve the above priorities: wide views must remain wide, narrow views must not be shrunk into illegibility, and no anatomy may be cropped or stretched.

### 5.3 Measurement table

Place the complete measurement table after the diagram board. The table is the durable, scan-friendly reference for all 21 definitions; it does not need to remain in the same viewport as the diagrams because number activation opens the detail surface directly.

On wide screens, render a conventional semantic table with aligned numeric column, readable measurement-name column, and a generous description column. On narrow screens, use a responsive stacked-row/card presentation if needed to avoid horizontal scrolling, while retaining the same three fields and semantic associations.

Do not introduce a search box, pagination, or a second taxonomy-like navigation system for 21 rows unless implementation evidence shows a real need. The number links, table, and dialog are enough for the initial page.

## 6. SVG annotation rendering

### 6.1 Geometry and visual construction

Each overlay group should reproduce the corresponding reference geometry:

- dimension line with the correct endpoints and orientation;
- arrowheads at the correct ends and with the correct direction;
- dashed extension/reference lines attached to the correct anatomical landmarks;
- numeric label placed at the same relative position and alignment as the reference;
- any separate line segments required by the reference rather than replacing them with an approximate generic ruler.

The reference’s white-line/red-number contrast is a positional/visual reference. The final page may adapt the colors to the approved museum tokens if that improves consistency and contrast, but it must retain clear separation between the measurement lines, labels, skull, and selected state. A recommended treatment is bone-white measurement lines, brass/gold default numbers, and a high-contrast selected accent; you may choose a better token-based treatment after contrast testing.

Do not let visual styling alter endpoint coordinates or label registration. Stroke widths, hit areas, and tooltip surfaces may be chosen responsively, but the anatomical geometry remains fixed.

### 6.2 Registration workflow

For each figure:

1. Confirm the raw source image and its intrinsic dimensions.
2. Confirm the annotated reference dimensions.
3. Determine whether the annotated image is the same canvas, a uniformly resized canvas, or a translated/cropped canvas.
4. Establish the deterministic mapping from reference coordinates to raw-image coordinates.
5. Encode the overlay in the raw-image coordinate system or apply the documented mapping at build time.
6. Render the raw image and SVG overlay in one responsive wrapper.
7. Compare the rendered composition with the annotated reference at the reference aspect ratio and at multiple responsive sizes.

The dedicated paired directories are intended to make this audit direct and reliable. Exact dimension equality is the required preflight invariant: when a pair matches, no scale transform is needed; if a pair does not match, document and apply a deterministic registration transform or resolve the source mismatch before the overlay is finalized.

### 6.3 Addressability and interaction hooks

Give each visual occurrence stable hooks that can support:

- pointer hover;
- keyboard focus;
- touch activation;
- selected/highlighted state;
- future show/hide or filtering;
- test assertions that the expected number and view are present.

The visible number does not need to be the only hit target. A slightly larger invisible or low-contrast interaction target is encouraged for touch and accessibility, provided it does not obscure neighboring measurements or change the visible geometry.

## 7. Interaction behavior

### 7.1 Default state

- All supplied measurement annotations are visible when the page loads.
- No number is selected initially.
- No dialog is open initially.
- The table contains all 21 rows.
- The page remains useful if client JavaScript has not loaded.

### 7.2 Hover and keyboard focus

- Hovering a numbered group displays a small tooltip containing the measurement name.
- Keyboard focus provides the same name through an accessible tooltip or equivalent nearby status.
- Touch devices do not have hover. The first tap on an unselected number should select/highlight it and show a compact name-only tooltip or tap preview. The preview should provide a clear way to continue, such as a visible `View details` action.
- Do not require rapid double-tap timing or a one-second long press as the only way to reach the detail; those gestures can conflict with browser zoom/context-menu behavior and are less accessible. A second deliberate tap on the same number is acceptable when the first-tap preview makes that behavior clear.
- Hover/focus may temporarily emphasize the group, but it must not hide other measurements or move the page unexpectedly.
- Tooltips must not be the only way to access the name or description; the table and accessible names remain available.

### 7.3 Click, tap, and selection

- A pointer click or keyboard activation opens the detail surface for that number.
- On touch, the first tap opens the name-only preview described above; a second deliberate tap on the same number or the preview’s explicit details action opens the detail surface.
- The detail surface shows the number, measurement name, and complete exact-landmark/method description from the canonical source.
- The selected group receives a strong visual highlight. All repeated occurrences of that same number receive the corresponding highlight.
- Other groups remain visible enough to preserve context, but may be visually subdued.
- Selecting a different number updates the same detail surface rather than stacking multiple dialogs.
- A visible close action, Escape, and normal dialog focus restoration must work on desktop and mobile.
- The highlight state should have an explicit clear/reset path. It may clear on close if that produces the clearest behavior, or remain until the user selects another number/clears it; choose the simpler behavior and make it obvious.

### 7.4 Table-to-diagram linking

The table should use the same measurement identity as the overlay registry. A row activation is recommended to:

- select the corresponding number;
- highlight every visual occurrence;
- open the same detail surface; and
- bring the first relevant figure into view only when that helps the visitor locate the anatomy.

Do not force a large smooth scroll or move the user unexpectedly when the relevant figure is already visible. Respect reduced-motion preferences.

### 7.5 Future-ready structure without extra launch clutter

The independent SVG groups must make later show/hide, filtering, links, dynamic colors, and richer educational interaction possible. Those controls are not required in this milestone. Do not add a crowded control toolbar merely to demonstrate future extensibility.

## 8. Data and build approach — recommendations, not rigid low-level instructions

The preferred architecture is a small typed/validated measurement-reference model compiled from canonical content, containing:

- one definition per number;
- display name and exact description;
- stable page-safe identity;
- one or more view occurrences;
- the geometry needed to render each occurrence; and
- enough metadata for accessible labels and tests.

You may represent this differently if the result remains deterministic and avoids parallel conflicting sources. In particular:

- Do not make React components the source of truth for descriptions or coordinates.
- Do not hard-code a second copy of the CSV wording in JSX.
- Do not hand-edit generated JSON in the browser.
- Do not parse the ignored `agent_context` source at runtime.
- Prefer build-time validation that fails with the figure, measurement number, field, and source path when a definition or overlay is missing.

The existing `measurementDefinitions` in `src/domain/content/types.ts` should be inspected before adding another definition registry. If the page needs more detailed wording than the specimen record display, use a deliberate canonical relationship rather than allowing the two registries to diverge.

The raw skull images should pass through the existing public-media safety boundary or an equivalent reviewed methodology-media pipeline:

- strip metadata and any location information;
- preserve transparency and aspect ratio;
- create an appropriately sized web-ready derivative rather than shipping unnecessary 6000 px masters;
- retain source credit/rights declarations;
- keep annotated reference PNGs and private/raw source files out of the public build.

SVG overlays are a good fit because they preserve crisp labels and line geometry at every size, remain independently addressable, and avoid baking interaction into a raster image. This is a recommendation strongly preferred by the brief, not a demand for a particular React/SVG component hierarchy.

## 9. Accessibility and resilient states

The page must meet the repository’s WCAG 2.2 AA target and remain useful across capabilities.

- Use a semantic heading hierarchy and labelled diagram figures.
- Provide an accessible name for every interactive measurement number.
- Provide the complete text table as the non-visual and no-JavaScript equivalent of the diagrams.
- Ensure keyboard users can reach and activate every number and table row, close the detail surface, and restore focus.
- Do not communicate selection only through red/gold color; use focus, outline, weight, text, or an equivalent non-color cue.
- Ensure tooltip text is readable, does not disappear before it can be reached, and is not required for screen-reader access.
- Support touch targets on 360 px and 390 px wide screens without overlap.
- Respect reduced-motion preferences; do not rely on animated transitions to communicate selection.
- Check forced colors/high contrast and ensure the SVG does not disappear into the background.
- Avoid horizontal page overflow at mobile, tablet, desktop, and effective 200% reflow.
- If an image or overlay fails, keep the figure title and complete table available and show an honest, useful fallback instead of a broken-image-only state.
- If any required source is genuinely missing, do not silently substitute an annotated reference; record the exact blocker and ask the owner.

## 10. Performance and source-boundary expectations

- Keep the route statically renderable and useful before interactive JavaScript finishes.
- Load only the measurement page’s necessary interactive code; do not add a global client bundle for this feature.
- Lazy-load figures below the first viewport where that does not harm immediate comprehension.
- Keep SVG geometry deterministic and reasonably sized; avoid embedding huge raster data inside SVG.
- Do not load MapLibre, search indexes, a runtime database, a spreadsheet, or external taxonomy services for this page.
- Do not expose private staging directories, annotated reference PNGs, EXIF/GPS-bearing sources, or unreviewed raw notes.

## 11. Integration with the existing site

- Add page metadata, canonical URL, and navigation semantics consistent with the existing site.
- Update the existing specimen-page measurement guide affordance so visitors can reach the full illustrated page. Keep the compact contextual definition dialog if it remains useful; it should not become a second conflicting content source.
- Preserve the existing specimen measurement panel, profile-specific measurement fields, missing-value semantics, comparison card, and `/species` behavior unless a small link/wording change is required for the new page.
- Do not add this page’s 21 diagram numbers to specimen measurement filters or claim that all 21 are populated for every specimen.
- Update `docs/project_overview.md`, `docs/architecture.md`, `docs/design_system.md`, `docs/implementation_plan.md`, and `docs/project_status.md` only where the implemented route/behavior changes their current truth. Record a material content/media architecture decision as an ADR if one is needed.

## 12. Acceptance gate

The measurement page is ready for owner review only when all of the following are true.

### Content and source gate

- `/methodology` resolves to the intended Measurements page with correct metadata and a useful static/no-JavaScript rendering.
- The canonical measurement source contains all 21 definitions with the intended numbers, names, and descriptions.
- Every number in the table is represented by at least one SVG occurrence, and every occurrence resolves to one definition.
- Intentional repeated numbers are linked and highlighted together.
- All five annotated/raw source pairs from the dedicated directories are explicitly verified for exact dimensions and registration; no annotated reference is used as a final image.
- Source rights/credits and metadata stripping follow the repository contract.

### Geometry and visual gate

- At 100% reference dimensions, every overlay matches the supplied annotated PNG’s endpoints, orientation, extension lines, arrowheads, label alignment, and numbering.
- Any source-pair mismatch is handled by a documented deterministic registration transform or source correction rather than visual guesswork; matching pairs use direct shared coordinates.
- Figures preserve anatomy, aspect ratio, and annotation registration at desktop, tablet, and narrow mobile sizes.
- Wide horizontal views remain readable and are not forced into narrow cards; the dorsal/ventral pair and canine inset do not become illegible.
- The page feels like the existing Skull Collection design system and keeps the diagrams as the primary content.

### Interaction and accessibility gate

- Hover/focus names, the first-tap name preview, desktop click/keyboard details, the second-touch/explicit details action, persistent/clear selection, repeated-occurrence highlighting, table-row linking, Escape, and focus restoration work.
- The table remains a complete and understandable alternative when SVG interaction is unavailable.
- Keyboard, screen-reader semantics, reduced motion, forced colors, 200% reflow, and 360/390 px layouts are checked.
- There is no horizontal overflow, console error, hydration mismatch, or missing-image failure in the supported route.

### Verification report

At the checkpoint, report:

- the final route and files added/changed;
- the canonical data source and row/overlay counts;
- the raw-image mapping and any registration transforms;
- geometry/registration verification results;
- interaction, responsive, accessibility, no-JavaScript, and production-build results;
- content/rights/citation decisions;
- any unresolved source blocker or limitation; and
- the exact next action for the owner.

Stage and commit only the coherent measurement-page work. Do not stage the supplied annotated reference images, private/raw staging files, generated artifacts, or unrelated work.

## 13. Explicit non-goals for this milestone

- Do not implement a full specimen measurement-data migration.
- Do not redesign the entire specimen page or replace the existing calibrated comparison.
- Do not create parallel class-specific CSV tables.
- Do not publish the annotated PNGs as final image assets.
- Do not invent a universal osteometric protocol, citations, species facts, values, or landmark interpretations.
- Do not add a measurement search engine, taxonomy browser, map, upload flow, database, analytics, or unrelated editorial pages.
- Do not begin Phase 3.3, Phase 6, or other deferred milestones.
