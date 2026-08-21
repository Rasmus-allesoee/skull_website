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
    page.getByText("1 result · Sorted by common name"),
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
    page.getByRole("link", { name: /Mammalia/i }),
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
