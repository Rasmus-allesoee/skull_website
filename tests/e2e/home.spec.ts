import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("foundation home is available and has no detectable accessibility violations", async ({
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

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
