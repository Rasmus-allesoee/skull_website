import { describe, expect, it } from "vitest";

import {
  isProductionAnalyticsDeployment,
  redactAnalyticsUrl,
} from "./analytics";

describe("production analytics boundary", () => {
  it("only enables analytics for Vercel production builds", () => {
    expect(
      isProductionAnalyticsDeployment({
        VERCEL: "1",
        VERCEL_ENV: "production",
      }),
    ).toBe(true);
    expect(
      isProductionAnalyticsDeployment({
        VERCEL: "1",
        VERCEL_ENV: "preview",
      }),
    ).toBe(false);
    expect(isProductionAnalyticsDeployment({})).toBe(false);
  });

  it("removes query parameters and fragments from tracked URLs", () => {
    expect(
      redactAnalyticsUrl({
        type: "pageview",
        url: "https://skullwebsite-xi.vercel.app/species?q=private-search#results",
      }),
    ).toEqual({
      type: "pageview",
      url: "https://skullwebsite-xi.vercel.app/species",
    });
  });

  it("handles relative URLs defensively", () => {
    expect(
      redactAnalyticsUrl({
        type: "pageview",
        url: "/map?specimen=SPEC-0001",
      }),
    ).toEqual({ type: "pageview", url: "/map" });
  });
});
