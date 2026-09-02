import { describe, expect, it } from "vitest";

import { getCatalog } from "@/data/catalog";

import { distributeHeroCandidates, getHomePageModel } from "./home";

describe("Home page model", () => {
  it("shows ten varied specimens per state and covers every published specimen across the cycle", () => {
    const model = getHomePageModel();
    const visibleIds = model.heroStates.flatMap((state) =>
      state.specimens.map((specimen) => specimen.specimenId),
    );
    const publishedIds = getCatalog().specimens.map(
      ({ specimen }) => specimen.specimenId,
    );

    expect(model.heroStates).toHaveLength(3);
    expect(
      model.heroStates.every((state) => state.specimens.length === 10),
    ).toBe(true);
    expect(new Set(visibleIds)).toEqual(new Set(publishedIds));
    const firstViews = new Set(
      model.heroStates[0]!.specimens.map((specimen) => specimen.image.view),
    );
    for (const view of [
      "lateral",
      "oblique",
      "frontal",
      "dorsal",
      "mandible-dorsal",
      "ventral",
    ] as const) {
      expect(firstViews.has(view)).toBe(true);
    }
    expect(
      model.heroStates
        .flatMap((state) => state.specimens)
        .every((specimen) =>
          specimen.href.endsWith(`/specimens/${specimen.specimenId}`),
        ),
    ).toBe(true);
  });

  it("keeps small collections useful without creating empty states", () => {
    const candidates = getHomePageModel().heroStates[0]!.specimens.slice(0, 3);
    const states = distributeHeroCandidates(candidates);

    expect(states).toHaveLength(1);
    expect(states[0]!.specimens).toHaveLength(3);
  });
});
