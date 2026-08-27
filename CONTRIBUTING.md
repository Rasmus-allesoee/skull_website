# Contributing to Skull Collection

Thank you for helping build Skull Collection. This file covers repository contributions. The later public specimen-contribution process will be documented on the website and is not an anonymous upload workflow.

## Before changing anything

Read `AGENTS.md`, `docs/project_status.md`, the relevant active issue/phase, and the canonical product/technical document for your change. Do not expand the active phase with deferred features.

If your change alters identity, URLs, source of truth, rights, deployment, security boundaries, or cross-cutting technology, propose an architecture decision record before implementation.

## Development setup

Use Node.js 24.18.0 and pnpm 11.21.0:

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
pnpm dev
```

## Branches and commits

- `main` is the stable, deployable branch; this solo project does not use a permanent `dev` branch.
- Start each phase, feature, or independent fix from the latest `main`.
- Name branches `agent/<short-description>`.
- Keep changes focused on one coherent issue or vertical sub-slice.
- If an unrelated issue appears during a feature, track it separately, create a separate branch from `main`, and merge that fix into `main` before updating the original feature branch from `main`.
- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, or `ci:`.
- Do not mix formatting sweeps or unrelated user changes into a feature commit.
- After a pull request is merged, delete its merged local and remote branch and create the next branch from the updated `main`.
- Preserve coherent commit history by using a normal merge commit rather than squash merging; do not rewrite a published review branch without explicit agreement.

## Required checks

Run the checks relevant to the change; a normal application change should run:

```bash
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm check` includes the real content/media validators and invalid-fixture gate. For source or image changes, run `pnpm validate:content`, `pnpm validate:media`, and the appropriate explicit media/taxonomy maintenance command as documented in `README.md`; never bypass a failing publication invariant.

## Pull requests

- Open a draft pull request early for nontrivial work.
- Explain what changed, why, user/developer impact, and checks run.
- Link the issue/milestone and call out deferred or follow-up work.
- Include screenshots or recordings for visible changes at representative desktop/mobile widths, with reduced-motion/accessibility notes where relevant.
- Keep `docs/project_status.md` and canonical documentation current in the same pull request.
- Resolve CI and review feedback without rewriting unrelated code.

## Content, privacy, and rights

- Do not commit `agent_context/skulls_meta.csv`, `agent_context/skull_images_clean/`, private notes, raw workbooks, archival masters, or secrets.
- Do not invent taxonomy, IDs, measurements, provenance, dates, coordinates, credits, rights, or citations.
- Do not derive coordinates from EXIF or locality text.
- Do not publish an image until its metadata is stripped and its credit/rights are explicit.
- Source code contributions are under MIT. Collection photos, prose, and data have separate rights; see `RIGHTS.md`.

## Accessibility and quality

WCAG 2.2 AA is part of the product contract. New UI must use semantic elements, visible labels/focus, keyboard operation, usable 360 px layouts, sufficient contrast, and reduced-motion behavior. Every map or non-text visualization needs an equivalent usable representation.

## Documentation

Update the document that owns a changed rule instead of creating a competing note. Update `AGENTS.md` whenever an important rule, command, plan/document, or context path changes. Add ADRs only for material decisions and never erase accepted decision history; supersede it.
