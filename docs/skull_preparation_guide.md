# Skull preparation guide

Status: implemented and verified locally on 2026-09-06; owner product review pending. No remote publication authorized.

## Intent and visitor structure

`/guides/skull-preparation` is the permanent practical reference, linked from Home, the museum navigation, sitemap, and specimen preparation records. It covers intake; separation/skinning/trimming; maceration, dermestids, burial, above-ground decay and controlled heat; degreasing; optional whitening; teeth/jaw assembly; and dry storage/documentation. Other guides and later phases remain deferred.

- A five-stage illustrated workflow exposes direct phase and method anchors and the outcome needed before moving on. Whitening is explicitly optional; recurring grease sends the visitor back to degreasing.
- A small sticky navigation strip opens a left-hand native modal contents drawer. Phase highlighting follows reading position; Escape/backdrop/Close return focus, while section navigation focuses the destination. A native contents disclosure serves visitors without JavaScript.
- Complete prose stays visible. Four semantic comparison tables stack into labelled rows on phones; three native disclosures hold supplementary troubleshooting/detail. Practical safety and completion checks remain visible.
- Existing dark neutral/brass tokens, restrained headings, readable line lengths, small workflow photographs and uncropped larger figures support reference reading. No decorative animation or extra library is introduced.

## Canonical sources and implementation

| Source | Responsibility |
| --- | --- |
| `content/guides/skull-preparation.mdx` | Reviewed text, stable headings, workflow metadata, 13 references, review date and source-check status |
| `src/domain/guides/guide.ts` | Strict frontmatter and restricted MDX parser; typed block model; citation, anchor, workflow, table and syntax validation |
| `content/guides/preparation-media.json` | Seven editorial asset identities, public paths, descriptions, captions, credits, rights and explicit photograph/AI provenance |
| `scripts/preparation-media-source-map.json` | Maintenance-only mapping from ignored source masters |
| `scripts/process-preparation-media.ts` | `pnpm media:process:preparation`; sRGB, orientation-normalized, metadata-stripped WebP derivatives |
| `scripts/lib/preparation.ts` | Public media validation, used/declaration parity and guide compilation |
| `.generated/preparation-guide-v1.json` | Replaceable ignored build output; includes typed editorial media compatible with the relevant `MediaAsset` fields |
| `src/features/preparation/` | Server-rendered guide/figures/tables and the isolated client contents drawer |
| `src/components/Citations.tsx` | Shared profile/guide `[cite:key]` links and one numbered reference list |

The MDX dialect supports paragraphs, flat ordered/unordered lists, pipe tables, `##`–`####` headings with explicit `{#stable-id}`, and only literal `<Figure asset="id" />`, `<Aside title="...">`, and `<Details title="...">` blocks. Containers cannot nest or contain headings. There is no MDX execution, arbitrary HTML, import, expression or runtime network access. Guide reference years may be null and render as `n.d.` rather than inventing publication dates. Do not silently rename an existing anchor.

Normal `content:build`, `validate:content`, and `validate:media` validate the guide or its public derivatives without reading `agent_context`. No schema or value in either collection CSV changes. This implements ADRs 0001–0003 within their accepted boundaries; no new ADR is needed.

## Content decisions and limits

- First-person notes are adapted from the owner's supplied brief and describe collection experience; they are not independent trials or universal protocols. External claims use the existing citation convention with one reference list at the end.
- Source checking is an editorial review, not professional certification. Historical museum recipes establish context but do not override current product safety guidance. Aqueous detergent is the practical first choice; ammonia and acetone remain described specialist alternatives without invented household dilution recipes.
- Replace airtight maceration/periodic venting advice with a non-pressurizing cover. Briefly lifting a lid does not reliably aerate the bath. Blackening alone does not diagnose a mechanism; wax is not guaranteed to disappear with ventilation or peroxide.
- Preserve approximate fox timing observations as observations. No universal temperature optimum, species/age degreasing timetable, or concentration-to-whitening-time rule was supported well enough to assert one.
- Explain both interpretations of “80% water”; do not claim a measured concentration for the collector's cream-developer baths. Omit a volatile product price. Prefer a known dilute aqueous peroxide starting point, optional whitening, and condition-based stopping.
- Distinguish the mandibular symphysis from the jaw joints. Retain the owner's super-glue/badger observations while presenting separate storage and conservation adhesives as alternatives.
- Do not promote soil disposal, routine disease decontamination, or jurisdiction-specific collection permission. The reader must establish the applicable collection and waste route locally.

## Images and provenance

Six owner-authorized photographs and one generated illustration are curated as seven WebPs under `public/media/preparation/`, maximum 1600 px longest edge and 750 kB per asset, with no EXIF/GPS/ICC/IPTC/XMP. Processing preserves the full aspect ratio. Workflow previews may crop decoratively; detailed figures preserve anatomy. The original whole-body photograph is not needed and remains unused staging context.

The degreasing illustration was made with the built-in image generation tool and visually checked: one open tub, submerged flesh-free skull, detergent bottle, no sealed lid or heater. It is labelled in both workflow and figure, and is not an anatomical reference or evidence from this collection. Its curated path is `public/media/preparation/degreasing.webp`; the master remains ignored at `agent_context/preparation_page/degreasing-illustration.png`.

Generation prompt:

> Use case: scientific-educational. Asset type: one landscape editorial illustration for the degreasing phase of an animal skull preparation guide. Show a flesh-free small canid skull fully submerged in slightly cloudy water in an open translucent rectangular polypropylene tub, on a dark neutral work surface; an unbranded clear dishwashing detergent bottle stands beside it. A few small soap bubbles at the water edge, not a thick foam blanket. Muted natural bone, charcoal and restrained warm neutral palette consistent with real preparation photographs. Clean realistic illustrative rendering, clearly an educational illustration rather than documentary evidence. Three-quarter view from above, complete tub and skull in frame. No text, no arrows, no logos, no hands, no fire, no heating element, no sealed lid, no chemicals being mixed. The illustration explains the bath setup, not species identification or exact anatomy.

## Acceptance and next step

Require parser/media validation; existing full repository checks; production build; desktop/mobile keyboard, drawer, hash links/history, reference links, comparison reflow, reduced motion, forced colors, image-failure and no-JavaScript checks; and manual production visual inspection. Exact results belong in `project_status.md`.

Gate passed: 76 unit/component tests, six invalid-fixture checks, 77 prerendered routes, 76 Chromium regression journeys, and five final focused guide journeys after restoring visible procedure numbers. Responsive/keyboard/static/axe/manual checks passed; see `project_status.md` for exact evidence.

After the verified local commit, the owner reviews this page. Do not push, open a PR, merge, deploy, or begin another phase.
