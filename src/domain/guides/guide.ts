import matter from "gray-matter";
import { z } from "zod";
import { citationSchema } from "../content/schemas";
import type { MediaAsset } from "../content/types";

const id = z.string().regex(/^[a-z][a-z0-9-]*$/);
const internalLinkPattern = /\[([^\]\n]+)\]\(#([a-z][a-z0-9-]*)\)/g;
const mediaPattern = /!\[([^\]\n]+)\]\(asset:([a-z][a-z0-9-]*)\)/g;
const reference = citationSchema.extend({
  year: citationSchema.shape.year.nullable(),
});
const frontmatterSchema = z.strictObject({
  title: z.string().min(1),
  slug: z.literal("skull-preparation"),
  summary: z.string().min(1),
  last_reviewed: z.iso.date(),
  review_status: z.literal("reviewed"),
  safety_review: z.literal("source-checked"),
  citations: z.array(reference).min(1),
  stages: z
    .array(
      z.strictObject({
        id,
        title: z.string().min(1),
        asset: id,
        outcome: z.string().min(1),
        methods: z
          .array(z.strictObject({ id, title: z.string().min(1) }))
          .min(1),
      }),
    )
    .length(5),
});
export type GuideBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: 2 | 3 | 4; id: string; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "figure"; asset: string }
  | { kind: "details" | "aside"; title: string; blocks: GuideBlock[] }
  | {
      kind: "disclosure";
      level: 3 | 4;
      id: string;
      title: string;
      blocks: GuideBlock[];
    };
export type GuideHeading = {
  level: 2 | 3 | 4;
  id: string;
  text: string;
};
export type GuideMediaAsset = Pick<
  MediaAsset,
  "publicPath" | "width" | "height" | "bytes" | "alt" | "credit" | "rights"
> & {
  assetId: string;
  provenance: "owner-photograph" | "ai-illustration";
  caption: string;
};
export interface PreparationGuide {
  schemaVersion: 1;
  metadata: z.infer<typeof frontmatterSchema>;
  blocks: GuideBlock[];
  headings: GuideHeading[];
  media: GuideMediaAsset[];
}

/** Return the stable internal-guide targets authored in a text node. */
export function extractGuideAnchorIds(text: string): string[] {
  return [...text.matchAll(internalLinkPattern)].map((match) => match[2]!);
}

/** Return preparation-media IDs authored in a text node. */
export function extractGuideMediaIds(text: string): string[] {
  return [...text.matchAll(mediaPattern)].map((match) => match[2]!);
}

