# Skull Comparison page plan

**Status:** Implemented and locally verified on `skull_comparison_page`; owner review pending

**Last reviewed:** 2026-09-22

**Proposed public route:** `/compare`

**Owner input:** [`../prompt_comparison_page_plan.md`](../prompt_comparison_page_plan.md)

## 1. Purpose and decision boundary

Build a dedicated, efficient comparison workspace where visitors can compare the
relative physical scale and recorded measurements of collection skulls. The page
extends the existing specimen-page comparison engine; it does not create a
second scaling or measurement system.

The intended experience is a practical museum workbench:

- select two to five published comparison subjects;
- add one or more calibrated photographic views for each subject;
- move, overlap, arrange, reorder, and inspect those view layers freely;
- zoom and pan the complete field while every layer retains the same relative
  physical scale;
- adjust one opacity value per selected subject;
- compare the recorded measurements of all selected subjects in one table; and
- choose any two selected subjects as the directed difference pair.

This plan records the owner's accepted feedback and the approved resolution of
the two new ideas. The owner confirmed all eight decisions in section 21 on
2026-09-11 and authorized implementation on `skull_comparison_page`. The
unfinished `preparation_guide_refinement` branch remains separate and unmerged.

## Post-implementation owner review refinement (2026-09-13)

The first desktop review exposed interaction and density problems that are now
part of this contract:

- The field remains a genuine shared-scale workbench. Unmodified desktop
  mousewheel/touchpad input remains native document scrolling and never moves
  the field. Ctrl/Command plus wheel and the visible slider change field zoom.
  The zoom range is 25–2,000%. The ceiling was chosen from the smallest
  published calibrated lateral view (SPEC-0016): at 2,000% its subject can
  nearly fill a desktop field while all layers still use one camera scale.
- Comparison layers load the validated full public WebP directly instead of a
  small responsive optimizer variant. This preserves the available source
  detail during inspection and does not create a second media source or weaken
  the metadata/rights pipeline.
- The scale bar is a viewport overlay whose 100 mm span still grows with field
  zoom. It opens at the bottom-left of the current visible field, can be
  dragged or nudged with Arrow keys, and does not disappear when the camera is
  panned or zoomed.
- Reapplying the active arrangement is an explicit reset action. Adding or
  removing a subject/view deterministically lays out every active layer again
  and fits the camera to the new set. `Overlay pair` now overlays every active
  layer by matching view token (lateral with lateral, frontal with frontal,
  and so on) across all selected subjects; it is not restricted to the
  difference pair or lateral view.
- On touch screens, a gesture beginning on a skull moves that layer in any
  direction without scrolling the page. One-finger movement beginning on empty
  field space remains native document scrolling; two fingers claim the field
  for camera pan/pinch.
  Empty-field activation clears a selected layer, and Escape dismisses its
  toolbar. The transparent alpha hit surface has no hover rectangle; its
  native tooltip identifies the species/view.
- Field labels are compact `Skull N · View` labels. Species identity remains
  available from the hover tooltip, selected-card/table identity, and
  accessible layer name. Labels can be hidden under the field's More menu;
  selected controls use inverse camera scaling so they remain compact and
  usable at high zoom.
- Pointer hit testing uses the compiled alpha silhouette inside each view's
  visible subject bounds rather than the transparent source canvas. The
  surrounding figure and image containers are pointer-transparent, and the
  keyboard target remains a complete labelled layer control, so precision
  pointer selection does not reduce keyboard access or let an invisible canvas
  block a neighbouring skull.
- The selected-subject rail is a fixed-height desktop scroll surface matched
  to the actual field panel row. Cards combine Skull number, common name,
  scientific name, ID, and length densely; the common name opens the exact
  record. Cards and table subject headers can be reordered by drag, with arrow
  buttons on cards as a keyboard alternative. Card drags use an isolated,
  card-sized native drag preview so the browser never snapshots the surrounding
  rail or field. Add-view menus close after an action and on outside activation,
  and the last card opens its menu upward when needed so every option remains
  visible.
- The measurement matrix uses the union of every selected profile's primary
  and additional recorded measurements. Mixed mammal/bird primary rows always
  use the reviewed width/height mappings, even when the selected difference
  pair is mammal-to-mammal; a Show all measurements control reveals the
  remaining class-specific and additional rows without changing missing-data
  semantics. Human-readable common/scientific names are used in table headers,
  while the Difference header keeps its compact pair label and explanatory
  tooltip. Difference text and its divider share the direction color.

These refinements preserve the original boundaries: no freehand composition,
opacity, or camera values enter the share URL; no oblique calibration is added;
and the original preparation-guide worktree is not touched. The new behavior is
covered by focused domain tests and Chromium browser checks at desktop and
touch sizes before owner publication review.

## Owner review v2 corrections (2026-09-13)

The second desktop review adds the following implementation requirements:

- `Fit all` uses the calibrated visible alpha bounds of every active layer, not
  the full transparent image canvases. A small bounded margin keeps the result
  close to the available field without cropping the subject.
- Selecting a layer exposes a compact `S{n} · View` toolbar. Its controls are
  inverse-camera-scaled, anchored to the visible subject, and kept small enough
  that a tiny view remains inspectable rather than being covered by its menu.
- The More control is a normal native disclosure whose menu is positioned below
  the complete field toolbar. The scrollable strip contains only the ordinary
  field actions, so opening More never creates a vertical control-bar scroll
  rail or clips a menu item.
- `Custom` is a URL-shareable arrangement mode. Selecting it centers all active
  canvases once. Thereafter add/remove actions preserve existing manual layer
  positions and camera state; each newly added view starts at the world center
  with a raised stack order. Reset layout deliberately recenters all layers and
  refits the camera even in Custom mode.
- Ordinary wheel and trackpad events over the field are allowed to bubble to
  document scrolling. A non-passive native wheel listener consumes only a
  modified gesture for zoom and suppresses both document scrolling and browser
  page zoom. Cmd/Control-modified empty-space pointer drag is the explicit
  camera-pan gesture; an ordinary empty click only clears selection.

## 2. Recommended product decisions

