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
        /\| Fresh or frozen head\s+\|/,
        "| Fresh or frozen head | Extra column |",
      ),
    ],
  ])("rejects %s", (_label, input) =>
    expect(() => parseGuide(input)).toThrow(),
  );
});
