# ADR 0008: Production dependency advisory remediation

- **Status:** Accepted
- **Date:** 2026-09-09
- **Owners:** Project maintainer

## Context

The v1.0.1 production dependency audit reported two vulnerabilities that
were already present on `main`: a critical MapLibre GL JS XSS sanitizer issue
in `maplibre-gl@5.7.3`, and a high `js-yaml` resource-exhaustion issue in the
`gray-matter -> js-yaml@3.15.1` transitive path. The analytics change did not
introduce either dependency, but a release that knowingly carries both
findings is not an acceptable production baseline.

## Decision

- Upgrade the direct MapLibre dependency to `6.4.1`, the first patched release
  for the reported advisory. Keep the version exact and avoid taking the
  unrelated changes in later MapLibre releases until a separate compatibility
  review is justified.
- Adapt the map island to MapLibre v6's ESM namespace import and explicit
  same-origin worker URL. The build copies the pinned package's worker and
  shared module into the ignored `public/maplibre/` directory before `dev` and
  `build`; the runtime points `setWorkerUrl` at that generated worker.
- Replace the v5 `styleimagemissing` resolver pattern with v6's
  `setMissingStyleImageResolver` API.
- Keep `gray-matter@4.0.3` and add a workspace-level pnpm override only on its
  `gray-matter > js-yaml` edge, resolving that compatible range to `3.15.2`,
  the patched release. Do not add `js-yaml` as a public direct dependency or
  alter unrelated consumers of the `4.x` line.

## Consequences

- `pnpm audit --prod` reports zero known vulnerabilities for the current
  production dependency graph.
- The map continues to use MapLibre only on `/map`, with no new provider or
  runtime data boundary.
- `public/maplibre/` is generated build input rather than curated media and
  remains ignored; clean Vercel builds recreate it from the lockfile-pinned
  package.
- MapLibre v6 requires WebGL2 and uses ESM-only exports. The existing map
  capability check and semantic list fallback remain the recovery path for
  unsupported browsers or provider failures.

## Alternatives considered

- **Leave the findings documented only:** rejected because the critical finding
  is in a direct production dependency and a patched compatible path exists.
- **Upgrade MapLibre to the newest release:** rejected for this focused fix;
  `6.4.1` is the smallest patched target and limits unrelated runtime change.
- **Replace gray-matter or pin a fork:** rejected because the existing
  dependency's declared range accepts the patched `js-yaml` patch release.

## Review triggers

- A future MapLibre upgrade changes the map API, worker packaging, or WebGL
  fallback contract.
- The `js-yaml` override becomes unnecessary after a gray-matter release
  updates its dependency range.
- A new production audit reports a vulnerability that cannot be resolved by a
  compatible patch update.