| Decision | Planned rule | Reason |
|---|---|---|
| Route | `/compare` with page title `Compare skulls` | Short, action-oriented, and suitable for preselected links from other routes |
| Selected subjects | Minimum one, maximum five; references count toward the limit | Supports pairs, all specimens of a sparse taxon, and small taxonomic groups without turning the workspace into a general image board |
| Active image layers | Maximum ten across all selected subjects | Allows five subjects with two views each or two subjects with all five supported views while bounding transfer, decoded-image memory, and interaction complexity |
| Default view | Adding a subject adds its calibrated lateral view | Lateral is mandatory, familiar from the existing comparison, and consistently available |
| Supported additional views | Frontal, dorsal, ventral, and mandible dorsal when both media and reviewed calibration exist | These are documentary orthogonal views; oblique remains excluded because perspective makes one-dimensional calibration misleading |
| Field scaling | One shared world scale plus one shared `Field zoom` camera control | Zoom makes every skull and view larger or smaller together while preserving relative proportions |
| Layer transforms | Translation and stacking only; no visitor-controlled resize, rotation, stretch, or per-layer zoom | Free placement remains physically comparable |
| Opacity | One 0–100% opacity per selected subject, applied to all of that subject's active views | Keeps controls understandable when ten layers are present and preserves a clear subject identity |
| Difference | One directed pair chosen from the selected subjects; default is Skull 1 relative to Skull 2 | Preserves the existing difference engine and avoids five separate difference columns |
| Difference explanation | Compact information control in the Difference header | Exposes `A minus B` and `A / B` without consuming table width |
| Measurement links | Every measurement name links to its corresponding `/methodology` definition | Connects the analytical result to the reviewed landmark/method description |
| Approximation | Inline `~` and accessible status text only; no separate generic approximation note | Preserves honest source status while following the owner's request to remove the extra note |
| Shareable state | Selected subjects, active views, difference pair, and arrangement preset are URL-backed | Reproduces the useful analytical setup across devices without serializing fragile freehand coordinates |
| Freehand state | Positions, stacking, opacity, field pan, and field zoom remain transient in the first version | These values are viewport-dependent and would make links long and unreliable on different screens |
| Exports | Compact CSV download menu and a field-only PNG action under `More` | Source values remain analysis-ready; the visual export preserves manual field composition |

The five-subject and multiple-view ideas are therefore both included, but the
field is bounded by ten active view layers. Reaching either limit must produce a
clear explanation and recovery action, never a silently disabled control.

## 3. Feasibility audit

### 3.1 Current collection evidence

The generated collection inspected on 2026-09-11 contains 18 published physical
specimens and 104 validated specimen images. The current view coverage is:

| Canonical view | Published assets | Proposed comparison support |
|---|---:|---|
| Lateral | 18/18 | Yes; existing calibration foundation |
| Frontal | 14/18 | Yes, after per-asset calibration review |
| Dorsal | 18/18 | Yes, after per-asset calibration review |
| Ventral | 18/18 | Yes, after per-asset calibration review |
| Mandible — dorsal | 18/18 | Yes, after per-asset calibration review |
| Oblique | 18/18 | No; documentary gallery view only |

All 18 published specimens currently have measured maximum skull length,
cranium width, and maximum mandible length. All 12 mammal specimens also have
measured maximum skull width; skull width is correctly `not_applicable` for the
six birds. This makes the proposed orthogonal-view feature viable, subject to
the calibration rules below.

The adult-human reference currently has only a lateral media declaration. It
therefore offers only its lateral view until separately reviewed media and
calibration are added. The UI must not imply missing reference views exist.

### 3.2 Why measurements alone are insufficient

A recorded value says how large an anatomical span is in millimetres. It does
not say which two pixels in a photograph represent that span. Transparent
subject bounds happen to be a useful proxy for the current lateral photographs,
but they are not automatically valid for every view:

- a frontal subject bound can include mandibles, teeth, or projections beyond
  the width landmarks;
- dorsal and ventral bounds must be checked against the exact endpoints of the
  maximum-length record;
- the two mandibles are displayed at an angle, so the bounding-box height is
  shorter than the measured length along one mandible; and
- oblique views contain perspective foreshortening that a single scale cannot
  correct.

Every comparison-enabled media asset must therefore declare a reviewed
calibration span tied to one canonical measurement. Absence of calibration
makes that view unavailable in the comparison selector without affecting its
gallery publication.

### 3.3 View-specific calibration policy

| View | Preferred measurement basis | Required pixel geometry | Public wording |
|---|---|---|---|
| Lateral | Maximum skull length | Reviewed rostral-to-posterior span; existing subject-bound width may seed the declaration only after verification | `Scaled from maximum skull length` |
| Dorsal | Maximum skull length | Reviewed longitudinal landmark span, normally close to the subject-bound height | `Scaled from maximum skull length` |
| Ventral | Maximum skull length | Reviewed longitudinal landmark span | `Scaled from maximum skull length` |
| Frontal, mammal | Maximum skull width | Reviewed transverse maximum-width landmark span | `Scaled from maximum skull width` |
| Frontal, bird/fallback | Cranium width unless a later reviewed profile supplies a better maximum-width field | Reviewed transverse cranium-width landmark span | `Scaled from cranium width` |
| Mandible — dorsal | Maximum mandible length | A diagonal two-point span along one reviewed hemimandible, not the assembled pair's bounding box | `Scaled from maximum mandible length` |
| Oblique | None | Not eligible | Not offered |

The calibration span determines pixels per millimetre for the whole image. The
image is then scaled isotropically, preserving its aspect ratio and morphology.
Only the declared span is directly calibrated; perspective and depth in a 2D
photograph mean the page must describe the result as a calibrated relative-scale
view, not as photogrammetry or monitor-accurate physical size.

### 3.4 Proposed calibration source contract

Calibration belongs with the media asset because it connects a specific image
to a specimen measurement. Advance the specimen-media declaration deliberately
and add an optional structure equivalent to:

```ts
interface ComparisonViewCalibration {
  measurementKey:
    | "skullLength"
    | "skullWidth"
    | "craniumWidth"
    | "mandibleLength";
  span:
    | { kind: "subject-bounds-width" }
    | { kind: "subject-bounds-height" }
    | {
        kind: "landmark-span";
        start: { x: number; y: number };
        end: { x: number; y: number };
      };
}
```

Landmark coordinates should be normalized against the complete image canvas so
they survive deterministic derivative dimensions. The content compiler must
resolve the measurement value, reject zero/missing/non-applicable values, verify
both points are in bounds and distinct, calculate the pixel span, and emit a
typed immutable calibration model. It must never infer a missing calibration at
runtime.

