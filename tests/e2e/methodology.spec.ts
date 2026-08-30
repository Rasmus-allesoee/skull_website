import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("measurement reference renders canonical content, geometry, and accessible desktop interactions", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/methodology");

  await expect(page).toHaveTitle("Measurements | Skull Collection");
  await expect(
    page.getByRole("heading", { level: 1, name: "Measurements" }),
  ).toBeVisible();
  await expect(page.locator(".measurement-figure")).toHaveCount(5);
  await expect(page.locator(".measurement-annotation")).toHaveCount(24);
  await expect(
    page.locator(".measurement-reference-table tbody tr"),
  ).toHaveCount(21);
  await expect(page.locator(".measurement-diagram-stage > img")).toHaveCount(5);

  const firstOccurrence = page
    .locator('[data-diagram-id="lateral-skull"][data-measurement-number="1"]')
    .first();
  await firstOccurrence.locator(".measurement-number-backdrop").hover();
  await expect(page.getByRole("tooltip")).toContainText("1. Skull length");
  await firstOccurrence.focus();
  await expect(firstOccurrence).toBeFocused();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Skull length" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Greatest straight-line distance");
  await expect(
    page.locator('[data-measurement-number="1"][data-selected="true"]'),
  ).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(firstOccurrence).toBeFocused();

  await page
    .getByRole("button", {
      name: "Open details for measurement 21: Mandibular canine length",
    })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Mandibular canine length" }),
  ).toContainText("cusp tip → root apex");
  await page.getByRole("button", { name: "Close measurement details" }).click();
  await expect(
    page.getByRole("button", {
      name: "Open details for measurement 21: Mandibular canine length",
    }),
  ).toBeFocused();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("touch uses preview before details and narrow layouts contain scrolling diagrams without page overflow", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/methodology");
  const firstOccurrence = page
    .locator('[data-diagram-id="lateral-skull"][data-measurement-number="1"]')
    .first();
  await firstOccurrence.locator(".measurement-number-backdrop").tap();
  await expect(page.getByRole("tooltip")).toContainText("Skull length");
  await expect(
    page.getByRole("button", { name: "View details" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await firstOccurrence.locator(".measurement-number-backdrop").tap();
  await expect(
    page.getByRole("dialog", { name: "Skull length" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const geometry = await page.locator("body").evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    boardWidth: document
      .querySelector(".measurement-board")!
      .getBoundingClientRect().width,
    figureWidths: Array.from(
      document.querySelectorAll(".measurement-figure"),
    ).map((element) => element.getBoundingClientRect().width),
    scrollableFigures: Array.from(
      document.querySelectorAll(".measurement-diagram-scroll"),
    ).filter((element) => element.scrollWidth > element.clientWidth).length,
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(
    geometry.figureWidths.every((width) => width <= geometry.boardWidth),
  ).toBe(true);
  expect(geometry.scrollableFigures).toBe(0);

  await page.setViewportSize({ width: 360, height: 800 });
  await page.reload();
  const narrowGeometry = await page.locator("body").evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    figuresInsideViewport: Array.from(
      document.querySelectorAll(".measurement-figure"),
    ).every((element) => {
      const box = element.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth;
    }),
  }));
  expect(narrowGeometry.overflow).toBeLessThanOrEqual(0);
  expect(narrowGeometry.figuresInsideViewport).toBe(true);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  await context.close();
});

test("measurement reference reflows at effective 200% width and respects reduced motion and forced colors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/methodology");
  const geometry = await page.locator("body").evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    columns: getComputedStyle(document.querySelector(".measurement-board")!)
      .gridTemplateColumns,
    transition: getComputedStyle(
      document.querySelector(".measurement-annotation")!,
    ).transitionDuration,
  }));
  expect(geometry.overflow).toBeLessThanOrEqual(0);
  expect(geometry.columns.trim().split(/\s+/)).toHaveLength(1);
  expect(Number.parseFloat(geometry.transition)).toBeLessThanOrEqual(0.00001);
});

test("measurement definitions and figures remain useful without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/methodology");
  await expect(
    page.getByRole("heading", { level: 1, name: "Measurements" }),
  ).toBeVisible();
  await expect(page.locator(".measurement-figure")).toHaveCount(5);
  await expect(page.locator(".measurement-annotation")).toHaveCount(24);
  await expect(
    page.locator(".measurement-reference-table tbody tr"),
  ).toHaveCount(21);
  await expect(
    page.getByText("Maxillary canine length", { exact: true }),
  ).toBeVisible();
  await context.close();
});
