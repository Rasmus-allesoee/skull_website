import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const defaultRoute = "/compare";

test("default comparison is static, semantic, accessible, and error-free", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(defaultRoute);

  await expect(page).toHaveTitle("Compare skulls | Skull Collection");
  await expect(
    page.getByRole("heading", { level: 1, name: "Compare skulls" }),
  ).toBeVisible();
  await expect(page.locator(".compare-subject-card")).toHaveCount(2);
  await expect(page.locator(".comparison-layer")).toHaveCount(2);
  await expect
    .poll(() =>
      page
        .locator(".comparison-layer img")
        .evaluateAll((images) =>
          images.map((image) => (image as HTMLImageElement).naturalWidth),
        ),
    )
    .toEqual(expect.arrayContaining([3200]));
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("link", { name: "Max length" })).toHaveAttribute(
    "href",
    "/methodology#measurement-definition-1",
  );
  await expect(
    page.getByRole("link", { name: "Compare", exact: true }).first(),
  ).toHaveAttribute("href", "/compare");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
  expect(consoleErrors).toEqual([]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("desktop field supports wheel navigation, reset, compact labels, scale-bar movement, and dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(defaultRoute);

  const field = page.locator(".comparison-field");
  const fieldBounds = await field.boundingBox();
  expect(fieldBounds).not.toBeNull();

  const firstHit = page.locator(".comparison-layer-hit").first();
  await firstHit.locator("path").click({ force: true });
  await expect(page.locator(".comparison-layer-toolbar")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator(".comparison-layer-toolbar")).toHaveCount(0);

  const hitSurface = await firstHit.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    border: getComputedStyle(element).borderColor,
  }));
  expect(hitSurface).toEqual({
    background: "rgba(0, 0, 0, 0)",
    border: "rgba(0, 0, 0, 0)",
  });
  expect(
    await page
      .locator(".comparison-layer figcaption")
      .first()
      .evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
  ).toBeLessThan(12);

  const beforeWheel = await field.getAttribute("style");
  await page.mouse.move(
    fieldBounds!.x + fieldBounds!.width / 2,
    fieldBounds!.y + fieldBounds!.height / 2,
  );
  await page.mouse.wheel(36, 84);
  await expect.poll(() => field.getAttribute("style")).not.toBe(beforeWheel);

  await page.getByRole("button", { name: "Fit all" }).click();
  const firstLayer = page.locator(".comparison-layer").first();
  const outline = firstLayer.locator(".comparison-layer-outline");
  const outlineBounds = await outline.boundingBox();
  const beforeMove = await firstLayer.evaluate((element) =>
    element.style.getPropertyValue("--layer-x"),
  );
  await page.mouse.move(
    outlineBounds!.x + outlineBounds!.width / 2,
    outlineBounds!.y + outlineBounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    outlineBounds!.x + outlineBounds!.width / 2 + 72,
    outlineBounds!.y + outlineBounds!.height / 2 + 12,
  );
  await page.mouse.up();
  const moved = await firstLayer.evaluate((element) =>
    element.style.getPropertyValue("--layer-x"),
  );
  expect(moved).not.toBe(beforeMove);
  await page.locator(".compare-arrangement-control select").click();
  await expect
    .poll(() =>
      firstLayer.evaluate((element) =>
        element.style.getPropertyValue("--layer-x"),
      ),
    )
    .not.toBe(moved);

  await page.locator(".compare-field-more summary").click();
  await page.getByLabel("Show 100 mm scale bar").check();
  const scaleBar = page.locator(".comparison-scale-bar");
  const scaleBarBounds = await scaleBar.boundingBox();
  expect(scaleBarBounds).not.toBeNull();
  expect(scaleBarBounds!.x).toBeGreaterThanOrEqual(fieldBounds!.x);
  expect(scaleBarBounds!.y).toBeGreaterThanOrEqual(fieldBounds!.y);
  expect(scaleBarBounds!.x + scaleBarBounds!.width).toBeLessThanOrEqual(
    fieldBounds!.x + fieldBounds!.width,
  );
  expect(scaleBarBounds!.y + scaleBarBounds!.height).toBeLessThanOrEqual(
    fieldBounds!.y + fieldBounds!.height,
  );
  await scaleBar.hover();
  const beforeScaleBarMove = await scaleBar.boundingBox();
  await page.mouse.move(
    beforeScaleBarMove!.x + beforeScaleBarMove!.width / 2,
    beforeScaleBarMove!.y + beforeScaleBarMove!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    beforeScaleBarMove!.x + beforeScaleBarMove!.width / 2 + 56,
    beforeScaleBarMove!.y + beforeScaleBarMove!.height / 2 + 18,
  );
  await page.mouse.up();
  const afterScaleBarMove = await scaleBar.boundingBox();
  expect(afterScaleBarMove!.x).toBeGreaterThan(beforeScaleBarMove!.x);
  expect(afterScaleBarMove!.y).toBeGreaterThan(beforeScaleBarMove!.y);

  await field.click({ position: { x: 20, y: 20 } });
  await expect(page.locator(".compare-field-more[open]")).toHaveCount(0);
  await page.locator(".compare-opacity-control summary").first().click();
  await page.getByRole("heading", { name: "Compare skulls" }).click();
  await expect(page.locator(".compare-page details[open]")).toHaveCount(0);

  await page.locator(".compare-field-more summary").click();
  await page.getByLabel("Show view labels").uncheck();
  await expect(page.locator(".comparison-layer figcaption")).toHaveCount(0);
});