The existing media processor may calculate candidate spans from alpha bounds
for maintainer review, but generated suggestions are not publication evidence.
Each committed comparison calibration must be explicitly reviewed against the
photograph and the corresponding methodology definition.

## 4. Page vocabulary

Use these terms consistently:

- **Comparison subject:** one selected physical specimen or reviewed reference.
- **Skull 1–5:** the visible ordered labels for selected subjects.
- **View layer:** one calibrated photographic view belonging to one subject.
- **Comparison field:** the interactive area containing the view layers.
- **Field zoom:** the camera-like zoom applied to the entire field.
- **Difference pair:** the two selected subjects used for the Difference column.
- **Arrangement:** a deterministic placement preset; it never locks later
  movement.

Use `Add view`, not `Angle`: mandible is a separate component view rather than a
camera angle, and `view` already matches the canonical media vocabulary.

## 5. Page layout and visual hierarchy

The page uses the design system's compact reference mode. It must not begin with
a tall editorial hero. Photography remains dominant inside the field, while
controls and measurements remain dense, aligned, and immediately useful.

### 5.1 Wide desktop

```text
Breadcrumb / Compare skulls                  Copy link  More
Short one-sentence instruction               Clear all

+----------------------+-----------------------------------------------+
| SELECTED SKULLS      | FIELD TOOLBAR                                 |
|                      | -  [zoom slider]  +  100%  Fit all  Arrange   |
| Skull 1 card         +-----------------------------------------------+
|  identity            |                                               |
|  opacity             |            COMPARISON FIELD                   |
|  active view chips   |      freely movable calibrated layers         |
|  Add view            |                                               |
|                      |   selected-layer toolbar stays in bounds      |
| Skull 2 card         |                                               |
| ... up to Skull 5    |                                               |
|                      |                                               |
| Add skull            |                                               |
+----------------------+-----------------------------------------------+

MEASUREMENTS                       [Show only comparable]
+----------------+----+----+----+----+----+---------------------------+
| Measurement    | S1 | S2 | S3 | S4 | S5 | Difference [S1 vs S2] ⓘ |
+----------------+----+----+----+----+----+---------------------------+
```

- The selected-subject rail is approximately 18–21rem wide.
- Subject cards stack vertically on the left as requested.
- The field receives the remaining width and a viewport-responsive minimum
  height of roughly 30rem, growing toward 65–72vh on ordinary desktops.
- The table spans the full page width beneath the workbench, preventing the
  seven-column maximum from being squeezed beside the field.
- The rail and field stay in normal document flow. On wide desktop, the rail is
  a compact vertical scroll surface with the same height as the complete field
  panel, so five cards never push the field or measurement table downward. At
  the tested tablet/phone breakpoints it becomes the existing horizontal strip.

### 5.2 Tablet and narrow laptop

- The rail becomes a horizontal selected-subject card strip above the field.
- Each card retains its own view and opacity controls inside the strip.
- The strip scrolls horizontally without a vertical rail scrollbar. At these
  widths, Add view, Opacity, and Quick comparisons open below their controls as
  viewport-positioned panels above the field. Panels stay within the viewport
  horizontally and scroll internally when there is not enough height.
- The field remains the largest surface.
- The table may scroll within its own bounded container when four or five
  subjects are present; the document itself must never overflow horizontally.
- The Measurement column stays sticky at the left of an internally scrolling
  desktop/tablet table when browser testing confirms reliable behavior.

### 5.3 Phone

- The selected-skull count sits above a horizontally scrollable strip of narrow
  cards. At 390 CSS pixels, two complete selected cards fit before scrolling.
  Common name and record ID remain visible; compact view, opacity, and remove
  actions form a vertical control column. Their menus open over the viewport
  so the horizontal strip cannot clip them.
- The field toolbar keeps `100%` and `Fit all` beside Arrange, with a separate
  full-width zoom row and More in the upper-right corner.
- The field follows with a practical touch height; it is not forced to a full
  viewport because the measurement table remains part of the same journey.
- The semantic table visually becomes one card per measurement. Each card shows
  all selected subject values in a compact grid, then the chosen difference.
- Every control remains at least 44 CSS pixels in its actionable dimension.
- Internal strips may scroll; the page itself must have no horizontal overflow.

## 6. Selected-subject rail and lifecycle

### 6.1 Adding subjects

- The page starts with Skull 1 as `SPEC-0001` and Skull 2 as the reviewed
  adult-human reference unless URL state supplies a valid selection.
- `Add skull` opens a labelled searchable dialog based on the existing
  comparison selector.
- Search matches common, scientific, and Danish names, aliases, genus text, and
  immutable specimen/reference IDs without loading the catalog's Orama index.
- Group references separately from collection specimens.
- Mark already selected records and explain why they cannot be added twice.
- Every published physical specimen is eligible when it has validated lateral
  media, an explicit lateral orientation, and a positive measured or explicitly
  approximate maximum skull length. Eligibility is not restricted to a taxon's
  default specimen.
- Selecting a physical specimen adds exactly that stable specimen record, never
  a taxon-level substitute.
- Selecting a subject adds its lateral layer at 100% opacity and places it using
  the current arrangement strategy.

### 6.2 Subject cards

Each card contains:

- `Skull N` and a persistent shape/series marker;
- common name or reference label;
- scientific identification when applicable;
- immutable specimen ID for physical specimens;
- maximum skull length and inline measured/approximate status;
- a clickable common-name link to the exact specimen record when available;
- one labelled subject-opacity slider with a numeric percentage;
- chips for every active view, each with a full accessible label;
- `Add view`; and
- a labelled `Remove skull` action that removes all its layers.

Cards are compact rather than one metadata row per identity field. Dragging a
card changes the ordered Skull 1–5 sequence; adjacent Arrow buttons provide the
same operation without a drag gesture. The table subject headers expose the
same drag reorder operation so users can manage the Difference pair from the
analytical surface as well. Reordering either surface preserves the selected
Difference pair's Skull slot positions: if the control says `S1 ↔ S2`, the
records now occupying Skull 1 and Skull 2 become the new directed pair, while
the control remains `S1 ↔ S2`. This lets users choose the pair by moving records
into the desired numbered slots; changing the pair control itself remains the
explicit way to choose different slots.

Color is supplementary. Every subject remains identifiable by Skull number,
name, ID, and repeated marker shape in the field and table.

### 6.3 Adding and removing views

- `Add view` opens a compact menu/dialog listing Lateral, Frontal, Dorsal,
  Ventral, and Mandible — dorsal.
