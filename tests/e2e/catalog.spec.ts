import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const searchLabel = "Search names, taxonomy, or specimen ID";

test("catalog-first layout reaches a responsive three-column collection grid in the first desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/species");

  await expect(
    page.getByRole("heading", { level: 1, name: "Species" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Catalog controls" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Collection taxa" }),
  ).toBeVisible();

  const firstCardTop = await page
    .locator(".taxon-card")
    .first()
    .evaluate((card) => card.getBoundingClientRect().top);
  expect(firstCardTop).toBeLessThan(900);

  const mustelidaeCards = page
    .getByRole("region", { name: "Mustelidae" })
    .locator(".taxon-card");
  await expect(mustelidaeCards).toHaveCount(3);
  const positions = await mustelidaeCards.evaluateAll((cards) =>
    cards.map((card) => {
      const box = card.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y) };
    }),
  );
  expect(new Set(positions.map(({ y }) => y)).size).toBe(1);
  expect(positions[0]!.x).toBeLessThan(positions[1]!.x);
  expect(positions[1]!.x).toBeLessThan(positions[2]!.x);

  const cardGeometry = await mustelidaeCards.evaluateAll((cards) =>
    cards.map((card) => ({
      imageHeight:
        card.querySelector(".collection-card-image")?.getBoundingClientRect()
          .height ?? 0,
      copyHeight:
        card.querySelector(".collection-card-copy")?.getBoundingClientRect()
          .height ?? 0,
    })),
  );
  expect(
    new Set(cardGeometry.map(({ imageHeight }) => Math.round(imageHeight)))
      .size,
  ).toBe(1);
  expect(
    cardGeometry.every(
      ({ imageHeight, copyHeight }) => imageHeight > copyHeight,
    ),
  ).toBe(true);

  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
});

test("multilingual, alias, scientific-name, and misspelling searches rank the canonical taxon", async ({
  page,
}) => {
  await page.goto("/species");
  const search = page.getByRole("combobox", { name: searchLabel });

  for (const query of [
    "Nyctereutes procyonoides",
    "Mårhund",
    "Marhund",
    "Racoon dog",
  ]) {
    await search.fill(query);
    await expectCatalogCount(page, "1 taxon");
    await expect(
      page
        .getByRole("region", { name: `Results for “${query}”` })
        .getByRole("link", { name: /Raccoon dog/i }),
    ).toHaveAttribute("href", "/species/raccoon-dog");
    await expect
      .poll(() => new URL(page.url()).searchParams.get("q"))
      .toBe(query);
  }

  await search.fill("Stone marten");
  await expectCatalogCount(page, "1 taxon");
  await expect(
    page.getByRole("region", { name: /Results for/ }).getByText("Beech marten"),
  ).toBeVisible();
});

test("fuzzy search rejects unrelated lineages and keeps exact identifiers strict", async ({
  page,
}) => {
  await page.goto("/species");
  const search = page.getByRole("combobox", { name: searchLabel });
  const listbox = page.getByRole("listbox", { name: "Search suggestions" });

  await search.fill("Canidae");
  await expect(listbox).toBeVisible();
  await expect(listbox.getByText("Laridae", { exact: true })).not.toBeVisible();
  await expect(listbox.getByText("Gull", { exact: true })).not.toBeVisible();
  await expectCatalogCount(page, "2 taxa");
  await expect(page.getByText("Gull", { exact: true })).not.toBeVisible();

  for (const query of ["fox", "ræv", "red fox", "rød ræb"]) {
    await search.fill(query);
    await expectCatalogCount(page, "1 taxon");
    await expect(
      page
        .getByRole("region", { name: `Results for “${query}”` })
        .getByRole("link", { name: /Red fox/i }),
    ).toBeVisible();
    await expect(
      page.getByText("Razorbill", { exact: true }),
    ).not.toBeVisible();
  }

  await search.fill("SPEC-0013");
  await expectCatalogCount(page, "1 taxon");
  await page.getByRole("radio", { name: "Specimens" }).check();
  await expectCatalogCount(page, "1 specimen");
  await search.click();
  const specimenOptions = listbox
    .getByRole("group", { name: "Physical specimens" })
    .getByRole("option");
  await expect(specimenOptions).toHaveCount(1);
  await expect(specimenOptions.first()).toHaveAccessibleName(
    /SPEC-0013.*Physical specimen/i,
  );
});

