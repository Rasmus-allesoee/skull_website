import { describe, expect, it } from "vitest";

import { getEligibleSkullComparisons } from "@/data/comparison";

import {
  getDefaultComparisonState,
  maximumComparisonLayers,
  maximumComparisonSubjects,
  parseComparisonState,
  serializeComparisonState,
  type ComparisonWorkbenchState,
} from "./workbenchState";

const records = getEligibleSkullComparisons();

describe("comparison workbench URL state", () => {
  it("uses the approved default pair when no analytical state exists", () => {
    const state = getDefaultComparisonState(records);
    expect(state.subjects.map(({ id }) => id)).toEqual([
      "specimen:SPEC-0001",
      "reference:adult-human-skull",
    ]);
    expect(parseComparisonState("", records).state).toEqual(state);
  });

  it("round-trips ordered subjects, views, pair, arrangement, and filtering", () => {
    const source: ComparisonWorkbenchState = {
      subjects: [
        { id: "specimen:SPEC-0001", views: ["lateral", "dorsal"] },
        { id: "specimen:SPEC-0003", views: ["frontal"] },
      ],
      difference: ["specimen:SPEC-0003", "specimen:SPEC-0001"] as [
        string,
        string,
      ],
      arrangement: "by-view" as const,
      comparableOnly: true,
    };
    const parsed = parseComparisonState(
      serializeComparisonState(source),
      records,
    );
    expect(parsed.warnings).toEqual([]);
    expect(parsed.state).toEqual(source);
  });

  it("retains valid URL state while deduplicating and enforcing limits", () => {
    const ids = records
      .filter((record) => record.kind === "specimen")
      .slice(0, maximumComparisonSubjects + 2)
      .map((record) => record.id);
    const subjects = [...ids, ids[0]!, "specimen:UNKNOWN"].join(",");
    const views = ids.map((id) => `${id}@lateral+dorsal+ventral`).join(";");
    const parsed = parseComparisonState(
      `subjects=${encodeURIComponent(subjects)}&views=${encodeURIComponent(views)}`,
      records,
    );

    expect(parsed.state.subjects).toHaveLength(maximumComparisonSubjects);
    expect(
      parsed.state.subjects.reduce(
        (total, subject) => total + subject.views.length,
        0,
      ),
    ).toBe(maximumComparisonLayers);
    expect(parsed.warnings.length).toBeGreaterThan(0);
  });
});
