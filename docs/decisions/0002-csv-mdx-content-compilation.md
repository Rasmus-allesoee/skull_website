# ADR 0002: CSV and MDX content compilation

- **Status:** Accepted
- **Date:** 2026-08-12
- **Owners:** Project maintainer

## Context

The collection starts in spreadsheets, contains structured measurements/provenance, and also needs cited editorial prose. The curator should be able to edit sources without operating a database. The public app needs stronger types and relationships than a raw spreadsheet can guarantee.

## Decision

Maintain two UTF-8 linked CSV sources:

- `taxa.csv` owns taxonomic identity, hierarchy, names, slugs, external references, default specimen, and publication state.
- `specimens.csv` owns each physical skull's biology, provenance, preparation, measurements, rights, and publication state.

Maintain cited taxon profiles and guides in repository-reviewed MDX. A build-time compiler parses, validates, links, and emits deterministic typed artifacts, search documents, and map data. The application never reads the working spreadsheet or calls taxonomy services during a normal build.

## Consequences

### Positive

- Sources remain familiar, portable, Git-diffable, and reviewable.
- Taxa and physical specimens are modelled without duplicated species facts.
- Schemas can enforce identity, links, missing-value semantics, rights, and publication gates.
- Editorial prose retains citations and structure without bloating CSV cells.
- A later database can import the same domain model if needed.

### Costs and constraints

- CSV editing lacks relational UI safeguards until validation runs.
- Multi-line/public prose must be kept out of spreadsheet cells.
- Schema migrations and diagnostics must be maintained carefully.
- Generated outputs need deterministic sorting to avoid noisy diffs/builds.

## Alternatives considered

- **One wide CSV:** repeats taxon facts for every specimen and makes defaults/renames inconsistent.
- **JSON/YAML only:** more expressive but less convenient for the curator's tabular measurement workflow.
- **Database/admin UI:** premature operational complexity and less transparent Git review.
- **Headless CMS:** external dependency, custom modelling effort, and weaker bulk measurement editing.
- **Spreadsheet API at runtime:** credentials, availability, latency, uncontrolled edits, and non-reproducible builds.

## Review triggers

- Concurrent editors or catalog size make CSV conflict/error rates unacceptable.
- Publication cadence makes Git/build workflow demonstrably impractical.
- Contributions require a moderation state machine.
- Content relationships exceed what readable two-table sources can express safely.