test("autocomplete suggestions follow result mode and disclose additional specimens", async ({
  page,
}) => {
  await page.goto("/species");
  const search = page.getByRole("combobox", { name: searchLabel });
  await search.fill("Carnivora");
  const listbox = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(listbox).toBeVisible();

  const taxaGroup = listbox.getByRole("group", { name: "Taxa" });
  await expect(taxaGroup).toBeVisible();
  await expect(
    listbox.getByRole("group", { name: "Physical specimens" }),
  ).not.toBeVisible();
  await expect(
    taxaGroup.getByRole("option", {
      name: /European badger.*SPEC-0010.*Default specimen/i,
    }),
  ).toBeVisible();

  await taxaGroup
    .getByRole("button", {
      name: "Show 1 other specimens for European badger",
    })
    .click();
  await expect(
    taxaGroup.getByRole("option", {
      name: /SPEC-0009.*Physical specimen/i,
    }),
  ).toBeVisible();

  await page.getByRole("radio", { name: "Specimens" }).check();
  await search.click();
  await expect(listbox.getByRole("group", { name: "Taxa" })).not.toBeVisible();
  const specimenGroup = listbox.getByRole("group", {
    name: "Physical specimens",
  });
  await expect(specimenGroup).toBeVisible();
  await expect(specimenGroup.getByRole("option")).toHaveCount(10);
});

test("autocomplete listbox fits the viewport and hands scroll back to the page", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/species");
    await page.evaluate(() => window.scrollTo(0, 0));
    const search = page.getByRole("combobox", { name: searchLabel });
    await search.fill("a");
    const listbox = page.getByRole("listbox", { name: "Search suggestions" });
    await expect(listbox).toBeVisible();
    const surface = page.locator(".catalog-suggestions-surface");
    await expect(surface).toBeVisible();

    const geometry = await surface.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        top: box.top,
        bottom: box.bottom,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      };
    });
    expect(geometry.top).toBeGreaterThanOrEqual(0);
    expect(geometry.bottom).toBeLessThanOrEqual(viewport.height);
    expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight);
  }

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/species");
  await page.evaluate(() => window.scrollTo(0, 0));
  const search = page.getByRole("combobox", { name: searchLabel });
  await search.fill("a");
  const listbox = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(listbox).toBeVisible();
  const surface = page.locator(".catalog-suggestions-surface");
  await surface.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  const surfaceBox = await surface.boundingBox();
  expect(surfaceBox).not.toBeNull();
  await page.mouse.move(
    surfaceBox!.x + surfaceBox!.width / 2,
    surfaceBox!.y + surfaceBox!.height / 2,
  );
  const pageScrollBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 400);
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 1000 })
    .toBeGreaterThan(pageScrollBefore);
});

test("combobox keyboard selection filters a higher rank and opens an exact specimen", async ({
  page,
}) => {
  await page.goto("/species");
  const search = page.getByRole("combobox", { name: searchLabel });

  await search.fill("Mustelidae");
  const listbox = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(listbox).toBeVisible();
  await expect(
    listbox.getByRole("option", {
      name: /Mustelidae.*family.*Filter catalog/i,
    }),
  ).toBeVisible();
  await search.press("ArrowDown");
  await search.press("Enter");

  await expect(page).toHaveURL(/scope=family%3Amustelidae/);
  await expectCatalogCount(page, "3 taxa");
  await expect(
    page.getByRole("link", { name: "Open family page" }),
  ).toHaveAttribute("href", "/taxonomy/family/mustelidae");

  await search.fill("SPEC-0013");
  await expect(listbox).toBeVisible();
  await expect(
    listbox.getByRole("option", {
      name: /SPEC-0013.*Physical specimen/i,
    }),
  ).toBeVisible();
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(page).toHaveURL("/species/harbour-seal/specimens/SPEC-0013");
  await expect(page.getByText("Exact specimen record")).toBeVisible();
});

