import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const searchLabel = "Search names, taxonomy, or specimen ID";

test("map-first desktop layout renders the provider map and complete synchronized list", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/map");

  await expect(
    page.getByRole("heading", { level: 1, name: "Explore the collection map" }),
  ).toBeVisible();
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "18 matching specimens" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Show .* on map/ }),
  ).toHaveCount(18);
  await expect(page.getByRole("link", { name: "OpenFreeMap" })).toBeVisible();

  const workspace = await page.locator(".map-workspace").boundingBox();
  const canvas = await page.locator(".maplibregl-canvas").boundingBox();
  expect(workspace).not.toBeNull();
  expect(canvas).not.toBeNull();
  expect(canvas!.height).toBeGreaterThan(workspace!.height * 0.95);
  expect(canvas!.width).toBeGreaterThan(workspace!.width * 0.6);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("higher-rank search scopes physical specimens without duplicates", async ({
  page,
}) => {
  await page.goto("/map");
  const search = page.getByRole("combobox", { name: searchLabel });
  await search.fill("Carnivora");

  const listbox = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(listbox).toBeVisible();
  await expect(
    listbox.getByRole("option", { name: /Carnivora order · Filter results/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "10 matching specimens" }),
  ).toBeVisible();
  const specimenButtons = page.getByRole("button", { name: /Show .* on map/ });
  await expect(specimenButtons).toHaveCount(10);
  expect(
    new Set(
      await specimenButtons.evaluateAll((buttons) =>
        buttons.map((button) => button.getAttribute("aria-label")),
      ),
    ).size,
  ).toBe(10);
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("Carnivora");
});

test("exact specimen deep links synchronize popup, list, URL, and uncertainty semantics", async ({
  page,
}) => {
  await page.goto("/map?specimen=SPEC-0013");
  const popup = page.getByRole("region", { name: "Harbour seal map record" });
  await expect(popup).toBeVisible();
  await expect(popup.getByText("SPEC-0013")).toBeVisible();
  await expect(popup.getByText("Approximate location")).toBeVisible();
  await expect(popup.getByText("100 m")).toBeVisible();
  await expect(
    popup.getByRole("link", { name: "View specimen" }),
  ).toHaveAttribute("href", "/species/harbour-seal/specimens/SPEC-0013");
  await expect(
    page.getByRole("button", { name: "Show Harbour seal, SPEC-0013, on map" }),
  ).toBeVisible();
  await expect(page.locator(".map-canvas-frame")).toHaveAttribute(
    "data-uncertainty-count",
    "1",
  );

  await popup.getByRole("button", { name: "Close map popup" }).click();
  await expect(popup).not.toBeVisible();
  await expect
    .poll(() => new URL(page.url()).searchParams.has("specimen"))
    .toBe(false);
});

test("cluster inspection opens a complete anchored scrollable specimen panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/map");
  const clusterButton = page
    .getByRole("button", { name: /Inspect cluster of \d+ specimens/ })
    .first();
  await expect(clusterButton).toBeVisible();
  await clusterButton.focus();
  await expect(clusterButton).toBeFocused();
  await clusterButton.press("Enter");
  const cluster = page.locator(".map-cluster-popup");
  await expect(cluster).toBeVisible();
  const heading = cluster.getByRole("heading", {
    name: /specimens in this area/,
  });
  const count = Number.parseInt((await heading.textContent()) ?? "0", 10);
  expect(count).toBeGreaterThan(1);
  await expect(
    cluster.getByRole("link", { name: "View specimen" }),
  ).toHaveCount(count);
  const popupBox = await cluster.boundingBox();
  const mapBox = await page.locator(".map-region").boundingBox();
  expect(popupBox!.x).toBeGreaterThanOrEqual(mapBox!.x);
  expect(popupBox!.x + popupBox!.width).toBeLessThanOrEqual(
    mapBox!.x + mapBox!.width,
  );
  expect(popupBox!.y).toBeGreaterThanOrEqual(mapBox!.y);
  expect(popupBox!.y + popupBox!.height).toBeLessThanOrEqual(
    mapBox!.y + mapBox!.height,
  );
  await expect(cluster.locator("ul")).toHaveCSS("overflow-y", "auto");
  await cluster.getByRole("button", { name: "Close map popup" }).click();
  await expect(clusterButton).toBeFocused();
});