test("multi-view field enforces limits and preserves directed table semantics", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(defaultRoute);

  const firstCard = page.locator(".compare-subject-card").first();
  await firstCard.locator(".compare-view-menu summary").click();
  for (const view of [
    "Frontal Add",
    "Dorsal Add",
    "Ventral Add",
    "Mandible — dorsal Add",
  ]) {
    await firstCard.getByRole("button", { name: view, exact: true }).click();
    if (view !== "Mandible — dorsal Add") {
      await firstCard.locator(".compare-view-menu summary").click();
    }
  }
  await expect(page.locator(".comparison-layer")).toHaveCount(6);

  await page
    .getByRole("button", { name: /Add skull Search collection/ })
    .click();
  const picker = page.getByRole("dialog", { name: "Add a skull" });
  await picker
    .getByRole("combobox", { name: "Search skulls" })
    .fill("razorbill");
  await picker.getByRole("option", { name: /SPEC-0002$/ }).click();
  const birdCard = page.locator(".compare-subject-card").nth(2);
  await birdCard.locator(".compare-view-menu summary").click();
  for (const view of ["Dorsal Add", "Ventral Add", "Mandible — dorsal Add"]) {
    await birdCard.getByRole("button", { name: view, exact: true }).click();
    if (view !== "Mandible — dorsal Add") {
      await birdCard.locator(".compare-view-menu summary").click();
    }
  }

  await expect(page.locator(".comparison-layer")).toHaveCount(10);
  await expect(page.locator(".compare-add-skull")).toBeDisabled();
  await expect(page.locator(".compare-add-skull")).toContainText(
    "10-view field limit reached",
  );

  const firstOutline = page.locator(".comparison-layer-outline").first();
  const firstLayer = page.locator(".comparison-layer").first();
  const before = await firstLayer.evaluate((layer) =>
    layer.style.getPropertyValue("--layer-x"),
  );
  const bounds = await firstOutline.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds!.x + bounds!.width / 2 + 60,
    bounds!.y + bounds!.height / 2 + 30,
  );
  await page.mouse.up();
  const after = await firstLayer.evaluate((layer) =>
    layer.style.getPropertyValue("--layer-x"),
  );
  expect(after).not.toBe(before);

  await page
    .getByLabel("Difference pair")
    .selectOption("specimen:SPEC-0001|specimen:SPEC-0002");
  await expect(page.locator(".comparison-difference-heading small")).toHaveText(
    "S1 − S3",
  );
  await expect(page.locator(".comparison-cross-class-note")).toContainText(
    "not claims of anatomical homology",
  );
  await expect(page.locator(".comparison-table tbody tr")).toHaveCount(6);

  await firstCard.locator(".compare-opacity-control summary").click();
  await firstCard.getByRole("slider", { name: "Skull 1 opacity" }).fill("0");
  await expect(
    page.locator('.comparison-layer[data-hidden="true"]'),
  ).toHaveCount(5);
  await expect(page).toHaveURL(
    /difference=specimen%3ASPEC-0001%2Cspecimen%3ASPEC-0002/,
  );
});

