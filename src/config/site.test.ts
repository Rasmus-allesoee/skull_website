import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./site";

describe("site URL resolution", () => {
  it("prefers the explicit canonical URL and removes its trailing slash", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://skulls.example/",
        VERCEL_PROJECT_PRODUCTION_URL: "skull-collection.vercel.app",
      }),
    ).toBe("https://skulls.example");
  });

  it("uses Vercel's stable production domain before a deployment URL", () => {
    expect(
      resolveSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "skull-collection.vercel.app",
        VERCEL_URL: "skull-collection-git-release.vercel.app",
      }),
    ).toBe("https://skull-collection.vercel.app");
  });

  it("keeps local development deterministic", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });
});
