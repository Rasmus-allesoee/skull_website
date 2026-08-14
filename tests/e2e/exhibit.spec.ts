import AxeBuilder from "@axe-core/playwright";
import { devices, expect, test } from "@playwright/test";

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
  await expect(page.getByText("Default taxon display")).toBeVisible();
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
  await expect(
    page.getByText("Owner", { exact: true }).locator("..").getByText("Rasmus"),
  ).toBeVisible();
  await expect(
    page.locator(".record-primary-value").filter({ hasText: /^Good$/ }),
  ).toBeVisible();
  await expect(page.getByText("Cited profile")).toHaveCount(0);
  await expect(
    page.getByText("© 2026 Rasmus. All rights reserved."),
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

test("desktop gallery provides high-quality selection and smooth high-resolution inspection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(specimenPath);
  const gallery = page.getByLabel(/Raccoon dog gallery/);

  await page.getByRole("button", { name: "Show dorsal view" }).click();
  await expect(page.getByText("4 / 6 · Dorsal")).toBeVisible();

  await gallery.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("5 / 6 · Ventral")).toBeVisible();

  await gallery.dispatchEvent("pointerdown", {
    clientX: 300,
    clientY: 200,
    pointerId: 1,
    pointerType: "touch",
  });
  await gallery.dispatchEvent("pointerup", {
    clientX: 100,
    clientY: 205,
    pointerId: 1,
    pointerType: "touch",
  });
  await expect(page.getByText("6 / 6 · Mandible — dorsal")).toBeVisible();

  await gallery.dblclick();
  const dialog = page.locator("dialog.inspection-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName(/Mandible — dorsal view/);

  const inspectionImage = dialog.locator(".inspection-image");
  await expect(inspectionImage).toBeVisible();
  const inspectionViewport = dialog.locator(".inspection-viewport");
  const inspectionImageBox = await inspectionImage.boundingBox();
  const inspectionViewportBox = await inspectionViewport.boundingBox();
  expect(inspectionImageBox).not.toBeNull();
  expect(inspectionViewportBox).not.toBeNull();
  expect(inspectionImageBox!.x).toBeGreaterThanOrEqual(
    inspectionViewportBox!.x,
  );
  expect(inspectionImageBox!.y).toBeGreaterThanOrEqual(
    inspectionViewportBox!.y,
  );
  expect(inspectionImageBox!.x + inspectionImageBox!.width).toBeLessThanOrEqual(
    inspectionViewportBox!.x + inspectionViewportBox!.width,
  );
  expect(
    inspectionImageBox!.y + inspectionImageBox!.height,
  ).toBeLessThanOrEqual(
    inspectionViewportBox!.y + inspectionViewportBox!.height,
  );
  const inspectionSource = await inspectionImage.evaluate(
    (image: HTMLImageElement) => ({
      currentSrc: image.currentSrc,
      naturalWidth: image.naturalWidth,
    }),
  );
  expect(inspectionSource.currentSrc).toContain(
    "/media/specimens/SPEC-0001/SPEC-0001__mandible-dorsal.webp",
  );
  expect(inspectionSource.naturalWidth).toBe(3200);

  const viewport = inspectionViewport;
  await viewport.hover();
  await page.mouse.wheel(0, -360);
  await expect(dialog.locator("output")).not.toHaveText("100%");

  const transformBeforeDrag = await inspectionImage.getAttribute("style");
  const viewportBox = await viewport.boundingBox();
  expect(viewportBox).not.toBeNull();
  await page.mouse.move(
    viewportBox!.x + viewportBox!.width / 2,
    viewportBox!.y + 200,
  );
  await page.mouse.down();
  await page.mouse.move(
    viewportBox!.x + viewportBox!.width / 2 + 90,
    viewportBox!.y + 250,
  );
  await page.mouse.up();
  await expect(inspectionImage).not.toHaveAttribute(
    "style",
    transformBeforeDrag ?? "",
  );

  await dialog.getByRole("button", { name: "Next view" }).click();
  await expect(dialog).toHaveAccessibleName(/Lateral view/);
  await expect(dialog.locator("output")).toHaveText("100%");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(gallery).toBeFocused();
});