- A view is addable only when the selected subject has both the validated media
  asset and a reviewed comparison calibration.
- Unavailable entries remain visible only when a concise reason helps recovery,
  such as `No frontal photograph` or `Not calibrated for comparison`.
- An active view cannot be added twice for the same subject.
- Reaching ten active layers disables further additions with the text `10-view
  field limit reached` and an action to manage existing views.
- Removing a view removes only that layer.
- If it was the subject's final active view, the subject is also deselected, as
  requested by the owner.
- Removing a subject compacts Skull numbering while preserving the relative
  order of the remaining subjects.
- Reordering a card or table header keeps the selected pair's two positional
  Skull slots and remaps the directed IDs to the records now occupying those
  slots.
- If both records in the difference pair remain selected after a removal, the
  pair remains anchored to their record IDs. Otherwise it falls back to the
  first two remaining subjects and announces the change.

## 7. Comparison field

### 7.1 Shared physical-scale model

Use a single world coordinate system for every active layer:

1. Resolve the layer's reviewed calibration measurement and pixel span.
2. Calculate image pixels per source millimetre.
3. Apply one shared world-pixels-per-millimetre factor to the complete image.
4. Preserve the original canvas aspect ratio and alpha-subject offsets.
5. Apply only layer translation and z-order within the world.
6. Apply field pan and field zoom once to the world container.

For a landmark span, the implementation-equivalent calculation is:

```text
source pixels per mm = calibration span pixels / recorded measurement mm
world canvas width = source image width / source pixels per mm × world pixels per mm
world canvas height = source image height / source pixels per mm × world pixels per mm
```

Subject-bound width/height declarations use the corresponding bound dimension
as the calibration span but still scale the complete canvas by the same factor.

Changing field zoom therefore makes all skulls larger or smaller together. It
does not change their ratios or their recorded dimensions. `100%` means the
workspace's baseline view scale, not one physical millimetre per CSS pixel and
not life-size output on an uncalibrated monitor.

### 7.2 Field zoom and pan

Label the control **Field zoom**. Provide:

- minus and plus buttons;
- a range slider;
- a visible percentage;
- `100%`; and
- `Fit all`.

Recommended manual range: 25–2,000%. `Fit all` computes a bounded value and pan
offset that places every active layer inside the field with safe padding. The
upper bound is a view-inspection ceiling, not a claim that the source contains
unlimited detail.

Interaction:

- mouse/pen dragging an image layer moves that layer;
- Cmd/Control-modified dragging of empty field background pans the field;
- trackpad pinch or Ctrl/Command + wheel over the field zooms around the pointer
  and suppresses document scrolling;
- an ordinary unmodified desktop wheel/touchpad remains native document
  scrolling and does not move the field;
- one-finger touch beginning outside a skull remains available for document
  scrolling;
- a touch beginning on a skull moves that layer vertically, horizontally, or
  diagonally without scrolling, while two-finger touch pans and pinches the
  field; and
- all operations have visible button/slider alternatives.

Clamp only the camera enough that the complete arrangement can always be
recovered. Do not snap or constrain individual layers to rows, columns, or the
visible viewport. `Fit all` and `Reset layout` are the primary rescue actions.

### 7.3 Layer selection and movement

- Use the existing generated alpha hit path so transparent canvas does not
  block lower overlapping layers.
- Pointer down selects a layer and captures the pointer for smooth mouse/pen
  dragging. A skull silhouette suppresses native page panning from touch start;
  a small distance threshold then starts layer movement in any direction.
  Empty field space retains native one-finger page scrolling.
- Update CSS transform variables through `requestAnimationFrame` during pointer
  movement rather than rerendering the entire React tree for every event.
- Commit the final normalized world position to state on pointer release.
- A selected layer gets a non-color outline and a compact boundary-aware toolbar
  labelled with `Skull N · View`.
- The toolbar contains `Move forward`, `Move backward`, and `Remove view`.
- The visual close symbol may be `×`, but its accessible name is `Remove Skull N
  {view} view`.
- Selection never turns the image itself into a navigation link; the subject
  card provides the unambiguous specimen-record action.

Keyboard equivalent:

- Tab reaches each layer through a deterministic layer list order.
- Enter or Space selects it.
- Arrow keys move by one world step; Shift + Arrow uses a larger step.
- `[` and `]` may adjust stacking only if documented in an accessible shortcut
  hint; toolbar buttons remain mandatory.
- Delete/Backspace may remove a selected view only when focus is on the layer
  and after browser testing proves it cannot conflict with navigation. The
  labelled toolbar action remains the primary removal path.
- Escape, or a primary click/tap outside the layer and its controls, dismisses
  the layer toolbar. Focus remains available through the layer's keyboard
  target.

### 7.4 Opacity

- Opacity belongs to the comparison subject and affects all of its view layers.
- Use a native 0–100% range input with visible numeric output.
- Provide quick values 25%, 50%, 75%, and 100% only if they fit without
  crowding; they are secondary to the slider.
- At 0%, keep the subject card, active-view chips, layer focus target, and
  selected-layer outline available. Announce `Skull N hidden in field`.
- Opacity never affects labels, controls, table text, or exported label legibility.

### 7.5 Arrangement presets

Presets set positions and stacking once; users can immediately continue moving
layers. Recommended choices:

- **By specimen:** one column/group per subject, with its views clustered.
- **By view:** matching views align in rows across subjects.
- **Side by side:** all layers laid out in a compact reading sequence.
- **Overlay pair:** center every active layer with another layer of the same
  view token, across all selected subjects. Distinct view groups are tiled so
  alternate views remain inspectable instead of being silently omitted.
- **Vertical stack:** retains the familiar specimen-page arrangement.

`Reset layout` restores deterministic positions, stacking, 100% opacity, and a
fitted field camera while preserving selected subjects and active views.
`Clear all` removes all subjects and returns to the empty invitation state.

When a subject or view is added or removed, rebuild the current deterministic
arrangement and fit all active layers. This deliberately prioritizes an
immediately usable, non-overlapping field over preserving stale positions that
would leave new layers outside the camera. Manual movement remains free until
the next explicit arrangement, add/remove lifecycle action, or reset.

### 7.6 Scale bar

