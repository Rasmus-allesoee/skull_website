import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const route = "/guides/skull-preparation";

test("preparation guide exposes all methods, sources and working workflow links", async ({
  page,
}) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  await expect(page).toHaveTitle("Skull preparation guide | Skull Collection");
  await expect(page.locator(".prep-workflow > ol > li")).toHaveCount(5);
  await expect(page.locator(".prep-table table")).toHaveCount(4);
  await expect(page.locator(".references li")).toHaveCount(13);
  await expect(page.locator(".prep-figure")).toHaveCount(6);
  await expect(page.locator(".prep-image-label")).toHaveText("AI illustration");
  expect(
    await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href")!)
          .filter((href) => !document.getElementById(href.slice(1))),
      ),
  ).toEqual([]);
  await page.locator('.prep-method-links a[href="#beetles"]').click();
  await expect(page).toHaveURL(`${route}#beetles`);
  await expect
    .poll(() =>
      page.locator("#beetles").evaluate((e) => e.getBoundingClientRect().top),
    )
    .toBeGreaterThan(60);
  await page.locator(".prep-nav-bar a").click();
  await expect(page).toHaveURL(`${route}#workflow`);
  await page.goBack();
  await expect(page).toHaveURL(`${route}#beetles`);
  await page.locator('sup a[href="#ref-amnh-beetles"]').click();
  await expect(page.locator("#ref-amnh-beetles")).toBeInViewport();
  expect(
    requests.filter((url) =>
      /catalog-search|maplibre|openfreemap|agent_context/.test(url),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("contents drawer traps focus, restores it on Escape and focuses selected headings", async ({
  page,
}) => {
  await page.goto(route);
  const trigger = page.getByRole("button", { name: "Contents", exact: true });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Guide contents" });
  await expect(drawer).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close guide contents" }),
  ).toBeFocused();
  await drawer.getByRole("link", { name: "References", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close guide contents" }),
  ).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await drawer
    .getByRole("link", { name: "Replacing teeth", exact: true })
    .click();
  await expect(page).toHaveURL(`${route}#teeth`);
  await expect(page.locator("#teeth")).toBeFocused();
  await expect(drawer).not.toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe("");
});

test("mobile guide reflows, retains touch navigation and usable disclosures", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(route);
  for (const width of [390, 360, 320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.prep-method-links a[href="#maceration"]').tap();
  await expect(page).toHaveURL(`${route}#maceration`);
  await page
    .getByText("Troubleshooting: dark bone, wax and stubborn tendons", {
      exact: true,
    })
    .tap();
  await expect(
    page.getByText("Blackening is not, by itself", { exact: false }),
  ).toBeVisible();
  await page.locator("#degreaser-comparison").scrollIntoViewIfNeeded();
  await expect(page.locator(".prep-nav-bar")).toBeInViewport();
  expect(
    await page
      .locator(".prep-nav-bar")
      .evaluate((e) => e.getBoundingClientRect().height),
  ).toBeLessThan(100);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await context.close();
});

test("static guide works without JavaScript and every table retains semantic content", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(route);
  await page.locator(".prep-static-contents summary").click();
  await page
    .getByRole("navigation", { name: "Guide contents" })
    .getByRole("link", { name: "Burial", exact: true })
    .click();
  await expect(page).toHaveURL(`${route}#burial`);
  await expect(page.getByRole("table")).toHaveCount(4);
  expect(
    await page
      .locator(".prep-article > ol")
      .first()
      .evaluate((element) => getComputedStyle(element).listStyleType),
  ).toBe("decimal");
  const detailSummary = page.getByText(
    "How long, which animals, and when is it finished?",
    { exact: true },
  );
  await detailSummary.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("There is no verified young-versus-old rule", {
      exact: false,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await context.close();
});

test("deep links, reduced motion, forced colors and failed images preserve guide access", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/_next/image?*", (request) => request.abort());
  await page.goto(`${route}#whitening`);
  await expect(page.locator("#whitening")).toBeInViewport();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  await page.emulateMedia({ forcedColors: "active" });
  await page.getByRole("button", { name: "Contents", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Drying, storage and documentation" })
    .click();
  await expect(page.locator("#storage")).toBeFocused();
  await expect(page.locator("#storage")).toBeInViewport();
  expect(
    await page.locator(".prep-figure-degreasing img").getAttribute("alt"),
  ).toContain("Illustration");
});
