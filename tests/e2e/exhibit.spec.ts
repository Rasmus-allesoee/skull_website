import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const taxonPath = "/species/raccoon-dog";
const specimenPath = "/species/raccoon-dog/specimens/SPEC-0001";

test("taxon/default and exact specimen deep links are static, distinct, and accessible", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(taxonPath);
  await expect(page).toHaveTitle("Raccoon dog skull | Skull Collection");
  await expect(
    page.getByRole("heading", { level: 1, name: "Raccoon dog" }),
  ).toBeVisible();
  await expect(page.getByText("Default taxon exhibit")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    taxonPath,
  );
  await expect(
    page
      .getByText("Sex", { exact: true })
      .locator("..")
      .getByText("Not recorded"),
  ).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);

  await page.getByRole("link", { name: /SPEC-0001/ }).click();
  await expect(page).toHaveURL(specimenPath);
  await expect(page).toHaveTitle(
    "Raccoon dog skull · SPEC-0001 | Skull Collection",
  );
  await expect(page.getByText("Exact specimen record")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    specimenPath,
  );
  expect(consoleErrors).toEqual([]);
});

test("gallery supports direct selection, arrows, swipe, zoom, Escape, and focus return", async ({
  page,
}) => {
  await page.goto(specimenPath);
  const gallery = page.getByLabel(/Raccoon dog gallery/);

  await page.getByRole("button", { name: "Show dorsal view" }).click();
  await expect(page.getByText("4 / 6 · Dorsal")).toBeVisible();

  await gallery.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("5 / 6 · Ventral")).toBeVisible();

  await gallery.dispatchEvent("pointerdown", {
    clientX: 300,
    pointerId: 1,
    pointerType: "touch",
  });
  await gallery.dispatchEvent("pointerup", {
    clientX: 100,
    pointerId: 1,
    pointerType: "touch",
  });
  await expect(page.getByText("6 / 6 · Mandible — dorsal")).toBeVisible();

  const inspectButton = page.getByRole("button", { name: "Inspect full view" });
  await inspectButton.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Zoom in" }).click();
  await expect(dialog.getByText("125%")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(inspectButton).toBeFocused();
});

test("390 px layout has no horizontal overflow and keeps the real hero image within budget", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(taxonPath);

  await expect(
    page.getByRole("heading", { name: "Raccoon dog" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Show lateral view" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  const heroImage = page.locator(".gallery-image");
  await expect(heroImage).toBeVisible();
  const transferSize = await heroImage.evaluate((image: HTMLImageElement) => {
    const entry = performance.getEntriesByName(image.currentSrc)[0] as
      PerformanceResourceTiming | undefined;
    return entry?.transferSize ?? 0;
  });
  expect(transferSize).toBeLessThanOrEqual(250 * 1024);

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("reduced motion removes gallery animation and core content makes no third-party requests", async ({
  page,
}) => {
  const origins = new Set<string>();
  page.on("request", (request) => origins.add(new URL(request.url()).origin));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(taxonPath);

  const animationDuration = await page
    .locator(".gallery-image")
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(animationDuration)).toBeLessThanOrEqual(0.00001);
  expect([...origins]).toEqual(["http://127.0.0.1:3000"]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("retains identification, all six views, measurements, and provenance", async ({
    page,
  }) => {
    await page.goto(specimenPath);
    await expect(
      page.getByRole("heading", { name: "Raccoon dog" }),
    ).toBeVisible();
    // Playwright's text engine intentionally excludes <noscript> descendants;
    // address the parsed fallback through CSS to verify the real no-JS DOM.
    await expect(page.locator(".no-script-gallery > p")).toHaveText(
      "All specimen views (interactive controls require JavaScript):",
    );
    await expect(
      page.getByRole("heading", { name: "Measurements" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Collection record" }),
    ).toBeVisible();
    await expect(page.locator(".no-script-gallery li")).toHaveCount(6);
  });
});
