import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home and catalog expose published records with metadata and no detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Skull Collection");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A visual archive of animal skulls.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore the collection" }),
  ).toHaveAttribute("href", "/species");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Skull Collection",
  );

  let accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);

  await page.getByRole("link", { name: "Explore the collection" }).click();
  await expect(page).toHaveURL("/species");
  await expect(page).toHaveTitle("Species catalog | Skull Collection");
  await expect(
    page.getByRole("heading", { level: 1, name: "Species" }),
  ).toBeVisible();
  await expect(
    page.getByText("15 results · Sorted by common name"),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "All species" })
      .getByRole("link", { name: /Raccoon dog/i }),
  ).toHaveAttribute("href", "/species/raccoon-dog");
  accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("mobile keyboard journey reaches class, family, taxon, and exact specimen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await activateWithKeyboard(
    page.getByRole("link", { name: /Mammalia/i }).first(),
    page,
  );
  await expect(page).toHaveURL("/taxonomy/class/mammals");
  await expect(
    page.getByRole("heading", { level: 1, name: "Mammalia" }),
  ).toBeVisible();

  const familyLink = page
    .getByRole("region", { name: "Families" })
    .getByRole("link", { name: /Canidae/i });
  await activateWithKeyboard(familyLink, page);
  await expect(page).toHaveURL("/taxonomy/family/canidae");

  const taxonLink = page
    .getByRole("region", { name: "Skulls in Canidae" })
    .getByRole("link", { name: /Raccoon dog/i });
  await activateWithKeyboard(taxonLink, page);
  await expect(page).toHaveURL("/species/raccoon-dog");

  const specimenLink = page
    .getByRole("navigation", { name: "Specimen selector" })
    .getByRole("link", { name: /SPEC-0001/i });
  await activateWithKeyboard(specimenLink, page);
  await expect(page).toHaveURL("/species/raccoon-dog/specimens/SPEC-0001");
  await expect(page.getByText("Exact specimen record")).toBeVisible();
});

test("family galleries form a three-column desktop grid and the compact specimen chooser opens exact records", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/taxonomy/order/carnivora");

  const mustelidae = page.getByRole("region", { name: "Mustelidae" });
  const mustelidCards = mustelidae.locator(".collection-card");
  await expect(mustelidCards).toHaveCount(3);
  const boxes = await mustelidCards.evaluateAll((cards) =>
    cards.map((card) => {
      const box = card.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width };
    }),
  );
  expect(new Set(boxes.map((box) => Math.round(box.y))).size).toBe(1);
  expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
  expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x);

  await page.goto("/species");
  const sealCard = page.locator(".taxon-card", { hasText: "Harbour seal" });
  await sealCard
    .getByRole("button", { name: "Choose from 3 specimens" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Choose a specimen" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link")).toHaveCount(3);
  await expect(dialog.getByText("Age", { exact: true }).first()).toBeVisible();
  await expect(dialog.getByText("Sex", { exact: true }).first()).toBeVisible();
  await expect(
    dialog.getByText("Length", { exact: true }).first(),
  ).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.width).toBeLessThan(800);
  expect(Math.abs(dialogBox!.x + dialogBox!.width / 2 - 720)).toBeLessThan(2);
  expect(Math.abs(dialogBox!.y + dialogBox!.height / 2 - 450)).toBeLessThan(2);

  await dialog.getByRole("link", { name: /SPEC-0013/i }).click();
  await expect(page).toHaveURL("/species/harbour-seal/specimens/SPEC-0013");
  await expect(page.getByText("Exact specimen record")).toBeVisible();
});

test("mobile catalog remains single-column and the specimen chooser stays within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/species");

  const firstCards = page
    .locator(".catalog-grid")
    .first()
    .locator(".collection-card");
  const cardBoxes = await firstCards.evaluateAll((cards) =>
    cards.slice(0, 2).map((card) => {
      const box = card.getBoundingClientRect();
      return { x: box.x, y: box.y };
    }),
  );
  if (cardBoxes.length === 2) {
    expect(Math.round(cardBoxes[0]!.x)).toBe(Math.round(cardBoxes[1]!.x));
    expect(cardBoxes[0]!.y).toBeLessThan(cardBoxes[1]!.y);
  }

  const sealCard = page.locator(".taxon-card", { hasText: "Harbour seal" });
  await sealCard.scrollIntoViewIfNeeded();
  await sealCard
    .getByRole("button", { name: "Choose from 3 specimens" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Choose a specimen" });
  const geometry = await dialog.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      bottom: box.bottom,
      pageOverflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(390);
  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.bottom).toBeLessThanOrEqual(844);
  expect(geometry.pageOverflow).toBeLessThanOrEqual(0);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("taxonomy and exact specimen routes remain useful without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/taxonomy/family/canidae");
  await expect(
    page.getByRole("heading", { level: 1, name: "Canidae" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Raccoon dog/i }),
  ).toHaveAttribute("href", "/species/raccoon-dog");

  await page.goto("/species/raccoon-dog/specimens/SPEC-0001");
  await expect(
    page.getByRole("heading", { level: 1, name: "Raccoon dog" }),
  ).toBeVisible();
  await expect(page.getByText("Exact specimen record")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Measurements" }),
  ).toBeVisible();

  await context.close();
});

test("sitemap, robots, and unknown taxonomy routes reflect the static public surface", async ({
  request,
  page,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("/taxonomy/class/mammals");
  expect(sitemapBody).toContain("/species/raccoon-dog/specimens/SPEC-0001");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");

  await page.goto("/taxonomy/class/not-a-reviewed-class");
  await expect(
    page.getByRole("heading", {
      name: "This path does not match a published record.",
    }),
  ).toBeVisible();
});

async function activateWithKeyboard(
  target: import("@playwright/test").Locator,
  page: import("@playwright/test").Page,
) {
  await target.focus();
  await expect(target).toBeFocused();
  await page.keyboard.press("Enter");
}
