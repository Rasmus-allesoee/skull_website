# ADR 0010 — Calibrated multi-view comparison workbench

**Status:** Accepted

**Date:** 2026-09-11

## Context

The specimen page already compares one canonical lateral photograph with one
other specimen or reviewed reference at a shared scale derived from maximum
skull length. A standalone workspace must support up to five subjects and
multiple photographic views without implying that unrelated image bounds or
CSS dimensions are anatomical measurements.

Measurements identify a physical span in millimetres but do not identify the
corresponding pixels in every photograph. Frontal, dorsal, ventral, and
assembled-mandible images therefore cannot be calibrated reliably from their
transparent bounding boxes alone. Oblique views also contain perspective
foreshortening that a single two-dimensional scale cannot correct.

## Decision

- Add the static-first public route `/compare` with a single client workbench
  island and no runtime API or database.
- Reuse the existing comparison subject, measurement-profile, and difference
  engines rather than creating a parallel comparison system.
- Permit one to five selected subjects and at most ten active view layers.
- Every comparison-enabled image declares one explicitly reviewed calibration
  span tied to a canonical positive measurement. Normalized landmark endpoints
  are used when an alpha-bound width or height does not represent the measured
  span.
- Lateral, dorsal, and ventral use maximum skull length; frontal uses the
  profile-appropriate reviewed width; mandible dorsal uses a diagonal span
  along one hemimandible and maximum mandible length. Oblique is ineligible.
- Scale the complete image canvas isotropically in one shared world coordinate
  system. Layers may translate and change stacking order, while one shared
  field camera pans and zooms every layer together. Visitors cannot resize,
  rotate, stretch, or independently zoom a layer.
- Opacity belongs to a subject and affects all of its active views. It is a
  compact secondary control.
- The active directed subject pair selects the class-aware measurement matrix
  and difference calculation; all selected subjects receive value columns.
- Share ordered subjects, active views, the difference pair, arrangement, and
  comparable-only state in a versioned canonical URL. Keep freehand positions,
  stacking, opacity, and camera state transient in the first format.
- Retain a server-rendered default comparison and semantic table for visitors
  without JavaScript. Print support is CSS-first and low prominence.

## Consequences

- Media declarations and generated comparison data gain a reviewed calibration
  contract and blocking validation.
- Alternate views remain in galleries even when they are not calibrated, but
  are unavailable in the workbench with an explicit reason.
- The ten-layer cap bounds decoded image memory and manipulation complexity
  while preserving both multi-subject and multi-view use cases.
- Shared URLs reproduce analytical state across viewport sizes but not an exact
  freehand composition.
- Calibration review is editorial evidence. Runtime inference and automatic
  landmark detection are prohibited.

## Alternatives considered

- **Infer every span from alpha bounds:** rejected because image extents do not
  consistently match anatomical landmarks, especially for frontal and
  assembled-mandible views.
- **Support only lateral views:** rejected because reviewed orthogonal views add
  substantial comparative value and the bounded calibration contract makes
  them technically honest.
- **Allow independent image scaling:** rejected because it breaks relative
  physical scale and can mislead visitors.
- **Serialize all canvas state:** deferred because freehand and camera values are
  viewport-dependent and would produce brittle cross-device links.

## Review triggers

Create a new ADR before adding oblique or perspective correction, automatic
landmark inference, more than five subjects or ten layers, independently scaled
layers, persisted compositions, accounts, or server-side saved comparisons.