Offer a restrained `Show 100 mm scale bar` toggle in More controls. The bar is a
viewport overlay positioned from the current visible bottom-left corner, while
its line width is derived from the same world scale and field zoom as the skulls.
It remains visible during camera movement, is freely draggable, and supports
Arrow-key nudging. Its label remains readable and includes an accessible
explanation that the page compares relative dimensions and is not a monitor
calibration tool.

## 8. Measurement table

### 8.1 Structure

Render one semantic table with these columns:

1. Measurement
2. Skull 1
3. Skull 2
4. Skull 3 when selected
5. Skull 4 when selected
6. Skull 5 when selected
7. Difference

Use tabular numerals and canonical units. Subject headers use the compact Skull
number/marker, common name, scientific name when available, and specimen
ID/reference status. The complete identity remains in the subject rail and the
table's accessible header association.

### 8.2 Difference pair and calculation

The Difference header contains:

- the heading `Difference`;
- a compact pair control such as `S1 ↔ S2`; and
- an information button/tooltip.

The pair control opens two labelled selectors restricted to currently selected
subjects. The same subject cannot occupy both sides. The first selected subject
is the numerator/primary record and the second is the denominator/comparison
record.

The information tooltip states concisely:

> Difference is Skull A minus Skull B. Ratio is Skull A divided by Skull B.

The tooltip must be an accessible focusable disclosure/popover, not a hover-only
`title` attribute.

Each difference cell reuses the existing calculation engine and contains:

- absolute magnitude and unit;
- direction word: longer, shorter, wider, narrower, higher, lower, heavier,
  lighter, or same;
- ratio with sensible precision; and
- restrained red/green/equal styling plus text or direction glyph.

Color expresses direction only, never quality, normality, or biological value.

### 8.3 Dynamic measurement matrix

The selected subjects determine the visible measurement matrix, while the
selected difference pair determines only which two values feed the Difference
column. The primary section preserves the existing class-aware rules:

- mammal ↔ mammal: six mammal comparison rows;
- bird ↔ bird: nine bird comparison rows;
- mammal ↔ bird: six explicitly mapped cross-class rows;
- any pair involving fallback `other`: four shared rows.

Every additional selected subject displays the measurement appropriate to the
row's profile mapping. In cross-class width and height rows, mammals use maximum
skull width/skull height and birds use orbital width/cranium height exactly as
the current engine defines, regardless of which class the Difference pair
happens to use. The optional full section is the union of selected profiles'
primary and additional keys after those mapped keys are represented;
class-specific values may honestly display `Not applicable` for profiles where
the definition does not apply.

Changing the difference pair changes only the directed Difference values and
its compact header labels. Reordering subjects or table columns keeps the pair's
slot labels fixed and changes which record IDs feed those slots; changing the
selected profile mix changes the row matrix. Announce pair/row updates without
jumping the page.

### 8.4 Measurement links and source status

- Measurement names are real links to the corresponding stable definition on
  `/methodology`; the full additional vocabulary uses the same link fallback
  to the methodology measurement table when no numbered illustration exists.
- Cross-class mapped rows link to both relevant definitions through a compact
  labelled disclosure rather than pretending they are one homologous landmark.
- Measured values render normally.
- Approximate values retain an inline `~` and assistive text such as
  `approximate`; do not add the rejected generic approximation note.
- Missing values remain `Not recorded` and non-applicable values remain `Not
  applicable`; neither becomes zero.
- Difference is unavailable when either selected pair value is missing,
  non-applicable, non-positive, or unit-incompatible.

### 8.5 Comparable-row control

`Show only comparable measurements` is off by default. When enabled, retain
only rows for which both records in the active difference pair have valid
comparable values. Announce the new visible row count. The setting may be
URL-backed because it changes the analytical result presentation.

### 8.6 Responsive behavior

- At wide widths, use the real seven-column table when five subjects are
  selected.
- At intermediate widths, contain horizontal scrolling inside the table region
  and keep the Measurement header/column visible when robust.
- At narrow widths, preserve the semantic table in the DOM but present each row
  as a stacked card: measurement/link first, selected subject values in a small
  grid, and the active-pair difference last.
- Do not abbreviate `Not recorded` or `Not applicable` in this reference surface.
- Never let the table force document-level horizontal overflow.

## 9. Quick comparisons and taxonomic groups

### 9.1 Empty-page suggestions

Provide compact data-derived starting points:

- Raccoon dog and adult-human reference;
- smallest and largest eligible collection skulls by maximum length;
- two specimens from the same taxon when available; and
- a reviewed same-genus group containing two to five eligible specimens.

Suggestions are shortcuts, not biological claims. Their labels state exactly
how they were selected.

### 9.2 Contextual suggestions

After at least one subject is selected, the picker may offer:

- other specimens of the same taxon;
- other eligible taxa in the same genus;
- closest recorded maximum skull length;
- smallest/largest eligible skull; and
- adult-human reference.

If a same-genus or same-taxon result contains more records than remaining
slots, open a filtered chooser instead of silently selecting an arbitrary five.

## 10. URL and shareable state

### 10.1 State included in the URL

Use namespaced immutable record IDs and canonical view tokens. The exact compact
encoding may be finalized during implementation, but it must represent:

- the ordered selected subjects;
- active views per subject;
- the directed difference pair;
- the arrangement preset when one is active; and
- whether `Show only comparable measurements` is enabled.

Illustrative, not binding, form:

```text
/compare?subjects=specimen:SPEC-0001,reference:adult-human-skull
  &views=specimen:SPEC-0001:lateral+dorsal;reference:adult-human-skull:lateral
  &difference=specimen:SPEC-0001,reference:adult-human-skull
  &arrange=by-specimen
```

The parser must reject malformed, duplicate, unpublished, uncalibrated, or
over-limit state deterministically and retain every valid part. A concise status
message explains discarded entries and offers `Reset comparison`.

### 10.2 State excluded from the initial URL

Do not serialize freehand x/y positions, z-order, opacity, camera pan, or camera
zoom in the first version. A copied link reconstructs the selected analytical
content through a deterministic arrangement and `Fit all` on the receiving
viewport. Exact composition sharing may be introduced later only through a
versioned normalized payload and responsive compatibility rules.

### 10.3 Static-first route behavior

- `src/app/compare/page.tsx` remains a Server Component that loads the canonical
  comparison model directly; no internal API route is needed.
- It prerenders the default two-subject comparison, identities, images, and
  semantic measurement table.
- A single client workbench island progressively reads and writes query state
  using the established catalog/map history pattern.
- Deliberate subject/view/pair actions update history once per completed action;
  pointer movement, slider movement, and search typing never create history
  entries.
