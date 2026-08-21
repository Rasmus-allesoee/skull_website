import { describe, expect, it } from "vitest";

import { buildContent } from "../../../scripts/lib/content";
import { calculateSubjectBounds } from "../../../scripts/lib/media";
import { classifyTaxonomyMatch } from "./compiler";
import { parseStrictCsv } from "./csv";
import { parseProfile } from "./profile";
import { rawTaxonSchema, taxonHeaders } from "./schemas";
import { ValidationError } from "./types";

describe("content compiler", () => {
  it("compiles stable IDs, links, partial dates, missing values, rights, and media naming", async () => {
    const { collection, warnings } = await buildContent();
    const taxon = collection.taxa[0]!;
    const specimen = collection.specimens[0]!;

    expect(taxon.taxonId).toMatch(/^TAX-\d{4,}$/);
    expect(specimen.specimenId).toMatch(/^SPEC-\d{4,}$/);
    expect(taxon.defaultSpecimenId).toBe(specimen.specimenId);
    expect(specimen.taxonId).toBe(taxon.taxonId);
    expect(specimen.acquisitionDate).toEqual({
      value: "2025-11",
      precision: "month",
    });
    expect(specimen.measurements.bodyMass).toEqual({
      status: "not_recorded",
      value: null,
      unit: "g",
    });
    expect(collection.schemaVersion).toBe(4);
    expect(specimen.condition).toBe("good");
    expect(specimen.ageDetail).toBeNull();
    expect(specimen.pathology).toEqual({
      status: "not_recorded",
      description: null,
    });
    expect(specimen.trauma).toEqual({
      status: "not_recorded",
      description: null,
    });
    expect(specimen.ownerCredit).toBe("Rasmus");
    expect(specimen.rights.mediaCredit).toBe("Rasmus");
    expect(specimen.rights).toEqual(
      expect.objectContaining({
        dataRights: "all_rights_reserved",
        mediaRights: "all_rights_reserved",
      }),
    );
    expect(collection.media).toHaveLength(6);
    expect(collection.media[0]?.orientation).toBe("right");
    expect(
      collection.media.slice(1).every((asset) => asset.orientation === null),
    ).toBe(true);
    expect(collection.comparisonReferences).toEqual([
      expect.objectContaining({
        referenceId: "adult-human-skull",
        isDefault: true,
        measurementProfile: "mammal",
        measurements: expect.objectContaining({
          skullLength: { status: "approximate", value: 182, unit: "mm" },
        }),
        media: expect.objectContaining({
          publicPath: "/media/references/adult-human-skull.webp",
          orientation: "right",
          subjectBounds: { x: 283, y: 122, width: 847, height: 777 },
        }),
      }),
    ]);
    expect(
      collection.media.every((asset) =>
        asset.publicPath.endsWith(`${asset.specimenId}__${asset.view}.webp`),
      ),
    ).toBe(true);
    expect(warnings).toEqual([]);
  });

  it("classifies only exact accepted species matches as automatic candidates", () => {
    expect(
      classifyTaxonomyMatch({
        match_type: "EXACT",
        status: "ACCEPTED",
        rank: "SPECIES",
        confidence: 99,
      }),
    ).toBe("exact_accepted");
    expect(
      classifyTaxonomyMatch({
        match_type: "FUZZY",
        status: "ACCEPTED",
        rank: "SPECIES",
        confidence: 98,
      }),
    ).toBe("requires_review");
    expect(
      classifyTaxonomyMatch({
        match_type: "EXACT",
        status: "SYNONYM",
        rank: "SPECIES",
        confidence: 100,
      }),
    ).toBe("requires_review");
    expect(
      classifyTaxonomyMatch({
        match_type: "EXACT",
        status: "ACCEPTED",
        rank: "GENUS",
        confidence: 100,
      }),
    ).toBe("requires_review");
  });

  it("rejects an unknown CSV header with an actionable canonical-header diagnostic", () => {
    const invalidHeaders: string[] = [...taxonHeaders];
    invalidHeaders[2] = "scientificname";
    const row = invalidHeaders.map(() => "").join(",");
    expect(() =>
      parseStrictCsv({
        text: `${invalidHeaders.join(",")}\n${row}\n`,
        source: "invalid-taxa.csv",
        headers: taxonHeaders,
        schema: rawTaxonSchema,
      }),
    ).toThrowError(ValidationError);

    try {
      parseStrictCsv({
        text: `${invalidHeaders.join(",")}\n${row}\n`,
        source: "invalid-taxa.csv",
        headers: taxonHeaders,
        schema: rawTaxonSchema,
      });
    } catch (error) {
      expect((error as ValidationError).diagnostics[0]).toEqual(
        expect.objectContaining({
          field: "header",
          suggestion: expect.stringContaining("scientific_name"),
        }),
      );
    }
  });

  it("rejects unresolved profile citations and raw JSX", async () => {
    const validProfile = `---
taxon_id: TAX-TEST
review_status: reviewed
last_reviewed: "2026-08-14"
summary: Reviewed test profile.
citations:
  - key: valid-source
    title: Valid source
    authors: Example author
    year: 2026
    url: https://example.com/source
    accessed: "2026-08-14"
---

## Overview

Reviewed statement. [cite:valid-source]

## Skull identification

Reviewed identification statement.

## Comparison notes

Reviewed comparison statement.

## References
`;
    const invalidProfile = validProfile
      .replace("[cite:valid-source]", "[cite:missing-source]")
      .replace("## References", "<script>bad()</script>\n\n## References");

    expect(() =>
      parseProfile(invalidProfile, "invalid-profile.mdx"),
    ).toThrowError(ValidationError);
  });

  it("allows an empty draft profile but requires citations before review", () => {
    const draftProfile = `---
taxon_id: TAX-TEST
review_status: draft
last_reviewed: "2026-08-14"
summary: Deliberately deferred profile.
citations: []
---

## Overview

## Skull identification

## Comparison notes

## References
`;
    expect(parseProfile(draftProfile, "draft-profile.mdx")).toEqual(
      expect.objectContaining({ reviewStatus: "draft", citations: [] }),
    );

    const reviewedWithoutCitation = draftProfile.replace(
      "review_status: draft",
      "review_status: reviewed",
    );
    expect(() =>
      parseProfile(reviewedWithoutCitation, "reviewed-profile.mdx"),
    ).toThrowError(ValidationError);
  });

  it("calculates alpha subject bounds without treating transparent pixels as anatomy", () => {
    const pixels = new Uint8Array([
      0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    expect(calculateSubjectBounds(pixels, 2, 2, 4)).toEqual({
      x: 1,
      y: 0,
      width: 1,
      height: 1,
    });
  });
});
