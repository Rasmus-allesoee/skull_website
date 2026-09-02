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
  await expect(page.locator(".specimen-field-link")).toHaveCount(10);
  await expect(
    page.getByRole("link", { name: "Explore the Species catalog" }),
  ).toHaveAttribute("href", "/species");
  await expect(
    page.getByRole("link", { name: "Open the collection map" }),
  ).toHaveAttribute("href", "/map");
  await expect(
    page.getByRole("link", { name: "Open the measurement reference" }),
  ).toHaveAttribute("href", "/methodology");
  await expect(
    page.getByRole("link", {
      name: "Open the skull preparation guide outline",
    }),
  ).toHaveAttribute("href", "/guides/skull-preparation");
  await expect(page.locator(".home-hub-card-species img")).toHaveAttribute(
    "src",
    /species-catalog-thumbnail/,
  );
  await expect(page.locator(".home-hub-card-map img")).toHaveAttribute(
    "src",
    /map-thumbnail/,
  );
  await expect(page.locator(".home-hub-card-measurements img")).toHaveAttribute(
    "src",
    /measurements-thumbnail/,
  );
  await expect(page.locator(".home-hub-card-preparation img")).toHaveAttribute(
    "src",
    /preparation-guide-thumbnail/,
  );
  await expect(page.locator(".home-hub-card-comparison img")).toHaveAttribute(
    "src",
    /skull-comparison-thumbnail/,
  );
  await expect(page.getByText("Coming soon")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Skull Comparison/i }),
  ).toHaveCount(0);
  await expect(page.locator(".maplibregl-map")).toHaveCount(0);
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
    page.locator(".catalog-active-state").getByText("15 taxa", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Collection taxa" })
      .getByRole("link", { name: /Raccoon dog/i }),
  ).toHaveAttribute("href", "/species/raccoon-dog");
  accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("the specimen field preserves exact keyboard navigation and cycles bounded arrangements", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const field = page.locator(".specimen-field");
  const firstArrangement = await field.getAttribute("data-arrangement");
  const firstIds = await field
    .locator(".specimen-field-link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  await page
    .getByRole("button", { name: /Show another specimen arrangement/i })
    .click();
  await expect(field).not.toHaveAttribute(
    "data-arrangement",
    firstArrangement!,
  );
  const secondIds = await field
    .locator(".specimen-field-link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(secondIds).not.toEqual(firstIds);
  expect(secondIds).toHaveLength(10);

  await page
    .getByRole("button", { name: /Show another specimen arrangement/i })
    .click();
  const thirdIds = await field
    .locator(".specimen-field-link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(thirdIds).toHaveLength(10);
  expect(new Set([...firstIds, ...secondIds, ...thirdIds]).size).toBe(18);

  const specimenLink = field.locator(".specimen-field-link").first();
  const href = await specimenLink.getAttribute("href");
  const beforeFocus = await specimenLink.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await specimenLink.focus();
  await expect(specimenLink).toBeFocused();
  await expect(page.locator(".specimen-field-identity")).toBeVisible();
  const afterFocus = await specimenLink.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  expect(afterFocus).toBe(beforeFocus);
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(href!);
  await expect(page.getByText("Exact specimen record")).toBeVisible();
});

test("touch selection reveals identity before deliberate specimen navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  const specimenLink = page.locator(".specimen-field-link").first();
  const href = await specimenLink.getAttribute("href");

  await specimenLink.tap();
  await expect(page).toHaveURL("/");
  await expect(specimenLink).toHaveClass(/is-active/);
  await expect(page.locator(".specimen-field-identity")).toBeVisible();
  await specimenLink.tap();
  await expect(page).toHaveURL(href!);
  await context.close();
});

test("touch parallax is bounded without moving the specimen hitboxes", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  const field = page.locator(".specimen-field");
  const bounds = await field.boundingBox();
  expect(bounds).not.toBeNull();
  await field.evaluate((element, box) => {
    element.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        buttons: 1,
        clientX: box!.x + box!.width * 0.9,
        clientY: box!.y + box!.height * 0.15,
        pointerId: 7,
        pointerType: "touch",
      }),
    );
  }, bounds);
  const moved = await field.evaluate((element) => ({
    moveX: element
      .querySelector<HTMLElement>(".specimen-field-link")
      ?.style.getPropertyValue("--field-move-x"),
    moveY: element
      .querySelector<HTMLElement>(".specimen-field-link")
      ?.style.getPropertyValue("--field-move-y"),
  }));
  expect(moved.moveX).not.toBe("0px");
  expect(moved.moveY).not.toBe("0px");
  const firstLink = field.locator(".specimen-field-link").first();
  const before = await firstLink.boundingBox();
  await field.evaluate((element, box) => {
    element.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        clientX: box!.x + box!.width * 0.9,
        clientY: box!.y + box!.height * 0.15,
        pointerId: 7,
        pointerType: "touch",
      }),
    );
  }, bounds);
  const after = await firstLink.boundingBox();
  const reset = await field.evaluate((element) =>
    element
      .querySelector<HTMLElement>(".specimen-field-link")
      ?.style.getPropertyValue("--field-move-x"),
  );
  expect(reset).toBe("0px");
  expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeLessThan(1);
  await context.close();
});

