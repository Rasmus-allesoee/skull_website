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
    new RegExp(`${taxonPath}$`),
  );
  await expect(
    page
      .getByLabel("Collection record")
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
    new RegExp(`${specimenPath}$`),
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
    pointerType: "pen",
  });
  await gallery.dispatchEvent("pointerup", {
    clientX: 100,
    clientY: 205,
    pointerId: 1,
    pointerType: "pen",
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
  await expect
    .poll(() =>
      inspectionImage.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBe(3200);
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
  const pageScrollBeforeZoom = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -360);
  await expect(dialog.locator("output")).not.toHaveText("100%");
  expect(await page.evaluate(() => scrollY)).toBe(pageScrollBeforeZoom);

  const pinchCancellation = await viewport.evaluate((element) => {
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      clientX: innerWidth / 2,
      clientY: innerHeight / 2,
      ctrlKey: true,
      deltaY: -80,
    });
    const dispatchResult = element.dispatchEvent(event);
    return { defaultPrevented: event.defaultPrevented, dispatchResult };
  });
  expect(pinchCancellation).toEqual({
    defaultPrevented: true,
    dispatchResult: false,
  });
  expect(await page.evaluate(() => scrollY)).toBe(pageScrollBeforeZoom);

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

  await page.keyboard.press("ArrowRight");
  await expect(dialog).toHaveAccessibleName(/Lateral view/);
  await expect(dialog.locator("output")).toHaveText("100%");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(gallery).toBeFocused();
});

