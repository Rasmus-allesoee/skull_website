import { expect, test } from "@playwright/test";

test("public pages expose release security headers and route-scoped CSP", async ({
  request,
}) => {
  const home = await request.get("/");
  expect(home.ok()).toBe(true);
  expect(home.headers()["strict-transport-security"]).toBe(
    "max-age=63072000; includeSubDomains; preload",
  );
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  expect(home.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(home.headers()["permissions-policy"]).toContain("camera=()");
  expect(home.headers()["content-security-policy"]).toContain(
    "connect-src 'self'",
  );
  expect(home.headers()["content-security-policy"]).not.toContain(
    "tiles.openfreemap.org",
  );

  const map = await request.get("/map");
  expect(map.ok()).toBe(true);
  expect(map.headers()["content-security-policy"]).toContain(
    "connect-src 'self' https://tiles.openfreemap.org",
  );
  expect(map.headers()["content-security-policy"]).toContain(
    "worker-src 'self' blob:",
  );
});

test("metadata, structured data, robots, and every sitemap route are valid", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Skull Collection");
  const canonicalUrl = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(canonicalUrl).not.toBeNull();
  expect(new URL(canonicalUrl!).pathname).toBe("/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^https?:\/\//,
  );

  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(structuredData).not.toBeNull();
  expect(JSON.parse(structuredData!)).toMatchObject({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Skull Collection",
    creator: {
      "@type": "Person",
      email: "mailto:rasmus.allesoee@gmail.com",
    },
  });

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Allow: /");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const locations = [
    ...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g),
  ].map(([, location]) => location!);
  expect(locations.length).toBeGreaterThan(60);
  for (const location of locations) {
    const route = new URL(location).pathname;
    const response = await request.get(route);
    expect(response.ok(), `${route} should resolve`).toBe(true);
  }
});