test("invalid shared state recovers valid entries and browser history restores state", async ({
  page,
}) => {
  await page.goto(
    "/compare?v=99&subjects=specimen%3ASPEC-0001%2Cspecimen%3AUNKNOWN&views=specimen%3ASPEC-0001%40lateral%2Boblique",
  );
  await expect(
    page.getByRole("complementary", { name: "Comparison link recovery" }),
  ).toContainText("Unknown comparison-link version 99");
  await expect(page.locator(".compare-subject-card")).toHaveCount(1);
  await expect(page.locator(".comparison-layer")).toHaveCount(1);

  await page
    .getByRole("button", { name: /Add skull Search collection/ })
    .click();
  const picker = page.getByRole("dialog", { name: "Add a skull" });
  await picker.getByRole("combobox", { name: "Search skulls" }).fill("human");
  await picker.getByRole("option", { name: /Adult human skull/ }).click();
  await expect(page.locator(".compare-subject-card")).toHaveCount(2);
  await page.goBack();
  await expect(page.locator(".compare-subject-card")).toHaveCount(1);
  await page.goForward();
  await expect(page.locator(".compare-subject-card")).toHaveCount(2);
});

test("mobile comparison uses internal strips and stacked measurement cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(defaultRoute);
  await expect(page.locator(".comparison-field")).toBeVisible();
  await expect(page.locator(".comparison-table tbody")).toHaveCSS(
    "display",
    "grid",
  );
  await expect(page.locator(".comparison-table tbody tr").first()).toHaveCSS(
    "display",
    "grid",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

test("mixed-class tables keep mapped shared rows and reveal the full measurement set", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    "/compare?subjects=specimen%3ASPEC-0001%2Cspecimen%3ASPEC-0003%2Cspecimen%3ASPEC-0006&views=specimen%3ASPEC-0001%40lateral%3Bspecimen%3ASPEC-0003%40lateral%3Bspecimen%3ASPEC-0006%40lateral",
  );

  await expect(page.locator(".comparison-table tbody tr")).toHaveCount(6);
  for (const label of ["Width (orbital ↔ max)", "Height (cranium ↔ skull)"]) {
    const row = page.locator(".comparison-table tbody tr").filter({
      hasText: label,
    });
    await expect(row).toHaveCount(1);
    await expect(row).not.toContainText("Not applicable");
  }

  await page.getByRole("button", { name: /Show all measurements/ }).click();
  await expect
    .poll(() => page.locator(".comparison-table tbody tr").count())
    .toBeGreaterThan(6);
  const allRows = await page.locator(".comparison-table tbody tr").count();
  expect(allRows).toBeGreaterThan(6);
  await expect(page.locator(".comparison-table tbody tr")).toHaveCount(allRows);
  await expect(
    page
      .locator(".comparison-table tbody tr")
      .filter({ hasText: "Bill length" }),
  ).toHaveCount(1);
  await expect(
    page
      .locator(".comparison-table thead th")
      .filter({ hasText: "Raccoon dog" }),
  ).toHaveCount(1);
  await expect(
    page
      .locator(".comparison-table thead th")
      .filter({ hasText: "Domestic cat" }),
  ).toHaveCount(1);
});

test("five-subject rail stays bounded and supports card and table-column reordering", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    "/compare?subjects=specimen%3ASPEC-0001%2Cspecimen%3ASPEC-0002%2Cspecimen%3ASPEC-0003%2Cspecimen%3ASPEC-0004%2Cspecimen%3ASPEC-0005&views=specimen%3ASPEC-0001%40lateral%3Bspecimen%3ASPEC-0002%40lateral%3Bspecimen%3ASPEC-0003%40lateral%3Bspecimen%3ASPEC-0004%40lateral%3Bspecimen%3ASPEC-0005%40lateral",
  );

  const rail = page.locator(".compare-subject-rail");
  const fieldPanel = page.locator(".compare-field-panel");
  const railBounds = await rail.boundingBox();
  const panelBounds = await fieldPanel.boundingBox();
  expect(railBounds).not.toBeNull();
  expect(panelBounds).not.toBeNull();
  expect(Math.abs(railBounds!.height - panelBounds!.height)).toBeLessThan(2);

  const lastCard = page.locator(".compare-subject-card").last();
  await lastCard.locator(".compare-view-menu summary").click();
  await expect(
    lastCard.getByRole("button", { name: "Mandible — dorsal Add" }),
  ).toBeVisible();

  const secondCard = page.locator(".compare-subject-card").nth(1);
  const secondName = await secondCard.locator("h2").innerText();
  await secondCard
    .getByRole("button", { name: "Move Skull 2 before Skull 1" })
    .click();
  await expect(
    page.locator(".compare-subject-card").first().locator("h2"),
  ).toHaveText(secondName);

  const headers = page.locator(".comparison-table thead th[draggable='true']");
  const firstHeader = await headers.nth(0).locator("strong").innerText();
  const secondHeader = await headers.nth(1).locator("strong").innerText();
  await headers.nth(0).dragTo(headers.nth(1));
  await expect(headers.nth(0).locator("strong")).toHaveText(secondHeader);
  await expect(headers.nth(1).locator("strong")).toHaveText(firstHeader);

  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto("/compare");
  const mediumRailBounds = await page
    .locator(".compare-subject-rail")
    .boundingBox();
  const mediumPanelBounds = await page
    .locator(".compare-field-panel")
    .boundingBox();
  expect(mediumRailBounds).not.toBeNull();
  expect(mediumPanelBounds).not.toBeNull();
  expect(
    Math.abs(mediumRailBounds!.height - mediumPanelBounds!.height),
  ).toBeLessThan(2);
  await expect(page.locator(".compare-field-toolbar")).toHaveCSS(
    "flex-wrap",
    "nowrap",
  );
});

