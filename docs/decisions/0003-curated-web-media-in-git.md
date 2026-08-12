# ADR 0003: Curated web media in Git

- **Status:** Accepted
- **Date:** 2026-08-12
- **Owners:** Project maintainer

## Context

The site depends on high-resolution transparent skull images. Archival Affinity/PSD/PNG sources are large, may contain metadata, and are working originals. The first collection is modest, while page builds benefit from versioned, reviewable media that corresponds exactly to records.

## Decision

Keep camera originals, `.af`, PSD, archival PNG/TIFF, and other masters in backed-up private storage outside Git. Treat `agent_context/skull_images_clean/` as local staging and ignore it.

Use a deterministic Sharp pipeline to validate and produce public transparent WebP masters up to 3200 px, quality 90/alpha 100. Strip EXIF/GPS, calculate subject bounds, enforce immutable specimen-ID/canonical-view naming, and attach rights/credit through a media manifest. Commit only these curated public derivatives under `public/media/`.

Application components consume `MediaAsset` records, not assumed local filenames. Revisit storage when committed public media approaches roughly 500 MB.

## Consequences

### Positive

- Every deployed image version is tied to the code/content commit that references it.
- Clean clones and preview builds do not require a private asset service.
- Metadata leakage and filename ambiguity are caught before publication.
- The `MediaAsset` boundary keeps a later CDN/object-store migration possible.

### Costs and constraints

- Git history grows when binary derivatives change.
- Curators must run and review the media pipeline.
- High-resolution archival masters require separate verified backup discipline.
- Asset replacement should be intentional; binary diffs are not human-readable.

## Alternatives considered

- **Commit archival masters:** unacceptable size, privacy/metadata, and edit-history cost.
- **External object storage immediately:** adds credentials, lifecycle, upload, and availability work before scale demands it.
- **Store only small final variants:** limits credible zoom and may require regenerating from unavailable private sources.
- **Git LFS:** adds clone/deployment workflow complexity and service quotas without current need.

## Review triggers

- Public media nears 500 MB or clone/deployment performance degrades.
- External contributors require a secure intake pipeline.
- Video, 360° sequences, or 3D assets enter active scope.
- Hosting image transformation cost or limits materially change.
