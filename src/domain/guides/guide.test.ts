import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractGuideMediaIds, parseGuide } from "./guide";
const source = readFileSync("content/guides/skull-preparation.mdx", "utf8");
describe("preparation guide publication contract", () => {
  it("compiles all stages, stable method targets, comparisons, and citations", () => {
    const guide = parseGuide(source);
    expect(guide.metadata.stages).toHaveLength(5);
    expect(guide.blocks.filter((b) => b.kind === "table")).toHaveLength(5);
    expect(guide.metadata.citations).toHaveLength(22);
    expect(guide.blocks.filter((b) => b.kind === "disclosure")).toHaveLength(
      14,
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
    expect(extractGuideMediaIds(source)).toEqual(
      expect.arrayContaining([
        "brain-gunk",
        "discolored-skull",
        "mummification",
      ]),
    );
  });

  it("keeps numbered defleshing methods and structured troubleshooting cases", () => {
    const guide = parseGuide(source);
    const troubleshooting = guide.blocks.find(
      (block) =>
        block.kind === "disclosure" &&
        block.id === "maceration-troubleshooting",
    );
    expect(troubleshooting?.kind).toBe("disclosure");
    if (troubleshooting?.kind !== "disclosure") return;
    expect(troubleshooting.level).toBe(4);
    expect(troubleshooting.title).toBe("1.1. Troubleshooting maceration");
    const cases = troubleshooting.blocks.filter(
      (block) => block.kind === "details",
    );
    expect(cases).toHaveLength(4);
    expect(cases.map((block) => block.title)).toEqual([
      "Dark or strangely coloured bone",
      "White, waxy material — adipocere",
      "Persistent tendons",
      "Waxy debris in the lower jaw",
    ]);
    expect(cases[0]?.kind === "details" && cases[0].asset).toBe(
      "discolored-skull",
    );
    const adipocere = cases[1];
    expect(adipocere?.kind === "details" && adipocere.asset).toBe("adipocere");
    expect(
      adipocere?.kind === "details"
        ? adipocere.blocks
            .filter((block) => block.kind === "subheading")
            .map((block) => block.text)
        : [],
    ).toEqual([
      "What it is",
      "Why it forms",
      "How I try to prevent it",
      "How to remove it",
    ]);
    expect(
      guide.metadata.stages[1]?.methods.map((method) => method.title),
    ).toEqual([
      "1. Water maceration",
      "2. Dermestid beetles",
      "3. Burial",
      "4. Above-ground decay",
      "5. Controlled simmering",
    ]);
    expect(source).not.toContain('<Details title="Mummified tissue">');
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