test("normal-window desktop layout uses a taller alpha-bounded frame and keeps controls with the rail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 696 });
  await page.goto(taxonPath);
  await page
    .locator(".gallery-stage")
    .evaluate((stage) =>
      stage.scrollIntoView({ block: "start", behavior: "instant" }),
    );

  const visibleBottom = await page.evaluate(() => innerHeight);
  const stageBox = await page.locator(".gallery-stage").boundingBox();
  const controlsBox = await page.locator(".gallery-controls").boundingBox();
  const thumbnailRail = page.locator(".gallery-thumbnails");
  const thumbnailRailBox = await thumbnailRail.boundingBox();
  expect(stageBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();
  expect(thumbnailRailBox).not.toBeNull();
  expect(stageBox!.height / visibleBottom).toBeGreaterThanOrEqual(0.72);
  expect(stageBox!.height / visibleBottom).toBeLessThanOrEqual(0.76);
  expect(controlsBox!.y + controlsBox!.height).toBeLessThanOrEqual(
    visibleBottom,
  );
  expect(
    Math.abs(
      thumbnailRailBox!.y +
        thumbnailRailBox!.height -
        (controlsBox!.y + controlsBox!.height),
    ),
  ).toBeLessThanOrEqual(18);
  const railGeometry = await thumbnailRail.evaluate((rail) => ({
    clientHeight: rail.clientHeight,
    scrollHeight: rail.scrollHeight,
  }));
  expect(railGeometry.scrollHeight).toBeGreaterThan(railGeometry.clientHeight);
  await page
    .getByRole("button", { name: "Show mandible — dorsal view" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Show mandible — dorsal view" }),
  ).toBeVisible();

  const geometry = await page
    .locator(".gallery-stage")
    .evaluate(async (stage) => {
      const image = stage.querySelector<SVGSVGElement>(".gallery-image")!;
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
  expect(geometry.image.y - geometry.stage.y).toBeGreaterThanOrEqual(44);
  expect(geometry.image.y - geometry.stage.y).toBeLessThanOrEqual(54);
  expect(geometry.image.x + geometry.image.width).toBeLessThanOrEqual(
    geometry.stage.x + geometry.stage.width,
  );
  expect(geometry.image.y + geometry.image.height).toBeLessThanOrEqual(
    geometry.stage.y + geometry.stage.height,
  );

  const imageDelivery = await page
    .locator(".gallery-image")
    .evaluate((image: SVGSVGElement) => ({
      href: image.querySelector("image")?.getAttribute("href"),
      viewBox: image.getAttribute("viewBox"),
      preserveAspectRatio: image.getAttribute("preserveAspectRatio"),
    }));
  expect(imageDelivery.href).toBe(
    "/media/specimens/SPEC-0001/SPEC-0001__lateral.webp",
  );
  expect(imageDelivery.viewBox).toBe("363 426 2603 1634");
  expect(imageDelivery.preserveAspectRatio).toBe("xMidYMid meet");

  await page.getByRole("button", { name: "Show oblique view" }).click();
  const obliqueInset = await page
    .locator(".gallery-stage")
    .evaluate(async (stage) => {
      const stageBox = stage.getBoundingClientRect();
      const image = stage.querySelector<SVGSVGElement>(".gallery-image")!;
      await Promise.all(
        image
          .getAnimations()
          .map((animation) => animation.finished.catch(() => undefined)),
      );
      const imageBox = image.getBoundingClientRect();
      return imageBox.y - stageBox.y;
    });
  expect(obliqueInset).toBeGreaterThanOrEqual(8);
  expect(obliqueInset).toBeLessThanOrEqual(12);
});

test("measurement, age, condition, and additional-record guides disclose the new data model", async ({
  page,
}) => {
  await page.goto(specimenPath);

  await expect(
    page.getByRole("heading", { name: "Measurements" }),
  ).toBeVisible();
  await expect(page.getByText("A sense of scale")).toBeVisible();
  await expect(
    page.getByText("Adult human skull", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("~66 mm shorter")).toBeVisible();
  await expect(page.getByText("(0.64×)")).toBeVisible();
  const primaryScale = page.locator(
    '[data-comparison-id="specimen:SPEC-0001"]',
  );
  const humanScale = page.locator(
    '[data-comparison-id="reference:adult-human-skull"]',
  );
  const [primaryScaleBox, humanScaleBox] = await Promise.all([
    primaryScale.boundingBox(),
    humanScale.boundingBox(),
  ]);
  expect(primaryScaleBox).not.toBeNull();
  expect(humanScaleBox).not.toBeNull();
  expect(primaryScaleBox!.width / humanScaleBox!.width).toBeCloseTo(
    116 / 182,
    2,
  );

  await page.getByRole("button", { name: "Compare" }).click();
  const comparisonDialog = page.getByRole("dialog", {
    name: "Compare with…",
  });
  await expect(comparisonDialog).toBeVisible();
  await expect(
    comparisonDialog.getByRole("option", {
      name: /Adult human skull — default/,
    }),
  ).toBeVisible();
  await expect(
    comparisonDialog.getByRole("option", { name: /SPEC-0001/ }),
  ).toHaveCount(0);
  await comparisonDialog.getByRole("button", { name: /close/i }).click();

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
  expect(
    await ageDialog
      .getByText(/Age classes are estimates based primarily/)
      .evaluate((note) => getComputedStyle(note).textAlign),
  ).toBe("left");
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
  const conditionTitle = conditionDialog.getByRole("heading", {
    name: "Specimen-condition guide",
  });
  const conditionTitleBox = await conditionTitle.boundingBox();
  expect(conditionTitleBox).not.toBeNull();
  expect(conditionTitleBox!.height).toBeLessThan(50);
  expect(
    await conditionTitle.evaluate((title) => getComputedStyle(title).textAlign),
  ).toBe("left");
  expect(
    await conditionDialog
      .getByText(/Natural abnormalities, age-related tooth loss/)
      .evaluate((note) => getComputedStyle(note).textAlign),
  ).toBe("left");
  await conditionDialog.getByRole("button", { name: /close/i }).click();

  await page.getByText("Show additional recorded data").click();
  await expect(
    page.locator(".record-panel .section-kicker", { hasText: "Metadata" }),
  ).toBeVisible();
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
    const browserSession = await page.context().newCDPSession(page);

    await page.getByRole("button", { name: "Show dorsal view" }).tap();
    await expect(page.getByText("4 / 6 · Dorsal")).toBeVisible();
    await page.getByRole("button", { name: /^Next/ }).tap();
    await expect(page.getByText("5 / 6 · Ventral")).toBeVisible();
    await page.getByRole("button", { name: /Previous$/ }).tap();
    await expect(page.getByText("4 / 6 · Dorsal")).toBeVisible();

    await gallery.scrollIntoViewIfNeeded();
    const galleryBox = await gallery.boundingBox();
    expect(galleryBox).not.toBeNull();
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        {
          x: galleryBox!.x + galleryBox!.width * 0.8,
          y: galleryBox!.y + galleryBox!.height / 2,
          id: 7,
        },
      ],
    });
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: galleryBox!.x + galleryBox!.width * 0.2,
          y: galleryBox!.y + galleryBox!.height / 2,
          id: 7,
        },
      ],
    });
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(page.getByText("5 / 6 · Ventral")).toBeVisible();

    await gallery.tap({ position: { x: 180, y: 180 } });
    await gallery.tap({ position: { x: 180, y: 180 } });
    const dialog = page.locator("dialog.inspection-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/Ventral view/);
    await dialog.getByRole("button", { name: /close/i }).tap();

    await page.getByRole("button", { name: "Open measurement guide" }).tap();
    const measurementDialog = page.getByRole("dialog", {
      name: "Measurement guide",
    });
    await expect(measurementDialog).toBeVisible();
    await measurementDialog.getByRole("button", { name: /close/i }).tap();

    await page.getByRole("button", { name: "Compare" }).tap();
    const comparisonDialog = page.getByRole("dialog", {
      name: "Compare with…",
    });
    await expect(comparisonDialog).toBeVisible();
    await comparisonDialog.getByRole("button", { name: /close/i }).tap();

    await page.getByRole("button", { name: "How age is estimated" }).tap();
    const ageDialog = page.getByRole("dialog", { name: "Age-class guide" });
    await expect(ageDialog).toBeVisible();
    await ageDialog.getByRole("button", { name: /close/i }).tap();

    await page.getByRole("button", { name: "View condition scale" }).tap();
    const conditionDialog = page.getByRole("dialog", {
      name: "Specimen-condition guide",
    });
    await expect(conditionDialog).toBeVisible();
    await conditionDialog.getByRole("button", { name: /close/i }).tap();

    const portraitScaleRatio = await page.evaluate(() => {
      const primary = document.querySelector<HTMLElement>(
        '[data-comparison-id="specimen:SPEC-0001"]',
      )!;
      const human = document.querySelector<HTMLElement>(
        '[data-comparison-id="reference:adult-human-skull"]',
      )!;
      return (
        primary.getBoundingClientRect().width /
        human.getBoundingClientRect().width
      );
    });
    expect(portraitScaleRatio).toBeCloseTo(116 / 182, 2);

    await page.getByRole("button", { name: "Inspect image" }).tap();
    await expect(dialog).toBeVisible();
    const viewport = dialog.locator(".inspection-viewport");
    const box = await viewport.boundingBox();
    expect(box).not.toBeNull();

    await viewport.dispatchEvent("pointerdown", {
      clientX: box!.x + box!.width * 0.8,
      clientY: box!.y + box!.height / 2,
      pointerId: 21,
      pointerType: "touch",
    });
    await viewport.dispatchEvent("pointerup", {
      clientX: box!.x + box!.width * 0.2,
      clientY: box!.y + box!.height / 2,
      pointerId: 21,
      pointerType: "touch",
    });
    await expect(dialog).toHaveAccessibleName(/Mandible — dorsal view/);
    await expect(dialog.locator("output")).toHaveText("100%");

    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;
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
    const transferSize = await heroImage.evaluate((image: SVGSVGElement) => {
      const href = image.querySelector("image")?.getAttribute("href") ?? "";
      const entry = performance.getEntriesByName(
        new URL(href, location.href).href,
      )[0] as PerformanceResourceTiming | undefined;
      return entry?.transferSize ?? 0;
    });
    expect(transferSize).toBeGreaterThan(0);
    expect(transferSize).toBeLessThanOrEqual(400 * 1024);

    await page.setViewportSize({ width: 844, height: 390 });
    const stageBox = await gallery.boundingBox();
    const thumbnailRailBox = await page
      .locator(".gallery-thumbnails")
      .boundingBox();
    expect(stageBox).not.toBeNull();
    expect(thumbnailRailBox).not.toBeNull();
    expect(thumbnailRailBox!.x).toBeGreaterThan(stageBox!.x + stageBox!.width);

    const landscapeScaleRatio = await page.evaluate(() => {
      const primary = document.querySelector<HTMLElement>(
        '[data-comparison-id="specimen:SPEC-0001"]',
      )!;
      const human = document.querySelector<HTMLElement>(
        '[data-comparison-id="reference:adult-human-skull"]',
      )!;
      return (
        primary.getBoundingClientRect().width /
        human.getBoundingClientRect().width
      );
    });
    expect(landscapeScaleRatio).toBeCloseTo(116 / 182, 2);
  });

  test("the main gallery preserves native page pinch zoom and two-dimensional pan", async ({
    page,
  }) => {
    await page.goto(taxonPath);
    const gallery = page.getByLabel(/Raccoon dog gallery/);
    await expect(page.getByText("1 / 6 · Lateral")).toBeVisible();
    await expect
      .poll(() =>
        gallery.evaluate((element) => getComputedStyle(element).touchAction),
      )
      .toBe("manipulation");

    const box = await gallery.boundingBox();
    expect(box).not.toBeNull();
    const browserSession = await page.context().newCDPSession(page);
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: centerX - 30, y: centerY, id: 31 },
        { x: centerX + 30, y: centerY, id: 32 },
      ],
    });
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: centerX - 80, y: centerY, id: 31 },
        { x: centerX + 80, y: centerY, id: 32 },
      ],
    });

    await expect
      .poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1))
      .toBeGreaterThan(1.1);

    const viewportBeforePinchTranslation = await page.evaluate(() => ({
      left: window.visualViewport?.pageLeft ?? 0,
      top: window.visualViewport?.pageTop ?? 0,
    }));
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: centerX - 130, y: centerY - 50, id: 31 },
        { x: centerX + 30, y: centerY - 50, id: 32 },
      ],
    });
    await expect
      .poll(() =>
        page.evaluate(
          ({ minimumLeft, minimumTop }) =>
            (window.visualViewport?.pageLeft ?? 0) > minimumLeft &&
            (window.visualViewport?.pageTop ?? 0) > minimumTop,
          {
            minimumLeft: viewportBeforePinchTranslation.left + 5,
            minimumTop: viewportBeforePinchTranslation.top + 5,
          },
        ),
      )
      .toBe(true);
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });

    const viewportBeforeOneFingerPan = await page.evaluate(() => ({
      left: window.visualViewport?.pageLeft ?? 0,
      top: window.visualViewport?.pageTop ?? 0,
    }));
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        {
          x: centerX,
          y: centerY,
          id: 41,
        },
      ],
    });
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: centerX - 40,
          y: centerY - 40,
          id: 41,
        },
      ],
    });
    await browserSession.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });

    await expect
      .poll(() =>
        page.evaluate(
          ({ minimumLeft, minimumTop }) =>
            (window.visualViewport?.pageLeft ?? 0) > minimumLeft &&
            (window.visualViewport?.pageTop ?? 0) > minimumTop,
          {
            minimumLeft: viewportBeforeOneFingerPan.left + 5,
            minimumTop: viewportBeforeOneFingerPan.top + 5,
          },
        ),
      )
      .toBe(true);
    await expect(page.getByText("1 / 6 · Lateral")).toBeVisible();
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
  expect([...origins]).toEqual([new URL(page.url()).origin]);
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
