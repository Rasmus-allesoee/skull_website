# Design system

**Status:** Phase 2.2 representative system implemented; owner re-review pending

**Last reviewed:** 2026-08-16

## 1. Design intent

Skull Collection should feel like a contemporary dark natural-history museum: quiet, exact, spacious, and photographic. It is not gothic, macabre, occult, tactical, or game-like. Bone, specimen labels, archival dividers, and dark exhibition space inform the language without turning it into imitation parchment or a themed prop.

The system must support two simultaneous modes:

- **Display mode:** large imagery, editorial hierarchy, generous negative space.
- **Reference mode:** compact, aligned labels, filters, taxonomy, measurements, and citations.

Components should move between those modes without creating two visual products.

## 2. Principles

1. **Image first, never image only.** Photography leads; names, states, rights, and controls remain available.
2. **Calm hierarchy.** Scale, spacing, and contrast establish order before borders, boxes, or ornament.
3. **Bone is the brightest object.** UI surfaces should not compete with pale transparent specimens.
4. **Archival precision.** Labels, numeric alignment, captions, and dividers feel deliberate and consistent.
5. **Meaning survives presentation.** Color, hover, spatial position, transparency, and motion are supplementary cues.
6. **Honest states.** Draft, uncertain, approximate, not recorded, and not applicable each have explicit text.
7. **Restraint earns delight.** Motion and dramatic scale are concentrated in the gallery, not scattered across controls.

## 3. Color tokens

Initial approved dark-only palette:

| Semantic token | Value | Use |
|---|---:|---|
| `--color-bg` | `#0B0D0C` | Page background and deepest gallery field |
| `--color-surface` | `#141816` | Cards, navigation, filter regions |
| `--color-surface-elevated` | `#1C211E` | Popovers, dialogs, selected layers |
| `--color-text` | `#E8E1D3` | Primary headings/body; “bone” tone |
| `--color-text-muted` | `#A6A299` | Secondary labels and captions |
| `--color-border` | `#343A36` | Fine structural dividers |
| `--color-accent` | `#B79A68` | Brass interaction accent and focus companion |
| `--color-data` | `#71958A` | Verdigris charts, exact/verified data cue |
| `--color-danger` | `#D18A7A` | Errors/destructive warnings |
| `--color-warning` | `#D0AE6A` | Incomplete/approximate warnings |
| `--color-success` | `#79A58A` | Confirmed completion state |

Derived interaction tokens must be tested rather than created through arbitrary opacity:

- primary link and hover;
- focus ring and focus offset;
- selected surface/border;
- disabled foreground/background;
- overlay/scrim;
- exact and approximate map markers; and
- data visualization sequences.

Text and controls must meet WCAG 2.2 AA contrast. Large skull imagery does not excuse weak UI contrast. Avoid pure white and pure black except where a technical image edge requires them.

## 4. Typography

### Families

- **Newsreader:** display headings, specimen titles, editorial introductions, scientific-name emphasis.
- **IBM Plex Sans:** navigation, controls, labels, body copy, tables, measurements, code-like IDs.

Both are self-hosted from pinned Fontsource packages as reviewed licensed WOFF2 assets; runtime font downloads are not allowed. Licence notices live in `docs/licenses/`. Use semantic fallback stacks after the named local face:

```css
--font-display: Newsreader, Iowan Old Style, Palatino Linotype, Georgia, serif;
--font-sans: IBM Plex Sans, Inter, ui-sans-serif, system-ui, sans-serif;
```

### Scale

Use fluid sizes within bounded ranges rather than breakpoint jumps.

| Role | Suggested range | Notes |
|---|---|---|
| Specimen display | `clamp(2.75rem, 7vw, 7rem)` | Short home/taxon statements only |
| Page title | `clamp(2.25rem, 5vw, 4.75rem)` | Editorial display face |
| Section title | `clamp(1.6rem, 3vw, 2.6rem)` | Clear page landmarks |
| Card title | `1.125–1.375rem` | Common name; two-line maximum |
| Body | `1rem–1.125rem` | 1.55–1.7 line height |
| Label | `0.75–0.875rem` | Sans, modest tracking, never tiny |
| Measurement | `1rem–1.25rem` | Tabular numbers and aligned units |

Scientific names use semantic emphasis/appropriate styling, not manual asterisks in data fields. IDs and measurements use tabular numerals. Uppercase is reserved for short archival labels; never uppercase long headings or body text.

