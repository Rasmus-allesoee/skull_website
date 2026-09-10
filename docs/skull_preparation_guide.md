# Skull preparation guide

Status: owner-feedback v1 overhaul and owner-directed condition-table refinements merged through PR #13 at `0e332ac` on 2026-09-08. A further owner-directed refinement is implemented locally on `preparation_guide_refinement` from `main` and remains pending owner review.

## Intent and visitor structure

`/guides/skull-preparation` is the permanent practical reference, linked from Home, the museum navigation, sitemap, and specimen preparation records. It covers intake; separation/skinning/trimming; maceration, dermestids, burial, above-ground decay and controlled heat; degreasing; optional whitening; teeth/jaw assembly; and dry storage/documentation. Other guides and later phases remain deferred.

- A five-stage illustrated workflow uses bounded cards, internal dividers, explicit `Move on when` outcomes and a separate basic-route callout. It exposes direct phase and method anchors; whitening remains optional, and recurring grease sends the visitor back to degreasing.
- A small sticky navigation strip opens a left-hand native modal contents drawer. Phase highlighting follows reading position; Escape/backdrop/Close return focus, while section navigation focuses the destination. A native contents disclosure serves visitors without JavaScript.
- Shared separation/skinning guidance stays visible. Method-specific tissue preparation and the five defleshing methods use native disclosures, as do the three degreaser procedures; hash and contents links open their target disclosure when JavaScript is available, while native summaries remain operable without it. Six semantic tables stack into labelled rows on phones. Practical safety, method choice, finish checks and first-person troubleshooting remain easy to scan.
- Existing dark neutral/brass tokens, readable line lengths, small workflow photographs and uncropped larger figures support reference reading. H1 is brass/bold, H2 is brass/regular and H3 is brass/italic as directed by the owner. No decorative animation or extra library is introduced.
- Inline citation numbers open one small native popover containing that source and its external link. The complete numbered reference list remains at the end for scanning and no-JavaScript fallback. The starting-condition table also supports validated internal guide links and six square AI-generated red-fox condition thumbnails. Each thumbnail uses a validated size-versioned direct asset URL so replacement derivatives cannot remain hidden behind a stale optimizer cache; without JavaScript it remains an ordinary image link and with JavaScript it progressively enhances to a native quick-preview dialog that closes from its outside backdrop and restores focus. The maceration brain-material and adipocere photographs use the same brass-underlined media-link pattern: JavaScript opens a native body-level lightbox, while the direct WebP link remains the no-JavaScript path. Maceration troubleshooting is an outer native disclosure containing collapsed case details, so the visitor sees only the case titles until a case is opened.

## Canonical sources and implementation

| Source | Responsibility |
| --- | --- |
| `content/guides/skull-preparation.mdx` | Reviewed beginner-facing text, stable headings/disclosures, workflow metadata, 22 references, review date and source-check status |
| `src/domain/guides/guide.ts` | Strict frontmatter and restricted MDX parser; typed block model; citation, anchor, workflow, table and syntax validation |
| `content/guides/preparation-media.json` | Sixteen editorial asset identities, public paths, descriptions, captions, credits, rights and explicit photograph/AI provenance |
| `scripts/preparation-media-source-map.json` | Maintenance-only mapping from ignored source masters |
| `scripts/process-preparation-media.ts` | `pnpm media:process:preparation`; sRGB, orientation-normalized, metadata-stripped WebP derivatives |
| `scripts/lib/preparation.ts` | Public media validation, used/declaration parity and guide compilation |
| `.generated/preparation-guide-v1.json` | Replaceable ignored build output; includes typed editorial media compatible with the relevant `MediaAsset` fields |
| `src/features/preparation/` | Server-rendered guide/figures/tables and the isolated client contents drawer |
| `src/components/Citations.tsx` and `PreparationGuide.tsx` | Shared reference list plus preparation-specific click-to-open citation cards |

The MDX dialect supports paragraphs, flat ordered/unordered lists, pipe tables, `##`–`####` headings with explicit `{#stable-id}`, validated internal links in the form `[label](#stable-id)`, preparation-media tokens in the form `![alt](asset:asset-id)`, descriptive preparation-media links in the form `[label](asset:asset-id)`, and only literal `<Figure asset="id" />`, `<Aside title="...">`, `<Details title="...">`, and `<Disclosure id="..." level="3|4" title="...">` blocks. Disclosures may contain non-nested Aside/Details callouts, but no container contains authored headings and disclosures cannot nest. There is no MDX execution, arbitrary HTML, import, expression or runtime network access. Guide reference years may be null and render as `n.d.` rather than inventing publication dates. Do not silently rename an existing anchor. Media links progressively enhance to native lightboxes and retain direct WebP destinations when JavaScript is unavailable.

Normal `content:build`, `validate:content`, and `validate:media` validate the guide or its public derivatives without reading `agent_context`. No schema or value in either collection CSV changes. This implements ADRs 0001–0003 within their accepted boundaries; no new ADR is needed.

## Content decisions and limits

