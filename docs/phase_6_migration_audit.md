# Phase 6 complete migration audit

**Status:** Complete; owner-reviewed proposal applied to canonical content

**Audited:** 2026-09-08

## 1. Scope and release result

The audit reconciles the owner's updated ignored exports with the immutable Phase 3.1 public IDs, the canonical CSV contract, and the reviewed media inventory. The owner approved the amended proposal on 2026-09-08 and it now forms `content/specimens/specimens.csv`. Raw exports and PNG masters remain private staging evidence; normal builds never read them.

The updated inventory contains 22 taxon rows, 52 specimen rows, 12 separate bird-measurement rows, and 104 reviewed specimen PNGs. Every source row has one explicit disposition:

| Record type | Published mapping | Deferred: no reviewed media | Rejected | Total |
| --- | ---: | ---: | ---: | ---: |
| Taxa | 15 | 6 | 1 | 22 |
| Specimens | 18 | 31 | 3 | 52 |

No new reviewed image set was supplied. The release therefore retains the same 15 public taxa, 18 public specimens, 104 specimen images, stable IDs, defaults, and URLs. The 18 mapped specimens receive only reviewed metadata corrections; records without publishable media remain outside canonical public content.

## 2. Reviewed sources

| Evidence | SHA-256 / count | Role |
| --- | --- | --- |
| `agent_context/metadata_csv/taxa_raw.csv` | `fc02aea68e9fbcc24a0ab588e6b20c54654d81bb8bcd4dc36ec3b1bb4b867f8a`; 22 rows | Updated taxon identity evidence |
| `agent_context/metadata_csv/specimens_raw.csv` | `290025abb81d027efa7ee824432de646575018ffc880c7404ce0570585c74d26`; 52 rows after one spreadsheet-helper line | Updated specimen metadata evidence |
| `agent_context/metadata_csv/specimens_birds_measurements_raw.csv` | `a5a63152dfc60e1389be90027fd445c35f7ed0b553ca84556f61a842ede5076f`; 12 rows | Bird measurement evidence |
| `agent_context/skull_images_clean/` | 104 PNGs plus an ignored `.DS_Store` | Reviewed specimen-media masters |
| `scripts/phase-3-1-review-media-source-map.json` | 104 mappings | Existing raw-image to immutable specimen/view registration |

`scripts/phase-6-migration-audit.json` records the source fingerprints and every disposition. `pnpm migration:audit` fails when a source changes, a row is unaccounted for, a disposition is duplicated, a photographed specimen lacks a public mapping, the media inventory changes, or a published mapping lacks lateral media.

## 3. Published identity reconciliation

All existing public identities remain unchanged:

| Raw record | Canonical specimen | Canonical taxon |
| --- | --- | --- |
| *Nyctereutes procyonoides* `SPEC-0001` | `SPEC-0001` | `TAX-0001` |
| *Alca torda* 1 | `SPEC-0002` | `TAX-0002` |
| *Felis catus* 1 | `SPEC-0003` | `TAX-0003` |
| *Gavia* sp. 1 | `SPEC-0004` | `TAX-0004` |
| *Haematopus ostralegus* 1 | `SPEC-0005` | `TAX-0005` |
| *Larus* sp. 4 | `SPEC-0006` | `TAX-0006` |
| *Lepus europaeus* 1 | `SPEC-0007` | `TAX-0007` |
| *Martes foina* 1 | `SPEC-0008` | `TAX-0008` |
| *Meles meles* 1 | `SPEC-0009` | `TAX-0009` |
| *Meles meles* 3 | `SPEC-0010` | `TAX-0009` |
| *Morus bassanus* 2 | `SPEC-0011` | `TAX-0010` |
| *Mustela nivalis* 1 | `SPEC-0012` | `TAX-0011` |
| *Phoca vitulina* 1 | `SPEC-0013` | `TAX-0012` |
| *Phoca vitulina* 6 | `SPEC-0014` | `TAX-0012` |
| *Phoca vitulina* 7 | `SPEC-0015` | `TAX-0012` |
| *Talpa europaea* 1 | `SPEC-0016` | `TAX-0013` |
| *Uria aalge* 1 | `SPEC-0017` | `TAX-0014` |
| *Vulpes vulpes* 5 | `SPEC-0018` | `TAX-0015` |

The 15 linked taxa already have accepted dated GBIF snapshots. No new taxon is being published, so no unreviewed taxonomy result enters the release.

## 4. Applied metadata transformations

The first generated proposal contained 221 field-level changes across the 18 mapped specimens. The owner then supplied additional measurements, preparation facts, body-mass conversions, and record corrections in the ignored proposal. Those amendments were normalized, validated, and applied. Re-running `pnpm migration:prepare` now reports zero changes against canonical content.

### Directly retained or normalized