test("specimen identity cards stay inside the field at edge placements", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const field = page.locator(".specimen-field");
    const links = field.locator(".specimen-field-link");
    for (let index = 0; index < 10; index += 1) {
      await links.nth(index).focus();
      const card = page.locator(".specimen-field-identity");
      await expect(card).toBeVisible();
      await expect(card).toHaveClass(/is-ready/);
      const geometry = await field.evaluate((element) => {
        const fieldBox = element.getBoundingClientRect();
        const cardElement = element.querySelector<HTMLElement>(
          ".specimen-field-identity",
        )!;
        const cardBox = cardElement.getBoundingClientRect();
        return {
          field: {
            left: fieldBox.left,
            top: fieldBox.top,
            right: fieldBox.right,
            bottom: fieldBox.bottom,
          },
          card: {
            left: cardBox.left,
            top: cardBox.top,
            right: cardBox.right,
            bottom: cardBox.bottom,
          },
          placement: cardElement.dataset.placement,
        };
      });
      expect(geometry.card.left).toBeGreaterThanOrEqual(
        geometry.field.left + 8,
      );
      expect(geometry.card.top).toBeGreaterThanOrEqual(geometry.field.top + 8);
      expect(geometry.card.right).toBeLessThanOrEqual(geometry.field.right - 8);
      expect(geometry.card.bottom).toBeLessThanOrEqual(
        geometry.field.bottom - 8,
      );
      expect(["above", "below", "left", "right"]).toContain(geometry.placement);
    }
  }
});

test("Home reflows without overflow and simplifies motion and color-dependent treatment", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 820, height: 900 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      fieldLinks: [...document.querySelectorAll(".specimen-field-link")].map(
        (link) => {
          const box = link.getBoundingClientRect();
          return { width: box.width, height: box.height };
        },
      ),
      summaryHeight: document
        .querySelector(".collection-summary")
        ?.getBoundingClientRect().height,
    }));
    expect(geometry.overflow).toBeLessThanOrEqual(0);
    expect(
      geometry.fieldLinks.every(
        (target) => target.width >= 44 && target.height >= 44,
      ),
    ).toBe(true);
    if (viewport.width <= 390) {
      expect(geometry.summaryHeight).toBeLessThan(160);
    }
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const reducedTransitionSeconds = await page
    .locator(".specimen-field-link")
    .first()
    .evaluate((element) => {
      const duration = getComputedStyle(element).transitionDuration;
      const parsed = Number.parseFloat(duration);
      return Number.isFinite(parsed) ? parsed : 0;
    });
  expect(reducedTransitionSeconds).toBeLessThanOrEqual(0.001);

  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  const specimenLink = page.locator(".specimen-field-link").first();
  await specimenLink.focus();
  await expect(specimenLink).toBeFocused();
  await expect(page.locator(".specimen-field-identity")).toBeVisible();
});

test("a failed Home image does not remove the surrounding navigation", async ({
  page,
}) => {
  await page.route(/preparation-field-skull/, (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 3, name: "Preparation guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Open the skull preparation guide outline",
    }),
  ).toHaveAttribute("href", "/guides/skull-preparation");
  await expect(page.locator(".specimen-field-link")).toHaveCount(10);
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
  await expect(dialog.getByText("Mass", { exact: true }).first()).toBeVisible();
  await expect(
    dialog.getByText("Condition", { exact: true }).first(),
  ).toBeVisible();
  await expect(dialog.getByText("Date", { exact: true }).first()).toBeVisible();
  await expect(dialog.getByText("N/A", { exact: true }).first()).toBeVisible();
  await expect(dialog.getByText("Ex.", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Oct 2024", { exact: true })).toBeVisible();
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

test("Home, taxonomy, and exact specimen routes remain useful without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A visual archive of animal skulls.",
    }),
  ).toBeVisible();
  await expect(page.locator(".specimen-field-link")).toHaveCount(10);
  await expect(
    page.getByRole("button", { name: /another specimen arrangement/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Open the collection map" }),
  ).toHaveAttribute("href", "/map");
  await expect(page.getByText("Coming soon")).toBeVisible();

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
  expect(sitemapBody).toContain("/methodology");
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
