import { describe, expect, it } from "vitest";

import { defaultMapState, parseMapState, serializeMapState } from "./mapState";

describe("map URL state", () => {
  it("round-trips collection, specimen, style, and uncertainty state", () => {
    const state = parseMapState(
      "?q=Carnivora&class=mammals&sex=male&lengthMin=40&specimen=SPEC-0013&style=positron&uncertainty=1",
    );
    expect(state.mode).toBe("specimens");
    expect(state.selectedSpecimenId).toBe("SPEC-0013");
    expect(state.style).toBe("positron");
    expect(state.showUncertainty).toBe(true);
    expect(parseMapState(`?${serializeMapState(state)}`)).toEqual(state);
  });

  it("rejects invalid map-only values", () => {
    const state = parseMapState(
      "?specimen=oops&style=satellite&uncertainty=yes",
    );
    expect(state).toEqual(defaultMapState);
  });
});
