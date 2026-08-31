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
    page.getByRole("heading", { level: 1, name: "Measurement diagrams" }),
  ).toBeVisible();
  await expect(page.getByText("These numbered diagrams define")).toHaveCount(0);
  await expect(
    page.getByText("Brass and bright outlines show interaction state"),
  ).toHaveCount(0);
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
  const detailPanel = page.getByRole("dialog", { name: "Skull length" });
  await expect(detailPanel).toBeVisible();
  await expect(detailPanel).toContainText("Greatest straight-line distance");
  await expect(detailPanel.getByText("Measurement 1")).toHaveCount(0);
  const panelGeometry = await detailPanel.evaluate((element) => ({
    position: getComputedStyle(element).position,
    obsoleteModal: document.querySelector(".measurement-detail-dialog"),
    viewportShare: element.getBoundingClientRect().height / innerHeight,
  }));
  expect(panelGeometry.position).toBe("fixed");
  expect(panelGeometry.obsoleteModal).toBeNull();
  expect(panelGeometry.viewportShare).toBeLessThan(0.5);
  await expect(
    page.locator('[data-measurement-number="1"][data-selected="true"]'),
  ).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(detailPanel).not.toBeVisible();
  await expect(firstOccurrence).toBeFocused();

  await page
    .getByRole("button", {
      name: "Show measurement 21: Mandibular canine length on its reference diagram",
    })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const canineOccurrence = page.locator(
    '[data-diagram-id="canine-lengths"][data-measurement-number="21"]',
  );
  await expect(canineOccurrence).toBeFocused();
  await expect(canineOccurrence).toHaveAttribute("data-selected", "true");
  await expect(page.locator(".measurement-board")).toHaveAttribute(
    "data-isolated",
    "true",
  );

  await page
    .getByRole("button", {
      name: "Show measurement 1: Skull length on its reference diagram",
    })
    .click();
  await expect(firstOccurrence).toBeFocused();
  await page.locator(".measurement-board-heading").click();
  await expect(
    page.locator('[data-measurement-number="1"][data-selected="true"]'),
  ).toHaveCount(0);

  const overlayGeometry = await page
    .locator('[data-diagram-id="lateral-skull"][data-measurement-number="1"]')
    .evaluate((element) => {
      const marker = element.closest("svg")!.querySelector("marker")!;
      const circle = element.querySelector(".measurement-number-backdrop")!;
      const text = element.querySelector(".measurement-number")!;
      return {
        markerUnits: marker.getAttribute("markerUnits"),
        markerWidth: marker.getAttribute("markerWidth"),
        ringRadius: circle.getAttribute("r"),
        textSize: getComputedStyle(text).fontSize,
        touchAction: getComputedStyle(
          element.closest(".measurement-diagram-scroll")!,
        ).touchAction,
      };
    });
  expect(overlayGeometry).toEqual({
    markerUnits: "strokeWidth",
    markerWidth: "6.5",
    ringRadius: "135",
    textSize: "142px",
    touchAction: "manipulation",
  });

  const layout = await page.locator(".measurement-board").evaluate(() => {
    const box = (id: string) =>
      document
        .getElementById(`measurement-figure-${id}`)!
        .getBoundingClientRect();
    const dorsal = box("dorsal-skull");
    const ventral = box("ventral-skull");
    const lateral = box("lateral-skull");
    const mandible = box("mandible-lateral");
    const canine = box("canine-lengths");
    return {
      dorsalTop: dorsal.top,
      ventralTop: ventral.top,
      lateralTop: lateral.top,
      mandibleTop: mandible.top,
      canineTop: canine.top,
      dorsalHeight: dorsal.height,
      lateralHeight: lateral.height,
    };
  });
  expect(Math.abs(layout.dorsalTop - layout.ventralTop)).toBeLessThan(2);
  expect(layout.lateralTop).toBeGreaterThan(layout.dorsalTop);
  expect(Math.abs(layout.mandibleTop - layout.canineTop)).toBeLessThan(2);
  expect(layout.dorsalHeight).toBeGreaterThan(layout.lateralHeight * 0.75);

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
  const previewLayout = await page
    .locator(".measurement-tooltip--touch")
    .evaluate((element) => {
      const name = element.querySelector("span")!.getBoundingClientRect();
      const action = element.querySelector("button")!.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        position: style.position,
        borderColor: style.borderTopColor,
        nameBeforeAction: name.right <= action.left,
        leftPadding: Number.parseFloat(style.paddingLeft),
      };
    });
  expect(previewLayout.position).toBe("static");
  expect(previewLayout.nameBeforeAction).toBe(true);
  expect(previewLayout.leftPadding).toBeGreaterThanOrEqual(12);
  await page.getByRole("button", { name: "Close measurement details" }).tap();
  await expect(page.locator(".measurement-tooltip--touch")).toBeVisible();
  await expect(page.locator(".measurement-tooltip--hover:visible")).toHaveCount(
    0,
  );

  const geometry = await page.locator("body").evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    boardWidth: document
      .querySelector(".measurement-board")!
      .getBoundingClientRect().width,
    figureWidths: Array.from(
      document.querySelectorAll(".measurement-figure"),
    ).map((element) => element.getBoundingClientRect().width),
    diagramTouchActions: Array.from(
      document.querySelectorAll(".measurement-diagram-scroll"),
    ).map((element) => getComputedStyle(element).touchAction),
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(
    geometry.figureWidths.every((width) => width <= geometry.boardWidth),
  ).toBe(true);
  expect(
    geometry.diagramTouchActions.every((value) => value === "manipulation"),
  ).toBe(true);

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

  await page
    .locator(
      '[data-diagram-id="lateral-skull"][data-measurement-number="1"] .measurement-number-backdrop',
    )
    .click();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  await expect(page.locator(".measurement-detail-panel")).toHaveCSS(
    "position",
    "fixed",
  );
  const zoomedPanel = await page
    .locator(".measurement-detail-panel")
    .evaluate((element) => {
      const viewport = window.visualViewport!;
      const panel = element.getBoundingClientRect();
      return {
        panelLeft: panel.left,
        panelRight: panel.right,
        viewportLeft: viewport.offsetLeft,
        viewportRight: viewport.offsetLeft + viewport.width,
        scale: viewport.scale,
      };
    });
  expect(zoomedPanel.scale).toBe(2);
  expect(zoomedPanel.panelLeft).toBeGreaterThanOrEqual(
    zoomedPanel.viewportLeft,
  );
  expect(zoomedPanel.panelRight).toBeLessThanOrEqual(zoomedPanel.viewportRight);
});

test("measurement definitions and figures remain useful without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/methodology");
  await expect(
    page.getByRole("heading", { level: 1, name: "Measurement diagrams" }),
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
