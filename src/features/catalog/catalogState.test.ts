import { describe, expect, it } from "vitest";

import {
  defaultCatalogState,
  parseCatalogState,
  serializeCatalogState,
} from "./catalogState";

describe("catalog URL state", () => {
  it("round-trips meaningful catalog state deterministically", () => {
    const state = parseCatalogState(
      "?massMax=900&mode=specimens&q=M%C3%A5rhund&condition=good,fair&scope=family:canidae&sort=skull-length",
    );
    expect(state).toEqual({
      ...defaultCatalogState,
      query: "Mårhund",
      mode: "specimens",
      scope: { rank: "family", slug: "canidae" },
      condition: ["fair", "good"],
      massMax: 900,
      sort: "skull-length",
    });
    expect(serializeCatalogState(state)).toBe(
      "q=M%C3%A5rhund&mode=specimens&scope=family%3Acanidae&condition=fair%2Cgood&massMax=900&sort=skull-length",
    );
  });

  it("rejects malformed state and numeric sorting in species mode", () => {
    expect(
      parseCatalogState(
        "?mode=unknown&scope=family:bad:slug&lengthMin=-2&sort=skull-mass",
      ),
    ).toEqual(defaultCatalogState);
  });
});