test("desktop 100% layout keeps the main image, controls, and thumbnail rail together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(taxonPath);
  const gallerySection = page.locator(".gallery");
  await gallerySection.scrollIntoViewIfNeeded();
  await page
    .locator(".gallery-heading")
    .evaluate((heading) =>
      heading.scrollIntoView({ block: "start", behavior: "instant" }),
    );

  const visibleBottom = await page.evaluate(() => innerHeight);
  const controlsBox = await page.locator(".gallery-controls").boundingBox();
  const lastThumbnailBox = await page
    .getByRole("button", { name: "Show mandible — dorsal view" })
    .boundingBox();
  expect(controlsBox).not.toBeNull();
  expect(lastThumbnailBox).not.toBeNull();
  expect(controlsBox!.y + controlsBox!.height).toBeLessThanOrEqual(
    visibleBottom,
  );
  expect(lastThumbnailBox!.y + lastThumbnailBox!.height).toBeLessThanOrEqual(
    visibleBottom,
  );

  const geometry = await page
    .locator(".gallery-stage")
    .evaluate(async (stage) => {
      const image = stage.querySelector<HTMLImageElement>(".gallery-image")!;
      await Promise.all(
        image
          .getAnimations()
          .map((animation) => animation.finished.catch(() => undefined)),
      );
      const stageBox = stage.getBoundingClientRect();
      const imageBox = image.getBoundingClientRect();
      return {
        stage: {
          x: stageBox.x,
          y: stageBox.y,
          width: stageBox.width,
          height: stageBox.height,
        },
        image: {
          x: imageBox.x,
          y: imageBox.y,
          width: imageBox.width,
          height: imageBox.height,
        },
      };
    });
  expect(geometry.image.x).toBeGreaterThanOrEqual(geometry.stage.x);
  expect(geometry.image.y).toBeGreaterThanOrEqual(geometry.stage.y);
  expect(geometry.image.x + geometry.image.width).toBeLessThanOrEqual(
    geometry.stage.x + geometry.stage.width,
  );
  expect(geometry.image.y + geometry.image.height).toBeLessThanOrEqual(
    geometry.stage.y + geometry.stage.height,
  );

  const imageDelivery = await page
    .locator(".gallery-image")
    .evaluate((image: HTMLImageElement) => ({
      clientWidth: image.clientWidth,
      currentSrc: image.currentSrc,
      naturalWidth: image.naturalWidth,
      objectFit: getComputedStyle(image).objectFit,
    }));
  expect(imageDelivery.currentSrc).toContain("q=90");
  expect(imageDelivery.naturalWidth).toBeGreaterThanOrEqual(
    imageDelivery.clientWidth,
  );
  expect(imageDelivery.objectFit).toBe("contain");
});

test("measurement, age, condition, and additional-record guides disclose the new data model", async ({
  page,
}) => {
  await page.goto(specimenPath);

  await expect(
    page.getByRole("heading", { name: "Measurements" }),
  ).toBeVisible();
  await expect(page.getByText("A visual sense of scale")).toBeVisible();
  await page.getByRole("button", { name: "Open measurement guide" }).click();
  const measurementDialog = page.getByRole("dialog", {
    name: "Measurement guide",
  });
  await expect(measurementDialog).toBeVisible();
  await expect(
    measurementDialog.getByText("Condylobasal length"),
  ).toBeVisible();
  await measurementDialog.getByRole("button", { name: /close/i }).click();

  const ageButton = page.getByRole("button", { name: "How age is estimated" });
  await ageButton.click();
  const ageDialog = page.getByRole("dialog", { name: "Age-class guide" });
  await expect(ageDialog.getByText("Old adult")).toBeVisible();
  await expect(
    ageDialog.getByText(/Age classes are estimates based primarily/),
  ).toBeVisible();
  await ageDialog.getByRole("button", { name: /close/i }).click();
  await expect(ageButton).toBeFocused();

  await page.getByRole("button", { name: "View condition scale" }).click();
  const conditionDialog = page.getByRole("dialog", {
    name: "Specimen-condition guide",
  });
  await expect(conditionDialog.getByText("2 · Good")).toBeVisible();
  await expect(
    conditionDialog.getByText(/Natural abnormalities, age-related tooth loss/),
  ).toBeVisible();
  await conditionDialog.getByRole("button", { name: /close/i }).click();

  await page.getByText("Show additional recorded data").click();
  await expect(
    page
      .getByText("Pathology", { exact: true })
      .locator("..")
      .getByText("Not recorded"),
  ).toBeVisible();
  await expect(
    page
      .getByText("Trauma", { exact: true })
      .locator("..")
      .getByText("Not recorded"),
  ).toBeVisible();
  await expect(
    page
      .getByText("Teeth set", { exact: true })
      .locator("..")
      .getByText("Not recorded"),
  ).toBeVisible();
  await expect(
    page
      .getByText("Skeleton", { exact: true })
      .locator("..")
      .getByText("Not recorded"),
  ).toBeVisible();
});

