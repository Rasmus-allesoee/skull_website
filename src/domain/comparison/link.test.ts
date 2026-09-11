import { describe, expect, it } from "vitest";

import { buildComparisonHref } from "./link";

describe("comparison entry links", () => {
  it("encodes exact namespaced subjects, views, and a directed pair", () => {
    const href = buildComparisonHref(
      [
        { id: "specimen:SPEC-0001" },
        { id: "reference:adult-human-skull", views: ["lateral"] },
      ],
      ["specimen:SPEC-0001", "reference:adult-human-skull"],
    );
    const url = new URL(href, "https://example.test");
    expect(url.pathname).toBe("/compare");
    expect(url.searchParams.get("subjects")).toBe(
      "specimen:SPEC-0001,reference:adult-human-skull",
    );
    expect(url.searchParams.get("difference")).toBe(
      "specimen:SPEC-0001,reference:adult-human-skull",
    );
    expect(url.searchParams.get("views")).toContain(
      "specimen:SPEC-0001@lateral",
    );
  });
});
