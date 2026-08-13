import matter from "gray-matter";

import { profileFrontmatterSchema } from "./schemas";
import type { Diagnostic, ProfileSection, TaxonProfile } from "./types";
import { ValidationError } from "./types";

export const allowedMdxComponents = [] as const;

const expectedHeadings = [
  "Overview",
  "Skull identification",
  "Comparison notes",
  "References",
] as const;

export function parseProfile(source: string, file: string): TaxonProfile {
  const diagnostics: Diagnostic[] = [];
  let parsed: ReturnType<typeof matter>;

  try {
    parsed = matter(source);
  } catch (error) {
    throw new ValidationError("Profile frontmatter parsing failed", [
      {
        source: file,
        rule: error instanceof Error ? error.message : "Invalid frontmatter",
        suggestion: "Correct the YAML frontmatter and retry.",
      },
    ]);
  }

  const frontmatter = profileFrontmatterSchema.safeParse(parsed.data);
  if (!frontmatter.success) {
    for (const issue of frontmatter.error.issues) {
      diagnostics.push({
        source: file,
        field: `frontmatter.${issue.path.join(".")}`,
        rule: issue.message,
        suggestion:
          "Use the reviewed profile frontmatter contract in docs/content_data_model.md.",
      });
    }
  }

  if (/^\s*(?:import|export)\s/m.test(parsed.content)) {
    diagnostics.push({
      source: file,
      field: "body",
      rule: "MDX imports and exports are not allowed",
      suggestion:
        "Keep profiles to reviewed Markdown and the component allowlist.",
    });
  }

  if (/<\/?[A-Za-z][^>]*>/.test(parsed.content)) {
    diagnostics.push({
      source: file,
      field: "body",
      rule: "Raw HTML and JSX components are not allowed in Phase 2 profiles",
      suggestion: `Use Markdown only. Allowed components: ${allowedMdxComponents.length === 0 ? "none" : allowedMdxComponents.join(", ")}.`,
    });
  }

  const sections = parseSections(parsed.content, file, diagnostics);

  if (frontmatter.success) {
    const citationKeys = new Set(
      frontmatter.data.citations.map((citation) => citation.key),
    );
    const usedKeys = new Set(
      [...parsed.content.matchAll(/\[cite:([a-z0-9-]+)\]/g)].map(
        (match) => match[1]!,
      ),
    );

    for (const key of usedKeys) {
      if (!citationKeys.has(key)) {
        diagnostics.push({
          source: file,
          field: "body",
          value: key,
          rule: "Citation marker does not resolve to frontmatter",
          suggestion: `Add citation '${key}' to frontmatter or correct the marker.`,
        });
      }
    }

    for (const key of citationKeys) {
      if (!usedKeys.has(key)) {
        diagnostics.push({
          source: file,
          field: "frontmatter.citations",
          value: key,
          rule: "Citation is listed but never used near a claim",
          suggestion: `Add [cite:${key}] near the supported claim or remove the citation.`,
        });
      }
    }
  }

  if (diagnostics.length > 0 || !frontmatter.success) {
    throw new ValidationError("Profile validation failed", diagnostics);
  }

  return {
    taxonId: frontmatter.data.taxon_id,
    reviewStatus: frontmatter.data.review_status,
    lastReviewed: frontmatter.data.last_reviewed,
    summary: frontmatter.data.summary,
    citations: frontmatter.data.citations,
    sections,
    allowedComponents: allowedMdxComponents,
  };
}

function parseSections(
  body: string,
  source: string,
  diagnostics: Diagnostic[],
): ProfileSection[] {
  const headings = [...body.matchAll(/^## (.+)$/gm)];
  const actualHeadings = headings.map((match) => match[1]?.trim() ?? "");

  if (
    actualHeadings.length !== expectedHeadings.length ||
    actualHeadings.some((heading, index) => heading !== expectedHeadings[index])
  ) {
    diagnostics.push({
      source,
      field: "headings",
      value: actualHeadings,
      rule: "Profile sections are missing, unknown, or out of order",
      suggestion: `Use exactly: ${expectedHeadings.map((heading) => `## ${heading}`).join(", ")}.`,
    });
    return [];
  }

  return headings.map((match, index) => {
    const heading = expectedHeadings[index]!;
    const start = (match.index ?? 0) + match[0].length;
    const end = headings[index + 1]?.index ?? body.length;
    const sectionBody = body.slice(start, end).trim();
    const paragraphs = sectionBody
      ? sectionBody.split(/\n\s*\n/).map((paragraph) => paragraph.trim())
      : [];

    if (heading !== "References" && paragraphs.length === 0) {
      diagnostics.push({
        source,
        field: `section.${heading}`,
        rule: "Required profile section is empty",
        suggestion: "Add concise, cited prose or keep the profile in draft.",
      });
    }

    if (paragraphs.some((paragraph) => /^[-*+]\s/m.test(paragraph))) {
      diagnostics.push({
        source,
        field: `section.${heading}`,
        rule: "Phase 2 profile sections support paragraphs only",
        suggestion: "Rewrite the list as concise prose.",
      });
    }

    return { heading, paragraphs };
  });
}
