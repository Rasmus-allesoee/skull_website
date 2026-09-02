import { describe, expect, it } from "vitest";

import { getCatalog } from "@/data/catalog";
import {
  getHeroDepthPresentation,
  heroDepthProfile,
} from "@/domain/home/depth";

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
    expect(
      model.heroStates.every((state) =>
        state.specimens.every(
          (specimen, index) =>
            specimen.depth ===
            heroDepthProfile[index % heroDepthProfile.length],
        ),
      ),
    ).toBe(true);
  });

  it("derives all depth cues monotonically from one normalized value", () => {
    const background = getHeroDepthPresentation(0.2);
    const foreground = getHeroDepthPresentation(0.9);

    expect(foreground.scale).toBeGreaterThan(background.scale);
    expect(foreground.opacity).toBeGreaterThan(background.opacity);
    expect(foreground.blurPx).toBeLessThan(background.blurPx);
    expect(foreground.brightness).toBeGreaterThan(background.brightness);
    expect(foreground.contrast).toBeGreaterThan(background.contrast);
    expect(foreground.parallaxX).toBeGreaterThan(background.parallaxX);
    expect(foreground.parallaxY).toBeGreaterThan(background.parallaxY);
    expect(foreground.zIndex).toBeGreaterThan(background.zIndex);
  });

  it("keeps small collections useful without creating empty states", () => {
    const candidates = getHomePageModel().heroStates[0]!.specimens.slice(0, 3);
    const states = distributeHeroCandidates(candidates);

    expect(states).toHaveLength(1);
    expect(states[0]!.specimens).toHaveLength(3);
  });
});
