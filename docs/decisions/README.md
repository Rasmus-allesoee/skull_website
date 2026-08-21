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

## Most recent decision audit

Phase 3.1 (2026-08-21) required no new ADR. The review-slice rows and media use the existing CSV/compiler and curated-media boundaries in ADR 0002/0003; new stable taxon/specimen routes follow ADR 0005; family galleries and the server-rendered tree foundation extend the static presentation in ADR 0001; and the compact specimen dialog is a bounded client island that performs no runtime data access. The deferred comprehensive tree is constrained to the same canonical taxonomy and will require a new ADR only if it introduces a new source hierarchy, URL/identity semantics, or cross-cutting visualization dependency. The accepted records therefore remain unchanged.
