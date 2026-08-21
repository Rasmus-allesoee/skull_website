# Phase 3.1 review-slice migration audit

**Status:** Implemented review slice; final Phase 6 migration audit still required

**Audited:** 2026-08-21

## 1. Scope

Phase 3.1 uses the owner's partial spreadsheet exports and cleaned image sets to make the catalog visually reviewable without claiming that the final Phase 6 migration is complete. Raw exports and PNG masters remain ignored staging evidence. Only normalized canonical CSV rows, reviewed taxonomy snapshots, media declarations, and validated public WebP derivatives enter the repository.

The inventory found 22 legacy taxon rows, 51 specimen rows, and 104 cleaned PNGs. The images form 18 physical specimen sets representing 15 taxon identities. Of those identities, 13 are species-level and two are deliberately genus-level (`Gavia sp.` and `Larus sp.`).

## 2. Published review slice

| Taxon ID | Public identification | Specimen IDs | Default | Views |
|---|---|---|---|---|
| `TAX-0001` | Raccoon dog — *Nyctereutes procyonoides* | `SPEC-0001` | `SPEC-0001` | 6 |
| `TAX-0002` | Razorbill — *Alca torda* | `SPEC-0002` | `SPEC-0002` | 5; frontal not supplied |
| `TAX-0003` | Domestic cat — *Felis catus* | `SPEC-0003` | `SPEC-0003` | 6 |
| `TAX-0004` | Loon — *Gavia* sp. | `SPEC-0004` | `SPEC-0004` | 6 |
| `TAX-0005` | Eurasian oystercatcher — *Haematopus ostralegus* | `SPEC-0005` | `SPEC-0005` | 5; frontal not supplied |
| `TAX-0006` | Gull — *Larus* sp. | `SPEC-0006` | `SPEC-0006` | 6 |
| `TAX-0007` | European hare — *Lepus europaeus* | `SPEC-0007` | `SPEC-0007` | 6 |
| `TAX-0008` | Beech marten — *Martes foina* | `SPEC-0008` | `SPEC-0008` | 6 |
| `TAX-0009` | European badger — *Meles meles* | `SPEC-0009`, `SPEC-0010` | `SPEC-0010` | 6 each |
| `TAX-0010` | Northern gannet — *Morus bassanus* | `SPEC-0011` | `SPEC-0011` | 5; frontal not supplied |
| `TAX-0011` | Least weasel — *Mustela nivalis* | `SPEC-0012` | `SPEC-0012` | 6 |
| `TAX-0012` | Harbour seal — *Phoca vitulina* | `SPEC-0013`, `SPEC-0014`, `SPEC-0015` | `SPEC-0014` | 6 each |
| `TAX-0013` | European mole — *Talpa europaea* | `SPEC-0016` | `SPEC-0016` | 6 |
| `TAX-0014` | Common guillemot — *Uria aalge* | `SPEC-0017` | `SPEC-0017` | 5; frontal not supplied |
| `TAX-0015` | Red fox — *Vulpes vulpes* | `SPEC-0018` | `SPEC-0018` | 6 |

All 15 taxon rows and 18 specimen rows above meet the current publication contract. No canonical taxon/specimen row is left in `draft`; the raccoon-dog editorial profile remains a separate unpublished draft.

## 3. Blocked migration candidates

Seven legacy taxon rows were not converted into canonical public records:

| Raw identity | State | Reason in this review slice |
|---|---|---|
| `Cervidae` | Blocked | Family-level source row is outside the supported terminal taxon contract and has no approved public identity/route decision. |
| *Cervus elaphus* | Blocked | No matching accepted cleaned essential-media set. |
| *Martes martes* | Blocked | No matching accepted cleaned essential-media set. |
| *Oryctolagus cuniculus* | Blocked | No matching accepted cleaned essential-media set. |
| *Ovis aries* | Blocked | No matching accepted cleaned essential-media set. |
| *Phocoena phocoena* | Blocked | No matching accepted cleaned essential-media set. |
| *Sorex araneus* | Blocked | No matching accepted cleaned essential-media set. |

In total, 33 of the 51 legacy specimen rows were not migrated. They remain raw migration candidates rather than canonical drafts because they lack an accepted image match, belong to the unsupported family-level row, are marked as not retained, or fall outside the bounded 18-set review slice. Phase 6 must reconcile each row explicitly instead of deriving stable identity from its spreadsheet row number.

## 4. Normalization decisions

- Assigned immutable canonical IDs independently of legacy row numbers. These Phase 3.1 IDs now have public URL semantics and must not be silently regenerated in Phase 6.
- Refreshed and manually accepted dated GBIF snapshots for `TAX-0002` through `TAX-0015`. Exact accepted species matches were retained; `Gavia` and `Larus` remain explicit genus-level `sp.` identifications with unassessed confidence.
- Converted placeholder dates conservatively: `01/01/YYYY` became year precision, `01/MM/YYYY` became month precision, and a non-placeholder day remained day precision.
- Retained entered coordinates. A supplied positive uncertainty became `approximate`; a supplied zero uncertainty remained `exact`. No point was inferred from locality text or image metadata.
- Imported only directly compatible measurements. Ambiguous body-mass entries, numeric tooth counts that do not match the controlled completeness vocabulary, private-style distinguishing notes, and unreviewed preparation durations were not converted into public facts.
- Preserved missing-data semantics. Applicable absent values are `not_recorded`; mammal/bird fields outside the linked class profile are `not_applicable`.
- Normalized explicit acquisition/preparation tokens conservatively. Unmapped values use controlled `other` or `unknown` rather than an invented specific interpretation.
- Applied the repository's reserved data/media rights state and the explicit owner/photographer credit from the supplied evidence. Phase 6 must still perform the promised final row-by-row rights, public-note, and publication audit.
- Processed the complete 104-image staging map through the existing deterministic media pipeline. All lateral images have explicit right orientation and compiled transparent subject bounds. The four missing frontal views remain honest non-blocking warnings.

## 5. Phase 6 obligations retained

Phase 3.1 does not waive the full migration gate. Phase 6 must:

1. reconcile all 22 legacy taxon and 51 specimen rows against the canonical IDs created here;
2. obtain or reject missing essential media and decide the unsupported `Cervidae` row;
3. complete final taxonomy, identity, rights, public-note, preparation, citation, and publication review;
4. audit every accepted or rejected source-field transformation;
5. verify defaults and every permanent URL before release; and
6. retain the explicit four-record incomplete-view state unless new reviewed frontal assets are supplied.
