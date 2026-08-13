# Design system

**Status:** Phase 2 representative system implemented; owner approval pending

**Last reviewed:** 2026-08-13

## 1. Design intent

Skull Collection should feel like a contemporary dark natural-history museum: quiet, exact, spacious, and photographic. It is not gothic, macabre, occult, tactical, or game-like. Bone, specimen labels, archival dividers, and dark exhibition space inform the language without turning it into imitation parchment or a themed prop.

The system must support two simultaneous modes:

- **Exhibit mode:** large imagery, editorial hierarchy, generous negative space.
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

- **Newsreader:** display headings, exhibit titles, editorial introductions, scientific-name emphasis.
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
| Exhibit display | `clamp(2.75rem, 7vw, 7rem)` | Short home/taxon statements only |
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
- wide exhibit shell: up to approximately 100rem.

Gallery grids use CSS Grid with minimum card widths and no hard-coded item count. Reference tables become definition lists/cards on narrow screens rather than horizontal overflow by default.

Responsive checkpoints are content-derived, with explicit QA at:

- 360 and 390 px phones;
- 768 px tablet portrait;
- 1024–1280 px laptop/tablet landscape; and
- 1440 px and wider exhibit displays.

## 6. Shape, borders, depth, and texture

- Radii are restrained: 2–4 px for labels/images, 6–10 px for interactive surfaces/dialogs. Avoid pill-shaped containers except compact statuses or removable filter chips.
- Borders are usually 1 px and low contrast; grouping primarily uses spacing.
- Shadows are soft, broad, and nearly black. Avoid floating-card stacks.
- A subtle radial light may sit behind a transparent skull. It must not create a visible halo around poor alpha edges.
- Fine archival rules, index numbers, and specimen labels are allowed when functional.
- Do not use paper textures, blood-red accents, faux damage, heavy grain, or decorative skeleton motifs.

## 7. Photography treatment

- Transparent skull cutouts sit on the dark field with the specimen's own contours preserved.
- Lateral images lead catalog cards and exhibit heroes.
- Subject bounds generated by the media compiler support consistent perceived scale and centering; they do not imply calibrated anatomical scale.
- Never crop anatomy to fill a card unless the context is explicitly a decorative preview with a separate complete view.
- Image containers preserve room for long rostra, antlers/horns if later present, and separated mandibles.
- The active gallery image is eager/high priority only when above the fold. Other views and related cards lazy-load.
- Zoom shows real additional resolution and retains credit/caption context.
- A placeholder is a quiet framed state with view/status text, never a generic broken-image icon.

## 8. Iconography and diagrams

- Use one simple line-icon family or custom SVGs with consistent 1.5–2 px optical stroke.
- Icons never replace unfamiliar labels.
- Measurement diagrams use a consistent accessible skull outline, keyed lines, numbered/labelled landmarks, and text descriptions.
- Taxonomy diagrams prioritize readable hierarchy over decorative branching.
- Map marker differences combine shape/icon, label, and text—not color alone.

## 9. Core components

### Global shell

- **Skip link:** first focusable item, visibly enters above navigation.
- **Site header:** working title, primary navigation, search entry/action, active-page state, mobile menu.
- **Footer:** project purpose, supporting pages, rights summary, contact, source/version where appropriate.
- **Page intro:** eyebrow/breadcrumb, title, concise purpose, optional actions.

### Discovery

- **Global search:** labelled combobox with grouped rank/taxon/specimen suggestions, result type, names, and keyboard instructions.
- **Filter panel:** semantic fieldsets, explicit units, applied-filter summary, reset, URL state.
- **Result mode switch:** radio/toggle semantics with “Species” and “Specimens,” not unlabeled icons.
- **Taxonomy index:** scannable nested rank links; collapses thoughtfully on mobile without hiding current context.
- **Taxon card:** lateral image, names, rank/confidence when needed, count/range, complete link target.
- **Specimen card:** lateral image, names, immutable ID, relevant measurements, location/date summary.

### Exhibit

- **Gallery:** main figure, labelled thumbnails, previous/next, swipe, arrow keys, view label, completeness state.
- **Zoom dialog:** true modal semantics, initial/return focus, Escape, constrained pan/zoom controls, reduced-motion behavior.
- **Specimen selector:** current specimen and concise alternative list; preserves taxon context.
- **Taxonomy breadcrumb:** ordered hierarchy with current-page semantics.
- **Status badge:** text-first qualifier/confidence/precision—not a color dot.
- **Measurement panel:** definition list/table plus diagram and canonical units.
- **Preparation timeline:** semantic ordered list; unknown dates/durations do not break order.
- **Citation list:** stable keys/backlinks, readable metadata, external-link indication.
- **Related taxa:** small image cards with relationship explanation.

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

## 14. Design tokens in code

Semantic tokens live in the global CSS layer and may be exposed to Tailwind. Component code should prefer names such as `bg-surface`, `text-muted`, and `border-subtle` over raw hex values. Raw palette values belong only in the token definition, tests/visual documentation, or exceptional data visualization calculations.

Token changes are reviewed against all core page families and accessibility states. A new one-off raw value is a signal to revisit the system, not an automatic new token.

## 15. Phase 2 visual-direction gate

The representative raccoon-dog vertical slice must demonstrate and receive user approval for:

- dark exhibit field and photography treatment;
- display/sans hierarchy with real self-hosted fonts;
- taxon/specimen naming and confidence treatment;
- gallery desktop/mobile composition and controls;
- measurement panel and anatomical diagram direction;
- metadata density/progressive disclosure;
- preparation timeline;
- focus, reduced-motion, empty/missing states; and
- performance with real processed assets.

That gate happens before the design scales to the shell/catalog. Material changes update this document and, when cross-cutting, an ADR.

Implementation evidence on 2026-08-13: the real six-view exhibit was inspected at 1440 px, 390 px, and 360 px; all canonical views, zoom/focus return, keyboard and pointer selection, reduced motion, no-JavaScript core content, missing-value language, and responsive image delivery passed the technical checks. The visual gate remains open only for the owner's explicit approval (and any requested refinements) before Phase 3.

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