test("feature and numeric facets filter physical records without treating unknown measurements as zero", async ({
  page,
}) => {
  await page.goto("/species");
  await page.getByRole("button", { name: "Filters" }).click();
  const dialog = page.getByRole("dialog", { name: "Filter physical skulls" });
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  const viewportSize = page.viewportSize();
  expect(dialogBox).not.toBeNull();
  expect(viewportSize).not.toBeNull();
  expect(
    Math.abs(dialogBox!.x + dialogBox!.width / 2 - viewportSize!.width / 2),
  ).toBeLessThan(2);
  await dialog.getByLabel("Minimum length").fill("200");
  await dialog.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/lengthMin=200/);
  await expectCatalogCount(page, "1 taxon");
  const sealCard = page.locator(".taxon-card", { hasText: "Harbour seal" });
  await expect(sealCard).toBeVisible();
  await expect(
    sealCard.getByText(/2 of 3 specimens match.*length 200–230 mm/),
  ).toBeVisible();
  await expect(page.getByText("European mole")).not.toBeVisible();

  await page.getByRole("radio", { name: "Specimens" }).check();
  await expectCatalogCount(page, "2 specimens");
  await page.getByLabel("Sort").selectOption("skull-length");
  await expect(page).toHaveURL(/mode=specimens/);
  await expect(page).toHaveURL(/sort=skull-length/);
  expect(await specimenIds(page)).toEqual(["SPEC-0015", "SPEC-0014"]);
  await page
    .getByRole("button", {
      name: /Reverse result order.*Current direction: Low–high/i,
    })
    .click();
  await expect(page).toHaveURL(/direction=descending/);
  expect(await specimenIds(page)).toEqual(["SPEC-0014", "SPEC-0015"]);

  await page.goto("/species?scope=family%3Atalpidae&lengthMin=1");
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "No published skulls match this catalog state.",
    }),
  ).toBeVisible();
  await expectCatalogCount(page, "0 taxa");
  await page.getByRole("button", { name: "Clear filters and search" }).click();
  await expectCatalogCount(page, "15 taxa");
});

test("measurement sorting works in Species mode and Family groups works in Specimens mode", async ({
  page,
}) => {
  await page.goto("/species");
  const sort = page.getByLabel("Sort");

  await sort.selectOption("skull-length");
  await expect(sort).toHaveValue("skull-length");
  await expect(page).toHaveURL(/sort=skull-length/);
  await page
    .getByRole("button", {
      name: /Reverse result order.*Current direction: Low–high/i,
    })
    .click();
  await expect(page).toHaveURL(/direction=descending/);
  const firstTaxonCard = page.locator(".taxon-card").first();
  await expect(firstTaxonCard.getByRole("heading", { level: 3 })).toHaveText(
    "Harbour seal",
  );
  await expect(firstTaxonCard.getByText("Skull length")).toBeVisible();
  await expect(
    firstTaxonCard.locator(".taxon-card-facts").getByText("230 mm"),
  ).toBeVisible();
  await expect(firstTaxonCard.getByText("Skull mass")).toBeVisible();
  await expect(
    firstTaxonCard.getByText("Largest recorded · SPEC-0014"),
  ).toBeVisible();
  await expect(firstTaxonCard.getByRole("link").first()).toHaveAttribute(
    "href",
    "/species/harbour-seal/specimens/SPEC-0014",
  );

  await sort.selectOption("browse");
  await page.getByRole("radio", { name: "Specimens" }).check();
  await expect(sort).toHaveValue("browse");
  await expect(
    page.getByText(/Grouped by family.*Z–A families/i),
  ).toBeVisible();
  const headingsDescending = await page
    .locator(".family-gallery-heading h3")
    .allTextContents();
  expect(headingsDescending.length).toBeGreaterThan(2);
  expect(headingsDescending).toEqual(
    [...headingsDescending].sort((first, second) =>
      second.localeCompare(first, "en"),
    ),
  );
  await expect(
    page.getByRole("region", { name: "Phocidae" }).locator(".specimen-card"),
  ).toHaveCount(3);
});

