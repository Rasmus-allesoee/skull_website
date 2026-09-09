# Architecture decision records

This directory records decisions that materially affect system boundaries, public URLs, identity, ownership, security, or long-term technology. It is not a diary of small implementation choices.

## Status vocabulary

- **Proposed:** under active review; not an implementation contract.
- **Accepted:** current contract.
- **Superseded:** replaced by a newer ADR; retained for history.
- **Deprecated:** still present but should not be used for new work.

## Format

Each ADR contains context, decision, consequences, considered alternatives, and follow-up/review triggers. Accepted records are immutable except for typo/link repairs and status/supersession metadata. A changed decision receives a new ADR that links to the old one.

## Index

- [0001 — Static-first Next.js App Router](0001-static-first-nextjs.md)
- [0002 — CSV and MDX content compilation](0002-csv-mdx-content-compilation.md)
- [0003 — Curated web media in Git](0003-curated-web-media-in-git.md)
- [0004 — Build-generated client search and route-lazy map](0004-client-search-and-route-lazy-map.md)
- [0005 — Species-first pages with stable specimen URLs](0005-species-and-specimen-url-model.md)
- [0006 — Curator-facing specimen crosswalk in the canonical CSV](0006-curator-facing-specimen-crosswalk.md)
- [0007 — Production-only Web Analytics](0007-production-only-web-analytics.md)

## Most recent decision audit

Phase 6 accepted ADR 0006 so the canonical specimen sheet can retain the owner's per-taxon labels without weakening collection-wide `SPEC-####` identity or URL stability. v1.0.1 accepted ADR 0007 for the production-only Web Analytics boundary. Earlier Phase 3.1 implementation choices remain extensions of ADRs 0001–0005.
