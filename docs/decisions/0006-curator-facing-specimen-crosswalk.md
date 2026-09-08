# ADR 0006: Curator-facing specimen crosswalk in the canonical CSV

- **Status:** Accepted
- **Date:** 2026-09-08
- **Owners:** Project maintainer

## Context

Public specimen IDs are permanent collection-wide identifiers, while the owner records individuals with a short number that restarts within each taxon. Removing that familiar source identity during migration made review unnecessarily difficult and required a separate manual crosswalk.

## Decision

Keep `specimen_id` as the immutable collection-wide public identity and URL key. Add two validated curator-facing columns to `content/specimens/specimens.csv`:

- `species_name`, a readable mirror of the linked canonical taxon identity, including `sp.` for genus-level records; and
- `specimen_id_raw`, the owner's stable per-taxon specimen label.

The pair `species_name + specimen_id_raw` must be unique and must map to exactly one canonical `specimen_id`. It is review metadata, not a second public identity system. New canonical IDs use the next unused `SPEC-####` value when a physical specimen first passes migration review; they are never calculated from species name, acquisition date, measurements, row position, or the raw number.

The same schema revision replaces categorical tooth completeness with a nullable non-negative `missing_teeth_count`, moves prepared skull mass to the first skull-measurement pair in the review sheet, adds mammal postorbital width, and makes interorbital width class-aware for both mammals and birds.

## Consequences

### Positive

- The owner can edit and review one canonical specimen sheet without maintaining a separate crosswalk.
- Raw per-species labels remain easy to match while public URLs stay stable.
- Missing-tooth observations preserve the exact recorded count, including zero.
- Duplicate or mismatched curator identities fail validation before publication.

### Costs and constraints

- Species text is intentionally duplicated for review convenience and must agree with `taxa.csv`.
- `specimen_id_raw` is not globally unique and must never be used alone as a route or relational key.
- Renumbering the owner's local label requires a reviewed data correction; it does not change `specimen_id`.

## Alternatives considered

- **Use only `SPEC-####`:** technically sufficient, but needlessly difficult for the owner to reconcile with their established per-species numbering.
- **Derive public IDs from dates or names:** unstable when metadata is corrected and unsafe for permanent URLs.
- **Keep a separate checked-in crosswalk:** creates a third canonical identity table and synchronization risk.

## Review triggers

- The owner moves to a collection-management system with its own immutable accession numbers.
- Multiple curators need concurrent editing or taxon reassignment workflows.
- A specimen must retain several historical source identifiers.