test("style and uncertainty controls preserve the collection state", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/map?q=fox");
  await expect(
    page.getByRole("heading", { level: 2, name: "1 matching specimen" }),
  ).toBeVisible();
  for (const style of ["dark", "positron", "liberty", "bright", "fiord"]) {
    await page.getByLabel("Base map style").selectOption(style);
    await expect(page.locator(".map-canvas-frame")).toHaveAttribute(
      "data-map-style",
      style,
    );
    await expect(page.locator(".map-canvas-frame")).toHaveAttribute(
      "data-map-ready",
      "true",
    );
    await expect
      .poll(() => new URL(page.url()).searchParams.get("q"))
      .toBe("fox");
  }
  await expect
    .poll(() => new URL(page.url()).searchParams.has("style"))
    .toBe(false);
  const uncertainty = page.getByRole("button", {
    name: "Show uncertainty areas",
  });
  await uncertainty.click();
  await expect(uncertainty).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("uncertainty"))
    .toBe("1");
  expect(pageErrors).toEqual([]);
});

test("specimen records expose exact map deep links", async ({ page }) => {
  await page.goto("/species/harbour-seal/specimens/SPEC-0013");
  await expect(page.getByRole("link", { name: "View on map" })).toHaveAttribute(
    "href",
    "/map?specimen=SPEC-0013",
  );
});

test("MapLibre remains isolated from non-map route bundles", async ({
  page,
}) => {
  const mapLibreChunks = findMapLibreChunkNames();
  expect(mapLibreChunks.length).toBeGreaterThan(0);
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/species");
  expect(
    requests.some((url) => mapLibreChunks.some((name) => url.includes(name))),
  ).toBe(false);
  requests.length = 0;
  await page.goto("/map");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  expect(
    requests.some((url) => mapLibreChunks.some((name) => url.includes(name))),
  ).toBe(true);
});

test("mobile keeps the map primary and exposes the complete result sheet", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/map");
  const canvas = page.locator(".maplibregl-canvas");
  await expect(canvas).toBeVisible();
  const geometry = await canvas.boundingBox();
  expect(geometry!.height).toBeGreaterThan(430);
  const trigger = page.getByRole("button", {
    name: "View 18 specimen records",
  });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const sheet = page.locator(".map-results");
  await expect(sheet).toHaveClass(/is-open/);
  await expect(
    sheet.getByRole("button", { name: /Show .* on map/ }),
  ).toHaveCount(18);
  await sheet.locator(".map-results-close").click();
  await expect(sheet).not.toHaveClass(/is-open/);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("no-JavaScript output retains every exact record link", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/map");
  await expect(
    page.getByRole("heading", { level: 1, name: "Explore the collection map" }),
  ).toBeVisible();
  await expect(
    page.getByText(/interactive map requires JavaScript/i),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "View specimen" })).toHaveCount(
    18,
  );
  await expect(page.locator(".maplibregl-canvas")).toHaveCount(0);
  await context.close();
});

test("no-WebGL and provider failure retain the semantic collection", async ({
  browser,
}) => {
  const noWebGlContext = await browser.newContext();
  const noWebGlPage = await noWebGlContext.newPage();
  await noWebGlPage.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type,
      ...args
    ) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    } as typeof original;
  });
  await noWebGlPage.goto("/map");
  await expect(noWebGlPage.getByText(/cannot start WebGL/i)).toBeVisible();
  await expect(
    noWebGlPage.getByRole("link", { name: "View specimen" }),
  ).toHaveCount(18);
  await noWebGlContext.close();

  const providerContext = await browser.newContext();
  const providerPage = await providerContext.newPage();
  await providerPage.route("https://tiles.openfreemap.org/styles/**", (route) =>
    route.abort(),
  );
  await providerPage.goto("/map");
  await expect(
    providerPage.getByText(/selected basemap style could not be loaded/i),
  ).toBeVisible();
  await expect(
    providerPage.getByRole("link", { name: "View specimen" }),
  ).toHaveCount(18);
  await providerContext.close();
});

test("map workspace reflows across desktop, drawer, mobile, landscape, and accessibility media states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/map");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();

  for (const viewport of [
    { width: 1025, height: 900 },
    { width: 1024, height: 900 },
    { width: 768, height: 900 },
    { width: 720, height: 900 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator(".maplibregl-canvas")).toBeVisible();
    const workspace = await page.locator(".map-workspace").boundingBox();
    expect(workspace).not.toBeNull();
    expect(workspace!.width).toBeLessThanOrEqual(viewport.width);
    expect(workspace!.height).toBeGreaterThanOrEqual(300);
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  }

  await page.setViewportSize({ width: 720, height: 900 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await expect(page.locator(".map-key > summary")).toHaveText("Map key");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("map shell has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/map?specimen=SPEC-0001");
  await expect(
    page.getByRole("region", { name: "Raccoon dog map record" }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}

function findMapLibreChunkNames() {
  const directory = path.join(process.cwd(), ".next", "static", "chunks");
  return readdirSync(directory)
    .filter((name) => name.endsWith(".js"))
    .filter((name) =>
      readFileSync(path.join(directory, name), "utf8").includes("maplibre"),
    );
}