test.describe("mobile touch behavior", () => {
  test.use({
    deviceScaleFactor: devices["Pixel 7"].deviceScaleFactor,
    hasTouch: devices["Pixel 7"].hasTouch,
    isMobile: devices["Pixel 7"].isMobile,
    userAgent: devices["Pixel 7"].userAgent,
    viewport: { width: 390, height: 844 },
  });

  test("tap, swipe, double-tap, pinch, and landscape thumbnail navigation all work", async ({
    page,
  }) => {
    await page.goto(taxonPath);
    const gallery = page.getByLabel(/Raccoon dog gallery/);

    await page.getByRole("button", { name: "Show dorsal view" }).tap();
    await expect(page.getByText("4 / 6 · Dorsal")).toBeVisible();
    await page.getByRole("button", { name: /^Next/ }).tap();
    await expect(page.getByText("5 / 6 · Ventral")).toBeVisible();
    await page.getByRole("button", { name: /Previous$/ }).tap();
    await expect(page.getByText("4 / 6 · Dorsal")).toBeVisible();

    await gallery.dispatchEvent("pointerdown", {
      clientX: 320,
      clientY: 220,
      pointerId: 7,
      pointerType: "touch",
    });
    await gallery.dispatchEvent("pointerup", {
      clientX: 100,
      clientY: 225,
      pointerId: 7,
      pointerType: "touch",
    });
    await expect(page.getByText("5 / 6 · Ventral")).toBeVisible();

    await gallery.tap({ position: { x: 180, y: 180 } });
    await gallery.tap({ position: { x: 180, y: 180 } });
    const dialog = page.locator("dialog.inspection-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/Ventral view/);
    await dialog.getByRole("button", { name: /close/i }).tap();

    await page.getByRole("button", { name: "Inspect image" }).tap();
    await expect(dialog).toBeVisible();
    const viewport = dialog.locator(".inspection-viewport");
    const box = await viewport.boundingBox();
    expect(box).not.toBeNull();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;
    const browserSession = await page.context().newCDPSession(page);
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: centerX - 40, y: centerY, id: 11 },
        { x: centerX + 40, y: centerY, id: 12 },
      ],
    });
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: centerX - 90, y: centerY, id: 11 },
        { x: centerX + 90, y: centerY, id: 12 },
      ],
    });
    await expect(dialog.locator("output")).not.toHaveText("100%");
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await dialog.getByRole("button", { name: /close/i }).tap();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);

    const heroImage = page.locator(".gallery-image");
    const transferSize = await heroImage.evaluate((image: HTMLImageElement) => {
      const entry = performance.getEntriesByName(image.currentSrc)[0] as
        PerformanceResourceTiming | undefined;
      return entry?.transferSize ?? 0;
    });
    expect(transferSize).toBeLessThanOrEqual(250 * 1024);

    await page.setViewportSize({ width: 844, height: 390 });
    const stageBox = await gallery.boundingBox();
    const thumbnailRailBox = await page
      .locator(".gallery-thumbnails")
      .boundingBox();
    expect(stageBox).not.toBeNull();
    expect(thumbnailRailBox).not.toBeNull();
    expect(thumbnailRailBox!.x).toBeGreaterThan(stageBox!.x + stageBox!.width);
  });
});

test("preparation record links to a safe, explicit guide shell", async ({
  page,
}) => {
  await page.goto(specimenPath);
  await page
    .getByRole("link", { name: /Open the skull preparation guide/ })
    .click();
  await expect(page).toHaveURL("/guides/skull-preparation");
  await expect(
    page.getByRole("heading", { level: 1, name: "Skull preparation" }),
  ).toBeVisible();
  await expect(
    page.getByText("This is not yet a procedural or safety guide."),
  ).toBeVisible();
  await expect(
    page.getByText("© 2026 Rasmus. All rights reserved."),
  ).toBeVisible();
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

  test("retains identification, all six views, measurements, and collection data", async ({
    page,
  }) => {
    await page.goto(specimenPath);
    await expect(
      page.getByRole("heading", { name: "Raccoon dog" }),
    ).toBeVisible();
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
