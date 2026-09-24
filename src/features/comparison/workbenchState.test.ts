import { describe, expect, it } from "vitest";

import { getEligibleSkullComparisons } from "@/data/comparison";

import {
  addComparisonSubject,
  addComparisonView,
  getComparisonLayerCount,
  getDefaultComparisonState,
  maximumComparisonLayers,
  maximumComparisonSubjects,
  parseComparisonState,
  removeComparisonSubject,
  removeComparisonView,
  reorderComparisonSubjects,
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

  it("accepts the custom arrangement in shareable state", () => {
    const parsed = parseComparisonState(
      "subjects=specimen%3ASPEC-0001&arrange=custom",
      records,
    );
    expect(parsed.warnings).toEqual([]);
    expect(parsed.state.arrangement).toBe("custom");
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

  it("applies view and subject lifecycle with difference fallback atomically", () => {
    const initial = getDefaultComparisonState(records);
    const withView = addComparisonView(initial, "specimen:SPEC-0001", "dorsal");
    expect(getComparisonLayerCount(withView)).toBe(3);
    const withoutView = removeComparisonView(
      withView,
      "specimen:SPEC-0001",
      "dorsal",
    );
    expect(withoutView.subjects[0]?.views).toEqual(["lateral"]);

    const lastViewRemoved = removeComparisonView(
      withoutView,
      "specimen:SPEC-0001",
      "lateral",
    );
    expect(lastViewRemoved.subjects.map(({ id }) => id)).toEqual([
      "reference:adult-human-skull",
    ]);
    expect(lastViewRemoved.difference).toBeNull();

    const restored = addComparisonSubject(
      lastViewRemoved,
      "specimen:SPEC-0002",
      "lateral",
    );
    expect(restored.difference).toEqual([
      "reference:adult-human-skull",
      "specimen:SPEC-0002",
    ]);
    expect(
      removeComparisonSubject(restored, "reference:adult-human-skull")
        .difference,
    ).toBeNull();
  });

  it("reorders selected slots while preserving the directed pair positions", () => {
    const initial = getDefaultComparisonState(records);
    const withThird = addComparisonSubject(
      initial,
      "specimen:SPEC-0003",
      "lateral",
    );
    const reordered = reorderComparisonSubjects(
      withThird,
      "specimen:SPEC-0003",
      "specimen:SPEC-0001",
    );

    expect(reordered.subjects.map(({ id }) => id)).toEqual([
      "specimen:SPEC-0003",
      "specimen:SPEC-0001",
      "reference:adult-human-skull",
    ]);
    expect(reordered.difference).toEqual([
      "specimen:SPEC-0003",
      "specimen:SPEC-0001",
    ]);

    const withLaterPair = {
      ...withThird,
      difference: ["reference:adult-human-skull", "specimen:SPEC-0003"] as [
        string,
        string,
      ],
    };
    const laterPairReordered = reorderComparisonSubjects(
      withLaterPair,
      "specimen:SPEC-0003",
      "specimen:SPEC-0001",
    );
    expect(laterPairReordered.difference).toEqual([
      "specimen:SPEC-0001",
      "reference:adult-human-skull",
    ]);
  });

  it("rejects additions at the ten-layer boundary", () => {
    const initial = getDefaultComparisonState(records);
    const fiveViews = [
      "lateral",
      "frontal",
      "dorsal",
      "ventral",
      "mandible-dorsal",
    ] as const;
    const saturated: ComparisonWorkbenchState = {
      ...initial,
      subjects: initial.subjects.map((subject) => ({
        ...subject,
        views: [...fiveViews],
      })),
    };
    expect(getComparisonLayerCount(saturated)).toBe(maximumComparisonLayers);
    expect(
      addComparisonSubject(saturated, "specimen:SPEC-0002", "lateral"),
    ).toBe(saturated);
  });

  it("warns about unknown state versions while retaining valid settings", () => {
    const parsed = parseComparisonState(
      "v=99&subjects=specimen%3ASPEC-0001&views=specimen%3ASPEC-0001%40lateral",
      records,
    );
    expect(parsed.state.subjects[0]?.id).toBe("specimen:SPEC-0001");
    expect(parsed.warnings[0]).toContain("version 99");
  });
});
