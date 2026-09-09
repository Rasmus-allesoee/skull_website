# ADR 0007: Production-only Web Analytics

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners:** Project maintainer

## Context

The first public release was intentionally launched without analytics or
cookies while the deployment and publication boundaries were being established.
The owner now wants aggregated traffic information, but the collection remains
a static, read-only site without accounts, forms, uploads, or a runtime
database. Catalog and map state is URL-backed, and some query values can
contain free-form visitor input.

## Decision

Use Vercel Web Analytics through the exact `@vercel/analytics` 2.0.1 package.

- Render the App Router Analytics component only when Vercel exposes both
  `VERCEL=1` and `VERCEL_ENV=production`.
- Force the component's `mode` to `production`. Local and Preview builds render
  no analytics component and send no analytics requests.
- Track automatic page views only. Do not add custom events, advertising
  pixels, or application cookie state in this release.
- Use `beforeSend` to remove query parameters and URL fragments from tracked
  page-view URLs. This preserves route-level traffic insight without sending
  catalog search text or URL-backed selection state.
- Publish a concise `/privacy` notice, link it from the global footer, and
  include it in the sitemap.
- Keep the existing same-origin CSP boundary. The analytics script and intake
  paths remain same-origin Vercel insights paths; MapLibre's external tile
  exception stays route-local to `/map`.

## Consequences

### Positive

- Production statistics represent public visitors rather than local/Preview
  testing traffic.
- The site gains useful route, referrer, device, and broad-location insight
  without introducing a general-purpose advertising tracker.
- Query values are excluded before transmission, reducing accidental exposure
  of free-form or future sensitive URL state.
- The integration is isolated to one client island and is absent from
  non-production deployments.
- The public notice and tests make the changed visitor-data boundary explicit.

### Costs and constraints

- Preview and local analytics cannot be inspected in the Vercel dashboard.
- Page-view analytics cannot answer questions about individual controls or
  workflows until a separately reviewed custom-event design is approved.
- Vercel's provider terms, data categories, and retention behavior remain
  external dependencies that the privacy notice must continue to describe
  accurately.
- A later consent, opt-out, custom-event, or alternate-provider decision needs
  a new review and updated documentation.

## Alternatives considered

- **Keep analytics disabled:** preserves the v1 boundary but does not meet the
  owner's approved need for public traffic insight.
- **Track every environment with `mode="auto"`:** useful for preview testing,
  but mixes test traffic with the public dataset and expands collection scope.
- **Use cookie-based Google Analytics or advertising pixels:** unnecessary
  vendor/tracking complexity and a larger consent/privacy surface.
- **Add custom events immediately:** premature without explicit product
  questions; also plan-dependent and more likely to capture unnecessary data.

## Review triggers

- The owner asks for control-level interaction metrics or custom events.
- Forms, accounts, uploads, advertising, or personalized content enter scope.
- Query/state URLs begin carrying private or user-generated records.
- Vercel changes Web Analytics collection, plan availability, endpoint, or
  privacy terms.
