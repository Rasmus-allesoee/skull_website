# ADR 0001: Static-first Next.js App Router

- **Status:** Accepted
- **Date:** 2026-08-12
- **Owners:** Project maintainer

## Context

The site is a public read-only collection whose records change through curated releases, not continuously. It needs indexable pages, strong image handling, route metadata, good performance, and a few rich interactions. A runtime database/server would add operational and security complexity without solving a current product need.

## Decision

Use pinned Next.js App Router and React with strict TypeScript. Render known content through React Server Components and static generation by default. Use `generateStaticParams` for taxon, taxonomy, specimen, and editorial segments. Add the smallest practical client islands for search/filter state, gallery controls, and the map.

Normal builds use committed local sources/artifacts and do not depend on live taxonomy, database, or map APIs. Vercel is the planned later host, but framework code must not depend on proprietary data services.

## Consequences

### Positive

- Complete HTML is fast, indexable, resilient, and low-JavaScript by default.
- Content errors can fail before deployment.
- There is no v1 database, account, or mutation surface to operate and secure.
- Next.js metadata, routing, image, and Vercel tooling align with the release plan.

### Costs and constraints

- Content changes require a build/deploy.
- Interactive modules need explicit server/client boundaries.
- Build time and generated route count must be monitored as the collection grows.
- Runtime features such as public submissions require a new architecture decision.

## Alternatives considered

- **Plain static-site generator:** potentially smaller, but weaker fit for the planned React interactions, image behavior, and learning goal.
- **Client-only SPA:** simpler hosting, but poorer initial HTML, indexing, resilience, and bundle behavior.
- **Database-backed Next.js from day one:** supports mutations that v1 explicitly excludes and creates unnecessary operations/auth/security work.
- **Headless CMS:** improves browser editing but adds vendor/runtime coupling before the content model is stable.

## Review triggers

- Build time or route volume becomes materially problematic.
- Curator workflow requires frequent non-technical publication.
- Accounts, direct contributions, or runtime personalization enter scope.
- Hosting portability or framework maintenance becomes a demonstrated risk.