- `popstate` restores selected analytical state.
- The default comparison remains useful without JavaScript. Query-enhanced
  custom arrangements require JavaScript, but no-JavaScript users still receive
  a truthful calibrated pair and complete table.

`Copy comparison link` copies the current canonical analytical URL and gives a
brief live confirmation. It must not require a backend, account, or external
short-link service.

## 11. Entry points and navigation

When the route is implemented and verified:

- add `Compare` to the global primary navigation and footer;
- convert the Home `Skull Comparison` card from `Coming soon` to a real
  full-card `/compare` link while retaining its existing preview asset;
- add `Open full comparison` to the specimen-page scale card, preselecting the
  current specimen and its currently chosen comparison record;
- add a compact `Compare` action to exact specimen result cards/quick views;
- for a taxon card, preselect the exact specimen represented by that card and
  label the action with its immutable ID when needed;
- add comparison links to related-specimen/taxon cards only through the same
  reusable card action, not as a new global selection basket; and
- include `/compare` in sitemap, metadata, route tests, and active navigation.

Do not add a persistent comparison basket across unrelated routes in this
phase. Each entry point creates an explicit shareable `/compare` destination.

## 12. Export behavior

The user replaced the ineffective Print action with two compact download
options beside Copy link: `Long/tidy format` and `Wide format`. Both export only
selected subjects and their original recorded numeric measurements, regardless
of the table's primary/all or comparable-only filters. Never serialize the
Difference column, calculated ratios, cross-class UI mapping labels, camera
state, or freehand positions into these CSVs.

- Long/tidy: one row per selected subject and available recorded measurement,
  with ordered skull slot, stable subject ID, type, display identity, true
  source `snake_case` measurement name, numeric value, unit, and measured or
  approximate status.
- Wide: one row per selected subject, the same identity columns, and the union
  of selected subjects' available source measurement columns. Each numeric
  column has a companion status column. Blank cells represent unavailable
  subject/measurement combinations; never write zero for missing data.
- Use canonical source names such as `skull_width_mm` and
  `orbital_width_mm`. Apply CSV escaping and formula-injection protection to
  identity text. UTF-8 with a BOM supports common spreadsheet imports.

The low-priority `More` menu offers `Export field PNG`, followed by a compact
choice between pure black and the UI grid/radial background. Export the visible
field rectangle at enhanced pixel resolution using the current camera,
placements, z order, calibrated source images, flips, per-subject opacity, and
optional labels/scale bar. The action must preserve the live field state and
report image-loading or encoding failures without downloading a partial image.
The PNG is a composition of the already public image derivatives, not a new
source asset. Selection outlines, menus, and editing handles are omitted from
the download so the workbench's transient editing state does not obscure the
skulls.

## 13. Visual design system

- Reuse the current dark museum palette, Newsreader display headings, IBM Plex
  Sans interface type, tabular numerals, restrained radii, and one-pixel archival
  dividers.
- Keep the page introduction short. The field and data table are the primary
  hierarchy, not decorative prose.
- Bone remains the brightest object. Layer outlines, subject markers, and
  controls stay quieter than the photographs.
- Derive a five-item accessible data-series palette from existing semantic
  tokens. Validate contrast against the field and table surfaces. Skull number,
  shape marker, and text always accompany color.
- Use brass for interactive actions, verdigris/data color for calibrated values,
  and the existing restrained green/red treatment only for difference direction.
- Do not use gothic decoration, paper texture, game-like inventory panels, or
  floating-card ornament.
- Use motion only for immediate manipulation feedback and short control-state
  transitions. No inertial flying, spring rearrangement, or parallax belongs in
  the analytical field.

## 14. Accessibility contract

The visual arrangement is enhancement; subject identity and measurements must
remain complete without perceiving or manipulating the field.

- Every subject, view, opacity, scale basis, and table value has text.
- Field layers are keyboard focusable in deterministic subject/view order.
- Arrangement presets, arrow-key movement, z-order buttons, and removal controls
  provide alternatives to drag gestures.
- Tooltips/popovers open from real focusable controls, support Escape, and
  restore focus.
- Pointer targets follow alpha-derived hit paths while keyboard targets remain
  generous and visible.
- Selected and focused state uses outline/shape/text in addition to color.
- Difference direction is written in words.
- Native sliders expose labels, values, minimums, and maximums.
- Discrete additions, removals, limit messages, pair changes, and resets use a
  restrained polite live region; continuous drag coordinates are not announced.
- Reduced motion removes smoothing and arrangement animation while preserving
  immediate drag, pan, zoom, and opacity changes.
- Forced-colors mode retains boundaries, controls, selection, and table meaning.
- At 200% browser zoom and 320/360/390 px widths, the document has no horizontal
  overflow and no inaccessible off-screen control.
- Failed images retain the layer's labelled placeholder, remove/z-order
  controls, subject card, and table data.
- With JavaScript disabled, the default pair's static images, identities,
  calibration wording, measurement links, and table remain available.

## 15. State and component architecture

### 15.1 Domain state

Use stable record IDs and layer IDs; never use array position as durable
identity. A state model equivalent to the following is appropriate:

```ts
interface ComparisonWorkbenchState {
  subjects: SelectedComparisonSubject[]; // ordered, 1–5
  layers: ComparisonViewLayer[]; // unique, 1–10
  differencePair: { primaryId: string; comparisonId: string } | null;
  comparableOnly: boolean;
  arrangement: ComparisonArrangement | null;
  camera: { zoom: number; panX: number; panY: number };
  selectedLayerId: string | null;
}

interface SelectedComparisonSubject {
  recordId: string;
  opacity: number;
}

interface ComparisonViewLayer {
  layerId: string; // deterministic record ID + view token
  recordId: string;
  view: "lateral" | "frontal" | "dorsal" | "ventral" | "mandible-dorsal";
  x: number;
  y: number;
  z: number;
}
```

Use a reducer or similarly explicit transition layer for add/remove/reorder,
limits, positional difference-pair remapping, difference fallback, reset, URL
restore, and arrangement operations. Pure transitions should be unit tested
independently from pointer behavior.

### 15.2 Server/client boundary

- The route Server Component owns metadata, shell, canonical record loading,
  default state, and the useful static fallback.
- Pass only validated JSON-serializable comparison records, calibrated media
  metadata, and methodology links into the client island.