- The text is written for a beginner who may have just found a first carcass. It gives direct procedures, ballpark timings, method pros/cons, finish checks and recovery steps instead of editorial caveats about what the guide does not do.
- First-person maceration, above-ground, detergent, developer, tooth and badger-jaw observations come from the owner. Community experience is credited to the supplied Reddit, Jake's Bones, BoneLust and baccyflap guides; scientific, museum and chemical-safety claims retain claim-level sources.
- Method-specific preliminary trimming replaces one false universal endpoint. Maceration guidance includes the owner's winter tight-lid practice with an explicit pressure-safe opening step, 10–30% retained-water estimate, useful temperature/time ranges, braincase and nasal-turbinate cleanup, and beginner tooth sorting as an optional tip.
- Beetle guidance explicitly says the owner has not used the method, then gives an actionable colony workflow from the supplied 2020 paper: enclosure, 23–29 °C range, approximate humidity, preparation, inspection, 3–10/20–30 day planning ranges and post-cleaning isolation.
- Burial gives depth, soil, optional recovery containers, scavenger protection and excavation. Above-ground decay includes the owner's weighted rodent-cage experience, dig-under risk, shade and added moisture. Controlled heat explains delayed grease return and gives source-labelled size ranges.
- Dish detergent is the accessible first choice and records the owner's approximate 1:10–1:20 use. The comparison now states why each degreaser is chosen; ammonia and acetone procedures explain concentration, compatible equipment, glove, ventilation and waste terms rather than naming them without context.
- Whitening is framed as normally manageable on sound bone when dilute and monitored. Plain 3% peroxide remains the beginner choice; the owner's developer recipe is corrected to one part 12% product with four to six parts water, approximately 1.7–2.4% before formulation uncertainty. Chlorine bleach remains excluded.
- Tooth replacement now includes a small, local acetone procedure for a wrongly super-glued tooth. Scientific recordkeeping is an optional callout, not a universal requirement.
- Maceration troubleshooting now opens as a mini-guide of case titles. The adipocere case explains what the white wax is, why a wet/low-oxygen bath can produce it, practical prevention through fleshing, active warmth and partial water changes, and a cautious removal sequence through degreasing, hand scrubbing, compatible ammonia use and optional experienced-only power tools. The owner’s brain-material and adipocere photographs are linked at the point of need rather than displayed in the reading flow. OddArticulations is included as a reviewed practitioner source alongside the existing degreasing and adipocere references.
- The short possession, disease and chemical-disposal checks remain because the repository requires current review for those claims; they are actionable and do not interrupt each method with meta-commentary.

## Images and provenance

Nine owner-authorized photographs, one generated degreasing illustration, and six generated red-fox condition illustrations are curated as sixteen WebPs under `public/media/preparation/`, maximum 1600 px longest edge and 750 kB per asset, with no EXIF/GPS/ICC/IPTC/XMP. The feedback-supplied oily-patch photograph appears at the start of degreasing. The brain-material and adipocere photographs are linked from the troubleshooting prose and open in a progressive lightbox; they are not additional figures in the reading flow. Processing preserves the full aspect ratio. Workflow previews may crop decoratively; detailed figures and condition thumbnails preserve their source framing. AI provenance is visible in the condition-table note and quick-preview captions. The original whole-body photograph is not needed and remains unused staging context.

The two new owner-photo sources are `agent_context/preparation_page/prep_skull_brain_gunk.png` and `agent_context/preparation_page/prep_skull_adipocere.jpg`. They remain ignored staging input; only the metadata-stripped `brain-gunk.webp` and `adipocere.webp` derivatives are public. The revised prose also links the reviewed OddArticulations [maceration](https://oddarticulations.com/maceration101/) and [adipocere](https://oddarticulations.com/adipocere101/) pages for the relevant practitioner guidance.

No separate owner photograph of the Fanola bottle was present in the supplied preparation staging directory on 2026-09-07. The existing cream-developer treatment photograph remains beside the corrected first-person product text; do not scrape a retailer image with unreviewed publication rights. Add a future owner-supplied bottle photograph through the same media pipeline when available.

The degreasing illustration was made with the built-in image generation tool and visually checked: one open tub, submerged flesh-free skull, detergent bottle, no sealed lid or heater. It is labelled in both workflow and figure, and is not an anatomical reference or evidence from this collection. Its curated path is `public/media/preparation/degreasing.webp`; the master remains ignored at `agent_context/preparation_page/degreasing-illustration.png`.

The six condition thumbnails were generated as a coherent square set for *Vulpes vulpes*: a fresh body, fresh/frozen head, partly decomposed head, dry/mummified head, greasy bare skull and clean grease-free skull. Their curated paths are `condition-fresh-body.webp`, `condition-fresh-head.webp`, `condition-partly-decomposed-head.webp`, `condition-mummified-head.webp`, `condition-greasy-skull.webp`, and `condition-clean-skull.webp`; their generated PNG masters remain ignored under `agent_context/preparation_page/`. They are intentionally labelled as AI-generated visual cues rather than collection evidence.

Generation prompt:

> Use case: scientific-educational. Asset type: one landscape editorial illustration for the degreasing phase of an animal skull preparation guide. Show a flesh-free small canid skull fully submerged in slightly cloudy water in an open translucent rectangular polypropylene tub, on a dark neutral work surface; an unbranded clear dishwashing detergent bottle stands beside it. A few small soap bubbles at the water edge, not a thick foam blanket. Muted natural bone, charcoal and restrained warm neutral palette consistent with real preparation photographs. Clean realistic illustrative rendering, clearly an educational illustration rather than documentary evidence. Three-quarter view from above, complete tub and skull in frame. No text, no arrows, no logos, no hands, no fire, no heating element, no sealed lid, no chemicals being mixed. The illustration explains the bath setup, not species identification or exact anatomy.

## Acceptance and next step

The owner-feedback v1 gate and condition-table refinement gate passed locally on 2026-09-07. The refinement gate on `preparation_guide_refinement` adds parser coverage for descriptive media links, two owner-photo lightboxes, the five-case troubleshooting mini-guide and updated source references. Exact repository, browser and visual evidence is recorded in `project_status.md`; the branch remains local pending owner desktop/mobile review.

The Preparation milestone is public-release scope and remains covered by the repository-wide release gate.
