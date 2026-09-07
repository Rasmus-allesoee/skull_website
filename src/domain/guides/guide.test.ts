import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseGuide } from "./guide";
const source = readFileSync("content/guides/skull-preparation.mdx", "utf8");
describe("preparation guide publication contract", () => {
  it("compiles all stages, stable method targets, comparisons, and citations", () => {
    const guide = parseGuide(source);
    expect(guide.metadata.stages).toHaveLength(5);
    expect(guide.blocks.filter((b) => b.kind === "table")).toHaveLength(5);
    expect(guide.metadata.citations).toHaveLength(20);
    expect(guide.blocks.filter((b) => b.kind === "disclosure")).toHaveLength(
      13,
    );
    expect(guide.headings.map((h) => h.id)).toEqual(
      expect.arrayContaining([
        "before-you-begin",
        "maceration",
        "beetles",
        "burial",
        "above-ground",
        "heat",
        "storage",
      ]),
    );
    expect(JSON.stringify(guide)).not.toMatch(/agent_context|undefined/);
  });

  it("keeps starting-condition links and media tokens in the typed table", () => {
    const guide = parseGuide(source);
    const table = guide.blocks.find(
      (block) =>
        block.kind === "table" && block.headers[0] === "Starting condition",
    );
    expect(table?.kind).toBe("table");
    if (table?.kind !== "table") return;
    expect(table.rows).toHaveLength(6);
    expect(table.rows[0]?.[0]).toContain("asset:condition-fresh-body");
    expect(table.rows[0]?.[1]).toContain("#separation");
    expect(table.rows[5]?.[1]).toContain("#assembly");
  });
  it.each([
    ["unresolved citation", source.replace("[cite:hendry]", "[cite:missing]")],
    ["duplicate anchor", source.replace("{#skinning}", "{#separation}")],
    [
      "missing workflow target",
      source.replace('id="maceration"', 'id="different"'),
    ],
    ["unclosed disclosure", source.replace("</Disclosure>", "")],
    ["raw HTML", source + "\n<script>alert(1)</script>\n"],
    ["MDX expression", source + "\n{process.env.SECRET}\n"],
    [
      "ragged table",
      source.replace(
        /\| !\[Fresh or frozen head\]\(asset:condition-fresh-head\) Fresh or frozen head\s+\|/,
        "| Fresh or frozen head | Extra column |",
      ),
    ],
    [
      "unresolved guide link",
      source.replace("(#separation)", "(#missing-guide-target)"),
    ],
  ])("rejects %s", (_label, input) =>
    expect(() => parseGuide(input)).toThrow(),
  );
});
