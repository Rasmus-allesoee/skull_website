# ADR 0005: Species-first pages with stable specimen URLs

- **Status:** Accepted
- **Date:** 2026-08-12
- **Owners:** Project maintainer

## Context

Visitors usually look for an animal/taxon, while the collection may contain several distinct skulls with different measurements, provenance, preparation, and photographs. A single species-only record would merge physical evidence. A flat specimen-only catalog would make common browsing repetitive and obscure shared identity/profiles.

The collection also includes uncertain and genus-level identifications, so “species page” is a product label rather than a guarantee that every taxon record has species rank.

## Decision

Use taxon pages as the primary exhibit and browsing destination:

- `/species/{taxon-slug}` selects one explicitly configured default specimen.
- `/species/{taxon-slug}/specimens/{specimen-id}` selects one exact physical specimen in the same exhibit composition.
- Other linked specimens appear through a compact selector, not as duplicated long sections.
- Every published taxon has exactly one valid published default specimen.
- Taxon IDs, specimen IDs, and published slugs are curated and stable.
- Scientific-name corrections update display fields; old slugs redirect explicitly.
- Rank and identification confidence are shown so genus-level/uncertain records are not misrepresented.

## Consequences

### Positive

- Most visitors receive one coherent species/taxon story and strong default photography.
- Researchers and collectors can cite an exact skull and its measurements/provenance.
- Shared taxon facts are not repeated across specimens.
- Multiple individuals scale without turning one page into a long duplicate gallery.
- Taxonomy corrections can preserve public links.

### Costs and constraints

- Canonical metadata and default/selected specimen behavior require careful tests.
- The UI must make current physical specimen identity obvious.
- “Species” route terminology must coexist honestly with genus/subspecies ranks.
- Re-identifying a specimen may require an explicit route migration/redirect.

## Alternatives considered

- **One page per species only:** loses physical-specimen identity and linkable measurements/provenance.
- **One flat page per specimen only:** repetitive browsing and weak shared profiles/taxonomy experience.
- **All specimens expanded on the taxon page:** becomes long, image-heavy, and difficult to compare/navigate.
- **Query-only specimen selection:** shareable but less durable/semantic than a stable nested route.

## Review triggers

- A specimen legitimately belongs to multiple taxonomic interpretations.
- Large specimen counts make the compact selector insufficient.
- Formal collection identifiers or institutional integrations change URL requirements.
- Comparison becomes a primary rather than deferred visitor journey.
