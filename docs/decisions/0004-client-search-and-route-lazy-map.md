# ADR 0004: Build-generated client search and route-lazy map

- **Status:** Accepted
- **Date:** 2026-08-12
- **Owners:** Project maintainer

## Context

The catalog needs fast multilingual search, fuzzy fallback, facets, numeric filtering, and a geographic view. The initial dataset is small enough to distribute a compact index. Introducing a search server or spatial database would add runtime dependencies, while bundling MapLibre globally would undermine page performance.

## Decision

Generate Orama rank, taxon, and specimen search documents from canonical records at build time. Load the browser index only on search-capable surfaces and keep query/filter/mode state in URL parameters.

Generate GeoJSON from valid published specimen coordinates. Dynamically load MapLibre only on `/map` through a replaceable style/provider adapter. Provide a complete synchronized semantic result list; the map is never the sole access path.

Neither search nor map owns canonical record data or URLs.

## Consequences

### Positive

- No search/database service, credential, or network round trip is needed for catalog queries.
- Static pages and the catalog share the same validated records.
- Search/filter state is shareable and resilient to reload/history navigation.
- Heavy WebGL/map code is isolated from all other routes.
- Map providers can change without editing specimen rows.

### Costs and constraints

- Index size and client query performance must be measured as content grows.
- Search ranking requires explicit fixtures and regression tests.
- Map runtime still depends on configured tile availability and attribution.
- Canvas/WebGL interaction requires substantial accessible list synchronization.

## Alternatives considered

- **Hosted search:** unnecessary service/cost/privacy complexity at initial scale.
- **Server/database search:** introduces runtime infrastructure and latency for static content.
- **Simple substring filter:** insufficient ranking, aliases, fuzzy lookup, and rank results.
- **Google Maps:** stronger vendor coupling and potential billing/privacy requirements.
- **Static image map only:** cannot support clustering, focus, or geographic exploration, though it remains a possible fallback preview.

## Review triggers

- Search index exceeds performance budgets or records become frequently updated.
- Ranking quality cannot be maintained with client index features.
- Map provider terms, cost, availability, or attribution change.
- International scale requires offline tiles, PMTiles, or server-side spatial queries.
