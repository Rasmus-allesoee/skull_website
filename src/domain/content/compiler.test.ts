import { readFile } from "node:fs/promises";
import path from "node:path";

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
    expect(specimen.rights).toEqual(
      expect.objectContaining({
        dataRights: "all_rights_reserved",
        mediaRights: "all_rights_reserved",
      }),
    );
    expect(collection.media).toHaveLength(6);
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
    const validProfile = await readFile(
      path.join(process.cwd(), "content/profiles/TAX-0001.mdx"),
      "utf8",
    );
    const invalidProfile = validProfile
      .replace("[cite:kim-et-al-2015]", "[cite:missing-source]")
      .replace("## References", "<script>bad()</script>\n\n## References");

    expect(() =>
      parseProfile(invalidProfile, "invalid-profile.mdx"),
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