- The client island owns selection, URL/history synchronization, layer state,
  pointer/touch/keyboard manipulation, field camera, dialogs, and live status.
- No Server Action, route handler, runtime database, or external request is
  needed.
- Avoid `useSearchParams` causing a route-wide client-rendering bailout; follow
  the existing catalog/map `window.location` plus `popstate` pattern, or isolate
  any navigation hook behind an explicit Suspense boundary.

### 15.3 Reuse and refactoring

Do not fork the specimen-page calculations. Refactor toward:

- one eligible-record query that can return every valid published specimen and
  reviewed reference;
- one pure calibrated-layer calculation supporting any declared view span;
- one pure class-aware row/difference engine;
- one reusable searchable subject picker;
- a compact specimen-page composition preserving current behavior; and
- the full standalone workbench composition.

The current files are the starting points:

- `src/data/comparison.ts`
- `src/domain/comparison/scale.ts`
- `src/domain/comparison/types.ts`
- `src/features/comparison/ComparisonSelector.tsx`
- `src/features/comparison/ScaledSkullImage.tsx`
- `src/features/comparison/MeasurementDifferences.tsx`
- `src/features/comparison/ScaleComparison.tsx`

The existing `ScaleComparison` may become a compatibility composition around
new generic primitives. Its current primary/current-specimen semantics,
adult-human default, orientation handling, double-click/keyboard record link,
and compact layout must not regress.

### 15.4 Suggested new modules

Names may change if implementation reveals a clearer boundary, but ownership
should remain equivalent:

```text
src/app/compare/page.tsx
src/features/comparison/ComparisonWorkbench.tsx
src/features/comparison/ComparisonSubjectRail.tsx
src/features/comparison/ComparisonField.tsx
src/features/comparison/ComparisonLayer.tsx
src/features/comparison/ComparisonFieldToolbar.tsx
src/features/comparison/ComparisonMeasurementTable.tsx
src/features/comparison/ComparisonDifferencePicker.tsx
src/features/comparison/comparisonState.ts
src/domain/comparison/calibration.ts
src/domain/comparison/workbench.ts
```

Do not create a generic canvas framework or move comparison state into global
application context.

## 16. Performance and media delivery

Five subjects and ten layers are feasible only if the route avoids loading all
eligible media eagerly.

- The server may serialize lightweight record/media metadata, but the browser
  renders image elements only for active layers.
- Load the two default lateral images eagerly only when they are above the fold;
  newly added layers load on demand.
- Use `next/image` with accurate responsive `sizes` or a reviewed dedicated
  comparison derivative strategy so ten layers do not all decode the 3200 px
  master unnecessarily.
- Preserve transparency, aspect ratio, source dimensions, subject bounds, and
  calibration geometry through any optimized derivative.
- Keep MapLibre, map records, the Orama engine/index, gallery inspection code,
  and Home parallax code out of the comparison bundle.
- Use transforms rather than layout-position properties during drag/pan/zoom.
- Apply `will-change` only while manipulating a layer or camera.
- Avoid React state updates on every pointer event; use refs/CSS variables and
  commit bounded state at interaction completion.
- Observe field size and recompute camera fitting without changing world-space
  layer coordinates.
- Test decoded memory and frame responsiveness with ten mixed-view layers on a
  representative mobile device, not only transfer size on desktop.

No artificial loading skeleton is needed for canonical local data. Added image
layers may show a labelled bounded media placeholder while their real request is
pending.

## 17. Error, limit, and recovery states

| State | Required behavior |
|---|---|
| No selected subject | Explain the workspace in one sentence; show Add skull and quick comparisons |
| One selected subject | Field and table work; Difference says `Add another skull to compare` |
| Five subjects selected | Add skull explains the five-subject limit and points to Remove skull |
| Ten layers active | Add view explains the ten-view limit and points to active view chips |
| View has media but no calibration | Keep it in the gallery; show `Not calibrated for comparison` in the view menu |
| Optional media absent | Show `No {view} photograph` without fabricating a placeholder view |
| Invalid URL record | Discard only the invalid entry, retain valid state, announce recovery |
| Duplicate URL record/view | Deduplicate deterministically and announce recovery |
| Difference subject removed | Preserve pair if possible; otherwise choose first two remaining subjects |
| Last view removed | Deselect its subject and update table/pair as one atomic action |
| Image request fails | Keep labelled layer placeholder and every non-image control/data path |
| Opacity is 0% | Keep layer target and subject controls reachable; label it hidden |
| All layers off screen | Fit all restores them immediately |
| Calibration value unavailable after data change | Exclude that view and fail content validation when a published declaration is contradictory |

## 18. Testing and verification contract

### 18.1 Domain and data tests

- Calibration span parsing, bounds, Euclidean length, and pixels-per-millimetre.
- Equal physical dimensions render equal calibration spans across different
  source canvases and views.
- Field zoom changes every layer by the same factor and never changes ratios.
- Per-subject opacity affects all and only that subject's layers.
- Add/remove view and last-view-removes-subject behavior.
- Five-subject and ten-layer boundaries.
- Deterministic Skull renumbering, positional difference-pair remapping on
  reorder, and valid-ID fallback after removal.
- Existing mammal, bird, cross-class, fallback, approximate, unavailable, equal,
  and unit-mismatch difference calculations.
- URL parse/serialize round-trip, canonical ordering, malformed state, duplicate
  state, limits, unpublished IDs, and uncalibrated views.
- Quick-pair/group suggestions are deterministic and use canonical taxonomy and
  measured values only.

### 18.2 Component tests

- Both selector variants retain search, keyboard navigation, empty state, and
  focus restoration.
- Subject cards expose identity, opacity, active views, unavailable reasons,
  exact record links, and removal.
- Subject-card dragstart creates only a card-sized native drag preview and
  dragend removes that preview without changing the reorder state.
- Difference tooltip and pair picker are keyboard/touch operable.
- Methodology links resolve to existing stable measurement anchors.
- Comparable-only filtering and live row count.
- Table headers remain associated with cells for one through five subjects.
- CSVs preserve source measurement keys, units, status, and selected order.

### 18.3 Browser tests

At minimum, verify in real Chromium:

- default static `/compare` load with no console/overlay errors;
- direct valid and partially invalid share URLs, reload, back, and forward;
- adding five subjects and ten mixed-view layers;
- lateral, frontal, dorsal, ventral, and diagonal mandible calibration;
- free pointer drag, overlap, z-order, remove toolbar, and Fit all;
- selected-subject card drag preview isolation and reorder preservation;
- field zoom buttons, slider, pointer-centered trackpad zoom, background pan,
  and invariant scale ratios;
