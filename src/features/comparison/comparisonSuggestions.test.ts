import { describe, expect, it } from "vitest";

import { getEligibleSkullComparisons } from "@/data/comparison";

import {
  getComparisonStartingPoints,
  getContextualComparisonSuggestions,
} from "./comparisonSuggestions";

const records = getEligibleSkullComparisons();

describe("comparison suggestions", () => {
  it("derives deterministic, bounded starting points from canonical records", () => {
    const first = getComparisonStartingPoints(records);
    const second = getComparisonStartingPoints(records);
    expect(first).toEqual(second);
    expect(first[0]?.subjectIds).toEqual([
      "specimen:SPEC-0001",
      "reference:adult-human-skull",
    ]);
    expect(first.every(({ subjectIds }) => subjectIds.length <= 5)).toBe(true);
  });

  it("suggests only unselected canonical subjects", () => {
    const selected = ["specimen:SPEC-0001"];
    const suggestions = getContextualComparisonSuggestions(records, selected);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(5);
    expect(suggestions.every(({ id }) => !selected.includes(id))).toBe(true);
  });
});