## 5. Spacing, width, and grid

Base spacing progression: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` px. Components use semantic aliases so values can evolve:

- compact control gap: 8–12 px;
- card internal gap: 16–24 px;
- section gap: 64–128 px depending on viewport;
- page gutter: `clamp(1rem, 4vw, 4rem)`;
- readable prose width: 65–72 characters;
- data panel width: approximately 34–46rem;
- wide specimen-display shell: up to approximately 100rem.

Gallery grids use CSS Grid with minimum card widths and no hard-coded item count. Reference tables become definition lists/cards on narrow screens rather than horizontal overflow by default.

Responsive checkpoints are content-derived, with explicit QA at:

- 360 and 390 px phones;
- 768 px tablet portrait;
- 1024–1280 px laptop/tablet landscape; and
- 1440 × approximately 696 normal-browser desktop as the primary wide specimen target, plus 1440 × 900 and wider/taller displays.

## 6. Shape, borders, depth, and texture

- Radii are restrained: 2–4 px for labels/images, 6–10 px for interactive surfaces/dialogs. Avoid pill-shaped containers except compact statuses or removable filter chips.
- Borders are usually 1 px and low contrast; grouping primarily uses spacing.
- Shadows are soft, broad, and nearly black. Avoid floating-card stacks.
- A subtle radial light may sit behind a transparent skull. It must not create a visible halo around poor alpha edges.
- Fine archival rules, index numbers, and specimen labels are allowed when functional.
- Do not use paper textures, blood-red accents, faux damage, heavy grain, or decorative skeleton motifs.

## 7. Photography treatment

- Transparent skull cutouts sit on the dark field with the specimen's own contours preserved.
- Lateral images lead catalog cards and specimen heroes.
- Subject bounds generated by the media compiler support precise centering/cropping of transparent canvas margins. Only the dedicated comparison combines those bounds with recorded maximum length and one shared scale to imply calibrated relative anatomical size.
- Never crop anatomy to fill a card unless the context is explicitly a decorative preview with a separate complete view.
- Image containers preserve room for long rostra, antlers/horns if later present, and separated mandibles.
- The active gallery image is eager/high priority only when above the fold. Other views and related cards lazy-load.
- Gallery presentation uses the validated full-resolution master and its subject-bounds view box for the active image; never enlarge a small responsive derivative until it becomes visibly soft or blocky. Thumbnails may use lightweight responsive variants.
- Zoom shows the original validated 3200 px WebP, real additional resolution, and retained `Photo:`/rights context.
- A placeholder is a quiet framed state with view/status text, never a generic broken-image icon.

## 8. Iconography and diagrams

- Use one simple line-icon family or custom SVGs with consistent 1.5–2 px optical stroke.
- Icons never replace unfamiliar labels.
- Measurement guidance uses text definitions until the owner supplies real-skull landmark imagery for a cited methodology page. Do not ship a generic outline that is too ambiguous to teach the landmarks.
- Taxonomy diagrams prioritize readable hierarchy over decorative branching.
- Map marker differences combine shape/icon, label, and text—not color alone.

## 9. Core components

### Global shell

- **Skip link:** first focusable item, visibly enters above navigation.
- **Site header:** working title, primary navigation, search entry/action, active-page state, mobile menu.
- **Footer:** a quiet global copyright notice; add purpose, supporting links, or contact only when those destinations are real.
- **Page intro:** eyebrow/breadcrumb, title, concise purpose, optional actions.

### Discovery

- **Global search:** labelled combobox with grouped rank/taxon/specimen suggestions, result type, names, and keyboard instructions.
- **Filter panel:** semantic fieldsets, explicit units, applied-filter summary, reset, URL state.
- **Result mode switch:** radio/toggle semantics with “Species” and “Specimens,” not unlabeled icons.
- **Taxonomy index:** scannable nested rank links; collapses thoughtfully on mobile without hiding current context.
- **Taxon card:** lateral image, names, rank/confidence when needed, count/range, complete link target.
- **Specimen card:** lateral image, names, immutable ID, relevant measurements, location/date summary.

### Specimen display

- **Gallery:** complete main figure, labelled thumbnails, previous/next, direct selection, focused arrow/Home/End keys, swipe, desktop double-click, touch double-tap, concise interaction hints, view label, and completeness state. At the primary 1440 × approximately 696 normal-browser viewport, a taller frame and enlarged alpha-bounded subject retain complete anatomy while the stage-top position still leaves all three controls visible; 1440 × 900 remains equally usable.
- **Gallery optical alignment:** Alpha bounds provide deterministic framing, but a canonical view may receive a small, view-specific presentation offset when the specimen's visible mass is optically asymmetric inside those bounds. The Phase 2 lateral hero shifts downward only at desktop-height layouts; this must not alter source pixels, comparison calibration, inspection, thumbnails, or other views.
- **Responsive view rail:** same vertical extent and image-frame proportion as the main stage, right of the image on desktop and mobile landscape, independently scrollable when the set exceeds its height; below the image in mobile portrait.
- **Inspection dialog:** symmetric full-viewport native modal; original high-resolution asset; initial/return focus; Escape; wheel/trackpad/desktop-pinch and native touch-pinch zoom without background scroll/page zoom; constrained mouse/touch drag; slider, buttons, keyboard shortcuts, view navigation at all zoom levels, and reduced-motion behavior. Command/Ctrl is not required.
- **Specimen selector:** current specimen and concise alternative list; preserves taxon context.
- **Taxonomy breadcrumb:** ordered hierarchy with current-page semantics.
- **Status badge:** text-first qualifier/confidence/precision—not a color dot.
- **Measurement panel:** compact primary table directly below its heading/note, progressively disclosed additional values, canonical units, and measurement-guide dialog. At wide widths it occupies the left third and the scale comparison occupies the remaining space; sections stack without horizontal overflow at narrow widths.
- **Scale comparison:** vertically stacked lateral skulls share one mathematically calibrated maximum-length scale. The current specimen stays primary; an adult-human reference is the default comparison. Preserve full morphology, use compiled subject bounds rather than transparent canvas width, flip only in presentation when orientation differs, and label approximate reference values.
- **Comparison selector:** restrained `Compare` action opening a labelled searchable combobox/listbox; references first, current specimen excluded, keyboard navigation, clear empty state, easy return to the adult-human default, focus restoration, and live announcement of selection.
- **Measurement differences:** compact six-row table to the right of the skull pair at wide widths and below it when constrained. The current specimen is always the comparison numerator. Absolute wording states longer/shorter, wider/narrower, higher/lower, or heavier/lighter; a restrained semantic color is supplementary; ratio uses sensible precision.
- **Collection record:** `Metadata` kicker; owner, source, date, location/precision, sex, age, and condition; reference dialogs for age and the five-level condition scale; pathology, trauma, teeth set, and retained skeleton in one additional-data disclosure.
- **Preparation timeline:** semantic ordered list; unknown dates/durations do not break order.
- **Guide dialog:** native modal semantics, labelled close control, left-aligned title/note, single-line desktop title where space permits, scrollable table, mobile row cards, Escape, and focus restoration.
- **Citation list:** stable keys/backlinks, readable metadata, external-link indication.
- **Related taxa:** after Phase 3 has enough content, up to three same-family cards and up to three deterministic collection-wide cards; current/duplicate taxa excluded and empty groups omitted.

### Map and editorial

- **Map canvas:** labelled region with instructions and controls.
- **Map result list:** complete semantic equivalent; selection synchronized without stealing focus.
- **Map popup/card:** image, names, ID, locality/precision, exact link.
- **Article shell:** breadcrumb, title/summary, metadata, table of contents, prose, figures, citations.
- **Callout:** information, caution, or safety state with explicit heading/icon/text.

## 10. Interaction states

Every component specifies:

- default, hover, focus-visible, active/pressed, selected/current;
- disabled only when the reason is perceivable;
- loading/skeleton only when real latency exists;
- empty and no-results recovery;
- warning/incomplete/approximate;
- validation error with recovery guidance; and
- offline/external-resource failure where relevant.

Do not show false skeletons on statically available content. Avoid disabled navigation to unpublished routes; omit it or label it honestly during development.

## 11. Motion

- Standard transition duration: 150–300 ms.
- Animate opacity and transform when possible; avoid layout-shifting height animations around content.
- Gallery crossfades may clarify view changes but cannot hide selected state.
- Map movement follows direct user intent and offers a reset; deep-link focus should not create repeated animation.
- No parallax, continuous floating, cursor effects, autoplay rotation, or decorative looping.
- Under `prefers-reduced-motion: reduce`, remove smooth scrolling, large transforms, crossfades, and nonessential transitions.

## 12. Accessibility requirements

- Target WCAG 2.2 AA.
- Preserve semantic headings, landmarks, lists, tables/definition lists, figures, captions, and buttons/links.
- Minimum touch target generally 44 × 44 CSS px; compact exceptions must retain adequate spacing and meet WCAG criteria.
- Focus ring is high contrast and not clipped by overflow.
- Visible labels remain available; placeholders are examples, not labels.
- Dialogs trap and restore focus; popovers/menus close predictably.
- Gallery order, selected view, zoom state, filter counts, result updates, and map precision are exposed to assistive technology without noisy announcements.
- Do not duplicate long alt text and adjacent captions. Describe the image's purpose in context.
- Charts/diagrams include text equivalents and map data includes a complete list.
- Test 200% zoom, browser text resizing, forced colors where practical, reduced motion, keyboard-only use, and screen-reader landmarks.

## 13. Content and voice

The writing voice is calm, precise, factual, and welcoming.

- Prefer common direct words over institutional filler.
- Use “Not recorded,” “Not applicable,” “Approximate location,” and “Identification uncertain” consistently.
- Do not sensationalize death, roadkill, decomposition, or chemicals.
- Distinguish specimen observation from general species fact.
- Italicize scientific genus/species names; do not italicize higher ranks or common names.
- Give units with values and define measurement landmarks.
- Buttons use actions (“Explore species,” “View specimen,” “Clear filters”), not vague “Learn more” repetitions.
- External links and downloads say what opens.
- Use `display` in public copy rather than `exhibit`. Use `Photo:` rather than `Photography by`. Avoid decorative subtitles such as “Six-view study” and formulaic phrases such as “From specimen to exhibit.”
- Brass section kickers remain provisional. Preserve `Mammalia · Carnivora` and `Physical specimen`; reassess the other kickers after the stable release because several repeat or misclassify the heading below them.

## 14. Design tokens in code

Semantic tokens live in the global CSS layer and may be exposed to Tailwind. Component code should prefer names such as `bg-surface`, `text-muted`, and `border-subtle` over raw hex values. Raw palette values belong only in the token definition, tests/visual documentation, or exceptional data visualization calculations.

Token changes are reviewed against all core page families and accessibility states. A new one-off raw value is a signal to revisit the system, not an automatic new token.

## 15. Phase 2 visual-direction gate

The representative raccoon-dog vertical slice must demonstrate and receive user approval for:

- dark image field and photography treatment;
- display/sans hierarchy with real self-hosted fonts;
- taxon/specimen naming and confidence treatment;
- gallery desktop/mobile composition and controls;
- measurement panel, calibrated human/collection comparison, dynamic difference table, selector, and measurement-guide direction;
- metadata density/progressive disclosure;
- preparation timeline;
- focus, reduced-motion, empty/missing states; and
- performance with real processed assets.

That gate happens before the design scales to the shell/catalog. Material changes update this document and, when cross-cutting, an ADR.

Initial implementation evidence on 2026-08-13 led to the owner's detailed Phase 2.1 review. The 2026-08-14 refinement added the responsive rail, true-resolution inspector, working touch gestures, measurement-first hierarchy, and record guidance. Phase 2.2 on 2026-08-15 retunes the gallery for a common shorter normal-Chrome viewport, uses alpha-bounded full-resolution display, closes inspector/background gesture conflicts and the network-mobile reload defect, introduces the reusable true-to-scale comparison/difference system, and corrects metadata/dialog alignment. Automated and manual evidence is recorded in `project_status.md`; the gate remains open for owner approval before Phase 3.

## 16. Design anti-patterns

- Generic SaaS dashboard cards and gradients.
- Gothic display fonts, blackletter, horror red, occult decoration, or faux parchment.
- Tiny all-uppercase gray metadata.
- Image carousels without direct view selection or keyboard state.
- Controls that appear only on hover.
- Important facts hidden behind unlabeled icons or tooltips.
- Numerous nested bordered boxes where spacing could express hierarchy.
- Uncalibrated skulls visually overlaid as if dimensions were comparable.
- Animation that delays reading or ignores reduced motion.
- Accessibility overlays in place of correct components.