- per-subject opacity including 0%;
- arrangement presets followed by free movement;
- active difference-pair changes and class-aware table changes;
- last-view removal atomically deselects the subject;
- Home, specimen-page, catalog, header/footer, sitemap, and methodology entry
  points;
- existing specimen-page comparison behavior and exact-record navigation;
- 1440×696, 1440×900, 1280×720, 1024×768, 768×1024, 390×844, 360×800,
  and 320 px width;
- touch layer drag versus page scroll, two-finger field pan/pinch, and no trapped
  document scrolling;
- keyboard-only add, move, reorder, remove, pair change, reset, and navigation;
- axe, 200% browser zoom, forced colors, reduced motion, failed images, CSV/PNG downloads,
  and no document-level horizontal overflow;
- JavaScript-disabled default pair and complete semantic table; and
- absence of MapLibre, map-provider, Orama-index, and unrelated route requests.

### 18.4 Calibration audit evidence

Add a maintainer verification command that reports every published subject and
candidate view as one of:

- calibrated and eligible;
- media missing;
- calibration missing;
- measurement missing/non-applicable; or
- invalid declaration.

For every committed landmark span, retain reproducible visual audit evidence
outside production assets or generate a local review overlay. The final gate
must inspect representative mammal/bird, small/large, frontal, dorsal, ventral,
and mandible layers at shared scale.

### 18.5 Quality gate

Use the pinned Node 24.18.0/pnpm 11.21.0 toolchain and run checks sequentially:

```bash
CI=true pnpm check
CI=true pnpm build
PLAYWRIGHT_PORT=3102 pnpm test:e2e
```

Also inspect the complete diff, ignored-file behavior, image request set,
generated artifacts, and production build route count. Local validation does
not authorize push, pull request, merge, deployment, or publication.

## 19. Implementation sequence

### Stage 0 — owner confirmation and branch boundary

- Confirm the decisions in section 2, especially `/compare`, five subjects,
  ten layers, per-subject opacity, and non-serialized freehand layout.
- Complete or deliberately separate the current preparation-guide branch work.
- Start the feature from the latest approved `main` on a short-lived task branch.
- Create an ADR for the multi-view calibration and workbench boundary.

### Stage 1 — calibration contract and audit

- Add the view-calibration source schema and compiled types.
- Build candidate/audit tooling and review every intended asset.
- Calibrate lateral, dorsal, ventral, frontal, and mandible views explicitly.
- Keep oblique unavailable.
- Advance generated schema versions deliberately and update invalid fixtures.
- Verify generated manifests before UI work.

### Stage 2 — shared comparison-domain refactor

- Reconcile eligibility so every valid published specimen can participate.
- Generalize calibrated presentation from lateral subject bounds to declared
  view spans.
- Extract reusable row/difference calculation from its current renderer.
- Preserve all specimen-page behavior with focused regression tests.

### Stage 3 — static route and two-subject baseline

- Add `/compare`, metadata, shell, default pair, static field, and full semantic
  table.
- Add the first URL parser/serializer and no-JavaScript fallback.
- Establish responsive workbench geometry before advanced manipulation.

### Stage 4 — field manipulation

- Add layer selection, alpha-path hit testing, free drag, keyboard movement,
  z-order controls, per-subject opacity, field pan/zoom, scale bar, Fit all,
  and reset/presets.
- Verify pointer/touch conflict handling and scale invariants in a real browser.

### Stage 5 — multiple views and five subjects

- Add per-subject view menus and the ten-layer limit.
- Add up to five subject cards and responsive subject navigation.
- Implement atomic final-view removal and difference-pair fallback.
- Add all arrangement presets and performance safeguards.

### Stage 6 — analytical table and suggestions

- Add the directed difference-pair picker/tooltip.
- Render one-to-five value columns and the dynamic class-aware matrix.
- Add methodology links and comparable-only filtering.
- Add quick comparisons and taxonomy-derived group suggestions.

### Stage 7 — site integration and exports

- Activate Home, global navigation/footer, specimen-page, catalog/card, sitemap,
  and related-record entry points.
- Add copy-link behavior and compact CSV/PNG exports.
- Confirm no global comparison basket or custom analytics was introduced.

### Stage 8 — complete verification and documentation

- Run unit/component, build, browser, accessibility, responsive, no-JavaScript,
  performance, and calibration audits.
- Update `project_overview.md`, `architecture.md`, `content_data_model.md`,
  `design_system.md`, `implementation_plan.md`, `project_status.md`, `AGENTS.md`,
  and the new ADR together with implemented behavior.
- Record exact evidence and the next owner gate.

## 20. Explicit non-goals

- No oblique-view calibration.
- No visitor-controlled per-layer resizing, rotation, distortion, or independent
  zoom.
- No automatic anatomical landmark matching or claims of shape similarity.
- No three-dimensional reconstruction, 360° interpolation, or AI-generated
  missing views.
- No more than five selected subjects or ten active view layers in this phase.
- No saved account collections, cross-route comparison basket, database, or
  server-side short links.
- No archival or unpublished photograph export; the field PNG uses public derivatives only.
- No custom analytics events for selections, measurements, or shared URLs.
- No use of ignored staging media, raw filenames, or inferred measurements at
  runtime.
- No claim that CSS pixels equal millimetres on a visitor's physical monitor.

## 21. Owner confirmation record

The owner confirmed every recommendation on 2026-09-11:

1. Use `/compare` and the public title `Compare skulls`.
2. Support both new ideas together: up to five selected subjects and up to ten
   active calibrated view layers.
3. Apply opacity per subject, not separately to every view layer.
4. Require explicit reviewed calibration spans for non-lateral views; use a
   diagonal span along one hemimandible for mandible images and exclude oblique.
5. Let the active difference pair control the class-aware measurement-row matrix
   while all selected subjects receive value columns.
6. Share subjects, active views, difference pair, comparable-only state, and a
   deterministic arrangement—but not freehand positions, opacity, or camera
   state—in the first URL format.
7. Keep data and field image exports compact, separate, and source-faithful.
8. Default an unparameterized page to SPEC-0001 versus the adult-human reference.

Implementation is authorized on `skull_comparison_page`. Publication, push,
pull request, merge, and deployment remain separate later decisions.