test("two-finger touch pans and zooms the field camera", async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Touch injection requires CDP.");
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(defaultRoute);
  const field = page.locator(".comparison-field");
  await field.scrollIntoViewIfNeeded();
  const box = await field.boundingBox();
  expect(box).not.toBeNull();
  const initialZoom = Number(await page.getByLabel("Field zoom").inputValue());
  const session = await context.newCDPSession(page);
  const centerX = box!.x + box!.width / 2;
  const startY = box!.y + 24;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: centerX - 30, y: startY, id: 51 },
      { x: centerX + 30, y: startY, id: 52 },
    ],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: centerX - 90, y: startY + 24, id: 51 },
      { x: centerX + 90, y: startY + 24, id: 52 },
    ],
  });
  await expect
    .poll(() => page.getByLabel("Field zoom").inputValue())
    .not.toBe(String(initialZoom));
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.locator(".comparison-field-status")).toContainText(
    "Field pan and zoom updated",
  );
  await context.close();
});

test("one-finger touch on the field remains available for page scrolling", async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Touch injection requires CDP.");
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(defaultRoute);
  const field = page.locator(".comparison-field");
  await field.scrollIntoViewIfNeeded();
  const box = await field.boundingBox();
  expect(box).not.toBeNull();
  const startX = box!.x + box!.width / 2;
  const startY = box!.y + 220;
  const initialScrollY = await page.evaluate(() => window.scrollY);
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y: startY, id: 61 }],
  });
  for (const y of [startY - 40, startY - 90, startY - 140, startY - 190]) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: startX, y, id: 61 }],
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(initialScrollY);
  await context.close();
});

test("site entry points create explicit shareable comparison destinations", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open Skull Comparison" }).click();
  await expect(page).toHaveURL("/compare");

  await page.goto("/species/raccoon-dog/specimens/SPEC-0001");
  const fullComparison = page.getByRole("link", {
    name: "Open full comparison →",
  });
  await expect(fullComparison).toHaveAttribute(
    "href",
    /subjects=specimen%3ASPEC-0001%2Creference%3Aadult-human-skull/,
  );

  await page.goto("/species?mode=specimens");
  const catalogAction = page
    .getByRole("link", { name: "Compare skull SPEC-0001" })
    .first();
  await expect(catalogAction).toHaveAttribute(
    "href",
    /subjects=specimen%3ASPEC-0001/,
  );
});

test("print mode keeps credits and removes interactive controls", async ({
  page,
}) => {
  await page.goto(defaultRoute);
  await page.emulateMedia({ media: "print" });

  await expect(page.locator(".comparison-print-credits")).toBeVisible();
  await expect(page.locator(".comparison-print-credits")).toContainText(
    "Photograph:",
  );
  await expect(page.locator(".compare-field-controls")).toBeHidden();
  await expect(page.getByRole("table")).toBeVisible();
});

test("compact and assistive display modes survive failed comparison images", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.route("**/media/**", (route) => route.abort());
  await page.goto(defaultRoute);

  await expect(page.locator(".comparison-layer-image-fallback")).toHaveCount(2);
  await expect(page.locator(".compare-subject-card")).toHaveCount(2);
  await expect(page.getByRole("table")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

test("default comparison remains useful without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(defaultRoute);
  await expect(
    page.getByRole("heading", { level: 1, name: "Compare skulls" }),
  ).toBeVisible();
  await expect(page.locator(".compare-subject-card")).toHaveCount(2);
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("119 mm", { exact: true })).toBeVisible();
  await context.close();
});