test("mode, class, sort, reload, and browser history restore the same URL-backed catalog state", async ({
  page,
}) => {
  await page.goto("/species?mode=specimens&class=birds&sort=skull-length");
  await expect(page.getByRole("radio", { name: "Specimens" })).toBeChecked();
  await expect(page.getByRole("button", { name: /Aves/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expectCatalogCount(page, "6 specimens");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Specimens" })).toBeChecked();
  await expect(page.getByLabel("Sort")).toHaveValue("skull-length");
  await expectCatalogCount(page, "6 specimens");

  await page.getByRole("button", { name: /Mammalia/ }).click();
  await expect(page).toHaveURL(/class=mammals/);
  await expectCatalogCount(page, "12 specimens");
  await page.goBack();
  await expect(page).toHaveURL(/class=birds/);
  await expectCatalogCount(page, "6 specimens");
  await page.goForward();
  await expect(page).toHaveURL(/class=mammals/);
  await expectCatalogCount(page, "12 specimens");
});

test("the one canonical taxonomy drawer filters the grid, preserves route parity, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/species");
  const opener = page.getByRole("button", { name: "Browse taxonomy" });
  await opener.click();
  const drawer = page.getByRole("dialog", { name: "Browse taxonomy" });
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByRole("button", { name: "Collapse Mammalia" }),
  ).toBeVisible();

  await drawer.getByRole("button", { name: "Reset" }).click();
  await expect(
    drawer.getByRole("button", { name: "Expand Aves" }),
  ).toBeVisible();
  await expect(
    drawer.getByRole("button", { name: "Expand Mammalia" }),
  ).toBeVisible();
  await expect(
    drawer.getByRole("button", { name: "Expand Carnivora" }),
  ).not.toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 600));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  const stickyGeometry = await page.evaluate(() => {
    const control = document.querySelector<HTMLElement>(
      ".catalog-control-region",
    );
    const taxonomy = document.querySelector<HTMLElement>(
      ".catalog-taxonomy-drawer",
    );
    if (!control || !taxonomy) return null;
    const controlBox = control.getBoundingClientRect();
    const taxonomyBox = taxonomy.getBoundingClientRect();
    return {
      controlTop: controlBox.top,
      controlBottom: controlBox.bottom,
      taxonomyTop: taxonomyBox.top,
    };
  });
  expect(stickyGeometry).not.toBeNull();
  expect(stickyGeometry!.controlTop).toBeLessThanOrEqual(1);
  expect(stickyGeometry!.taxonomyTop).toBeGreaterThanOrEqual(
    stickyGeometry!.controlBottom - 1,
  );

  await page.evaluate(() => window.scrollTo(0, 0));
  await drawer.getByRole("button", { name: "Expand Mammalia" }).click();
  await drawer.getByRole("button", { name: "Expand Carnivora" }).click();
  await drawer.getByRole("button", { name: "Mustelidae 3 taxa" }).click();
  await expect(page).toHaveURL(/scope=family%3Amustelidae/);
  await expectCatalogCount(page, "3 taxa");
  await expect(
    drawer.getByRole("link", { name: "Open Mustelidae family page" }),
  ).toHaveAttribute("href", "/taxonomy/family/mustelidae");

  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("mobile, effective 200 percent reflow, reduced motion, forced colors, and transient panels remain accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/species");

  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  const firstCards = page.locator(".taxon-card").first();
  await expect(firstCards).toBeVisible();

  const opener = page.getByRole("button", { name: "Browse taxonomy" });
  await opener.click();
  const drawer = page.getByRole("dialog", { name: "Browse taxonomy" });
  await expect(drawer).toBeVisible();
  const drawerBox = await drawer.boundingBox();
  expect(drawerBox).not.toBeNull();
  expect(drawerBox!.x).toBe(0);
  expect(drawerBox!.x + drawerBox!.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();

  await page.getByRole("button", { name: "Filters" }).click();
  const dialog = page.getByRole("dialog", { name: "Filter physical skulls" });
  await expect(dialog).toBeVisible();
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await page.keyboard.press("Escape");

  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "none" });
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations).toEqual([]);

  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/species");
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await expect(page.locator(".taxon-card").first()).toBeVisible();
});

test("catalog HTML keeps published cards and complete taxonomy links when JavaScript is unavailable", async ({
  browser,
}) => {
  test.setTimeout(60_000);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/species");

  await expectCatalogCount(page, "15 taxa");
  await expect(
    page.getByRole("link", { name: /Raccoon dog/i }),
  ).toHaveAttribute("href", "/species/raccoon-dog");
  const taxonomyDetails = page.locator("details.catalog-no-script-taxonomy");
  await expect(taxonomyDetails.locator("summary")).toBeVisible();
  await taxonomyDetails.locator("summary").click();
  const fallback = page.getByRole("navigation", {
    name: "Complete no-JavaScript taxonomy",
  });
  await expect(fallback).toBeVisible();
  await expect(
    fallback.getByRole("link", { name: /Mustelidae/ }),
  ).toHaveAttribute("href", "/taxonomy/family/mustelidae");
  await expect(
    fallback.getByRole("link", { name: "Harbour seal" }),
  ).toHaveAttribute("href", "/species/harbour-seal");

  await context.close();
});

async function expectCatalogCount(page: Page, expected: string) {
  await expect(
    page.locator(".catalog-active-state").getByText(expected, { exact: true }),
  ).toBeVisible();
}

async function specimenIds(page: Page): Promise<string[]> {
  return page
    .locator(".specimen-card .card-overline-split > span:last-child")
    .allTextContents();
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
}
