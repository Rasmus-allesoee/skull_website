# ADR 0009: MapLibre first-navigation and worker CSP boundary

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners:** Project maintainer

## Context

The map uses MapLibre v6 with a same-origin module worker and OpenFreeMap
vector tiles. Entering `/map` through a client-side App Router transition
retained the previous document's stricter CSP, so the worker and external tile
requests were blocked even though a direct reload received the map-specific
headers. The v6 worker itself also needs permission to fetch OpenFreeMap
tiles; a default CSP on `/maplibre/*` blocked those requests and left only the
style background visible.

## Decision

- Keep the least-privilege external connection policy route-scoped. Apply the
  map CSP to both `/map/:path*` and the generated `/maplibre/:path*` worker
  assets, including `connect-src https://tiles.openfreemap.org` and the
  same-origin/`blob:` worker allowance.
- Enter the interactive map through native document navigation from the shared
  header, Home map preview, and specimen Collection record. This causes the
  browser to receive the `/map` CSP instead of retaining the previous route's
  CSP during a client-side transition. Other internal navigation remains
  client-side.
- Do not construct MapLibre until a `ResizeObserver` reports a non-zero map
  container. Route transitions can briefly mount the client island before the
  grid track has a usable height.
- Keep the map instance alive while showing a delayed provider fallback, so a
  slow but recoverable style request can still emit `load` and clear the
  fallback. Add local marker fallbacks synchronously so optional marker image
  decoding cannot block map readiness.

## Consequences

- Direct entry, first entry from Home/specimen pages, and reload all receive the
  same CSP and map initialization path.
- MapLibre remains isolated to `/map`; non-map routes do not gain a wildcard
  external tile or worker policy.
- A map link performs a full document navigation, adding a small page reload at
  the boundary in exchange for a correct security policy and reliable worker
  startup.
- The semantic specimen list and retryable fallback remain available when the
  provider genuinely fails.

## Alternatives considered

- **Allow OpenFreeMap globally:** rejected because it weakens the existing
  route-aware CSP for every page.
- **Keep client-side navigation and mutate CSP after routing:** impossible;
  response CSP is fixed for the current document and cannot be relaxed by a
  client component.
- **Construct MapLibre immediately and call `resize()` later:** rejected
  because zero-sized first construction can prevent the initial style load.

## Review triggers

- A future Next.js navigation architecture can apply route-specific CSP during
  client transitions.
- MapLibre worker packaging or provider origins change.
- The map route becomes embedded in another page rather than entered as a
  document boundary.