/** Parse a deliberately restricted MDX dialect; never compile or execute JSX. */
export function parseGuide(source: string): Omit<PreparationGuide, "media"> {
  const parsed = matter(source);
  const metadata = frontmatterSchema.parse(parsed.data);
  const headings: PreparationGuide["headings"] = [];
  const keys = metadata.citations.map((c) => c.key);
  if (new Set(keys).size !== keys.length)
    throw new Error("Duplicate guide citation key");
  for (const c of metadata.citations)
    if (!/^https:\/\//.test(c.url))
      throw new Error("Guide sources require HTTPS");
  const usedKeys = [...parsed.content.matchAll(/\[cite:([a-z0-9-]+)\]/g)].map(
    (m) => m[1]!,
  );
  if (
    usedKeys.some((k) => !keys.includes(k)) ||
    keys.some((k) => !usedKeys.includes(k))
  )
    throw new Error("Unresolved or unused guide citation");
  const lines = parsed.content.trim().split(/\r?\n/);
  let cursor = 0;
  function blocksUntil(end?: string, allowContainers = false): GuideBlock[] {
    const blocks: GuideBlock[] = [];
    while (cursor < lines.length) {
      const line = lines[cursor++]!.trim();
      if (!line) continue;
      if (end && line === end) return blocks;
      const heading = /^(#{2,4}) (.+) \{#([a-z][a-z0-9-]*)\}$/.exec(line);
      if (heading) {
        if (end)
          throw new Error("Headings must remain outside optional disclosures");
        const block = {
          kind: "heading" as const,
          level: heading[1]!.length as 2 | 3 | 4,
          id: heading[3]!,
          text: heading[2]!,
        };
        headings.push(block);
        blocks.push(block);
        continue;
      }
      const figure = /^<Figure asset="([a-z][a-z0-9-]*)" \/>$/.exec(line);
      if (figure) {
        blocks.push({ kind: "figure", asset: figure[1]! });
        continue;
      }
      const disclosure =
        /^<Disclosure id="([a-z][a-z0-9-]*)" level="([34])" title="([^"<>]+)">$/.exec(
          line,
        );
      if (disclosure) {
        if (end) throw new Error("Nested guide disclosures are not supported");
        const heading = {
          id: disclosure[1]!,
          level: Number(disclosure[2]) as 3 | 4,
          text: disclosure[3]!,
        };
        headings.push(heading);
        blocks.push({
          kind: "disclosure",
          id: heading.id,
          level: heading.level,
          title: heading.text,
          blocks: blocksUntil("</Disclosure>", true),
        });
        continue;
      }
      const container = /^<(Details|Aside) title="([^"<>]+)">$/.exec(line);
      if (container) {
        if (end && !allowContainers)
          throw new Error("Nested guide disclosures are not supported");
        blocks.push({
          kind: container[1] === "Details" ? "details" : "aside",
          title: container[2]!,
          blocks: blocksUntil(`</${container[1]}>`),
        });
        continue;
      }
      if (/^\|/.test(line)) {
        const cells = (row: string) =>
          row
            .trim()
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());
        if (!line.endsWith("|")) throw new Error("Invalid table row");
        const headers = cells(line);
        const divider = lines[cursor++]?.trim() ?? "";
        if (
          !/^\|(?:\s*:?-+:?\s*\|)+$/.test(divider) ||
          cells(divider).length !== headers.length
        )
          throw new Error("Invalid guide table header");
        const rows: string[][] = [];
        while (lines[cursor]?.trim().startsWith("|")) {
          const row = lines[cursor++]!.trim();
          const values = cells(row);
          if (!row.endsWith("|") || values.length !== headers.length)
            throw new Error("Ragged guide table");
          values.forEach(validateText);
          rows.push(values);
        }
        headers.forEach(validateText);
        if (!rows.length) throw new Error("Empty guide table");
        blocks.push({ kind: "table", headers, rows });
        continue;
      }
      if (/^(?:- |\d+\. )/.test(line)) {
        const ordered = /^\d/.test(line);
        const items = [line.replace(/^(?:- |\d+\. )/, "")];
        const pattern = ordered ? /^\d+\. / : /^- /;
        while (lines[cursor] && pattern.test(lines[cursor]!.trim()))
          items.push(lines[cursor++]!.trim().replace(pattern, ""));
        items.forEach(validateText);
        blocks.push({ kind: "list", ordered, items });
        continue;
      }
      const paragraph = [line];
      while (
        lines[cursor]?.trim() &&
        !/^(?:#|<|\||- |\d+\. )/.test(lines[cursor]!.trim())
      )
        paragraph.push(lines[cursor++]!.trim());
      const text = paragraph.join(" ");
      validateText(text);
      blocks.push({ kind: "paragraph", text });
    }
    if (end) throw new Error(`Missing ${end}`);
    return blocks;
  }
  const blocks = blocksUntil();
  const ids = headings.map((h) => h.id);
  if (
    new Set(ids).size !== ids.length ||
    ids.some(
      (i) =>
        i.startsWith("ref-") ||
        [
          "workflow",
          "references",
          "main-content",
          "guide-contents-title",
        ].includes(i),
    )
  )
    throw new Error("Duplicate or reserved guide heading ID");
  const knownAnchors = new Set(["workflow", "references", ...ids]);
  if (
    extractGuideAnchorIds(parsed.content).some(
      (target) => !knownAnchors.has(target),
    )
  )
    throw new Error("Guide link target does not resolve");
  if (
    headings[0]?.level !== 2 ||
    headings.some((h, i) => i > 0 && h.level > headings[i - 1]!.level + 1)
  )
    throw new Error("Invalid heading hierarchy");
  for (const stage of metadata.stages) {
    if (
      !headings.some((h) => h.id === stage.id && h.level === 2) ||
      stage.methods.some((m) => !ids.includes(m.id))
    )
      throw new Error("Workflow link does not resolve to a guide heading");
  }
  if (new Set(metadata.stages.map((s) => s.id)).size !== 5)
    throw new Error("Duplicate workflow stage");
  return { schemaVersion: 1, metadata, blocks, headings };
}
function validateText(text: string) {
  const plain = text
    .replace(/\[cite:[a-z0-9-]+\]/g, "")
    .replace(mediaPattern, "")
    .replace(internalLinkPattern, "");
  if (/[<>{}\[\]`#]/.test(plain) || /^(?:import|export)\s/.test(plain))
    throw new Error(`Unsupported guide syntax: ${text.slice(0, 80)}`);
}