- Owner-corrected numeric skull measurements replace older values and fill newly supplied gaps. Separate bird measurements remain linked by scientific name plus legacy specimen number.
- Schema version 5 adds `postorbital_width_mm` with an adjacent status and makes `interorbital_width_mm` applicable to mammals as well as birds. These fields correspond to definitions 14 and 15 in the existing illustrated methodology.
- Explicit `M`/`F`, controlled age values, acquisition types, dates, coordinates, and uncertainty are normalized into canonical tokens. The source range `young_adult-adult` becomes `indeterminate` with the displayed detail “Estimated as between young adult and adult.”
- Owner locality text is converted into concise English public labels while the entered coordinates and exact/approximate states remain unchanged.
- Numeric missing-tooth counts remain exact non-negative counts, including zero. Counts are not invented where the cell is empty. Birds render the field as not applicable. The spreadsheet convention `skeleton_completeness: empty = no; yes = retained` becomes `none` or `full`.
- `burial` becomes an explicit defleshing token instead of the lossy `other` value. Maceration and soap/ammonia values are normalized to their existing controlled tokens.
- Durations recorded as weeks or months become approximate day counts; an explicit seven-day whitening duration becomes 168 measured hours.
- Rough source notes are published only when they can be converted into concise objective English observations. Subjective rankings, preparation shorthand, and causal diagnoses are omitted.
- At the owner's direction, the healed opening in the left mandible of `SPEC-0014` is recorded under trauma with a factual location/appearance description.
- Owner/media/specimen credit remains `Rasmus`; data and media remain `all_rights_reserved`.
- `species_name` and `specimen_id_raw` retain the owner's familiar taxon-plus-local-number crosswalk beside the immutable public `SPEC-####` identity. The compiler validates the crosswalk and never derives public IDs from dates, measurements, names, or row order.
- Prepared skull mass is the first skull-measurement pair in the canonical review order. Owner-supplied bird masses and added stone-marten measurements retain measured status.

### Deliberately not imported

- Raw body-mass values `8.05` and `8.6` were not guessed. The owner explicitly supplied their gram conversions as `8050` and `8600`, which are recorded as measured values for `SPEC-0010` and `SPEC-0018`.
- The `Talpa europaea` skull-mass value `<1` is an upper bound that the current scalar measurement model cannot represent faithfully, so it remains `not_recorded`.
- Blank pathology/trauma cells do not become `no`. Private-style or subjective notes do not become public prose.
- No missing coordinate, image, taxonomy field, date, or measurement is inferred.

## 5. Deferred specimen rows

Each row below remains ignored source evidence because no reviewed canonical media set exists. It receives no public ID or URL in this release.

| Raw specimen | Disposition |
| --- | --- |
| *Alca torda* 2 | Deferred: no reviewed media |
| *Cervus elaphus* 1 | Deferred: no reviewed media |
| *Larus* sp. 3 | Deferred: no reviewed media |
| *Larus* sp. 2 | Deferred: no reviewed media |
| *Larus* sp. 1 | Deferred: no reviewed media |
| *Martes foina* 3 | Deferred: no reviewed media |
| *Martes foina* 2 | Deferred: no reviewed media |
| *Martes martes* 1 | Deferred: no reviewed media |
| *Meles meles* 4 | Deferred: no reviewed media |
| *Meles meles* 2 | Deferred: no reviewed media |
| *Meles meles* 5 | Deferred: no reviewed media |
| *Meles meles* 6 | Deferred: no reviewed media |
| *Morus bassanus* 3 | Deferred: no reviewed media |
| *Morus bassanus* 1 | Deferred: no reviewed media |
| *Nyctereutes procyonoides* `SPEC-0002` | Deferred: no reviewed media |
| *Nyctereutes procyonoides* `SPEC-0003` | Deferred: no reviewed media |
| *Oryctolagus cuniculus* 1 | Deferred: no reviewed media |
| *Ovis aries* 1 | Deferred: no reviewed media |
| *Phoca vitulina* 9 | Deferred: no reviewed media |
| *Phoca vitulina* 8 | Deferred: no reviewed media |
| *Phoca vitulina* 5 | Deferred: no reviewed media |
| *Phoca vitulina* 4 | Deferred: no reviewed media |
| *Phocoena phocoena* 1 | Deferred: no reviewed media |
| *Sorex araneus* 1 | Deferred: no reviewed media |
| *Sorex araneus* 2 | Deferred: no reviewed media |
| *Vulpes vulpes* 6 | Deferred: no reviewed media |
| *Vulpes vulpes* 7 | Deferred: no reviewed media |
| *Vulpes vulpes* 4 | Deferred: no reviewed media |
| *Vulpes vulpes* 3 | Deferred: no reviewed media |
| *Vulpes vulpes* 2 | Deferred: no reviewed media |
| *Vulpes vulpes* 1 | Deferred: no reviewed media |

The associated deferred taxon identities are *Cervus elaphus*, *Martes martes*, *Oryctolagus cuniculus*, *Ovis aries*, *Phocoena phocoena*, and *Sorex araneus*. Existing public taxa with additional deferred individuals keep their current defaults.

## 6. Rejected rows

| Raw record | Decision | Reason |
| --- | --- | --- |
| `Cervidae` / specimen 1 | Rejected | A family-level row is not a supported terminal exhibit identity and no reviewed media exists. |
| *Phoca vitulina* 3 | Rejected | The owner source explicitly says the specimen was not retained. |
| *Phoca vitulina* 2 | Rejected | The owner source explicitly says the specimen was not retained. |

Rejected raw rows are not deleted from the owner's private evidence and their identifiers are not reused as public identity.

## 7. Publication result

The canonical specimen CSV was deliberately replaced with the approved validated candidate. The normal content/media gate confirms:

1. schema version 5 and the exact ordered CSV header;
2. all 18 published specimens and 15 public taxa compile;
3. every published record retains reviewed rights, credit, media, taxonomy, default, and permanent URL integrity;
4. the generated catalog, map, sitemap, Home statistics, and comparison eligibility reflect the corrected fields; and
5. all 31 deferred and three rejected specimen rows remain absent from public output.

The generated proposal and field diff remain ignored replaceable artifacts; after application the proposal is reproducible with zero differences. The raw exports and masters remain uncommitted.
