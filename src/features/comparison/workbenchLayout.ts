import type { ComparisonArrangement } from "./workbenchState";

export const comparisonWorldWidth = 1_480;
export const comparisonWorldHeight = 900;
export const comparisonWorldPixelsPerMillimetre = 1.35;
export const minimumFieldZoom = 0.25;
// The previous 300% ceiling left a 36 mm mole skull at roughly 50% of its
// useful desktop field width.  2,000% makes the smallest published lateral
// views inspectable while still staying within the source-pixel budget of the
// reviewed high-resolution derivatives.
export const maximumFieldZoom = 20;

export interface ComparisonLayerGeometry {
  key: string;
  subjectId: string;
  subjectIndex: number;
  view: string;
  width: number;
  height: number;
  /** Visible alpha-bounded subject rectangle inside the calibrated canvas. */
  subjectX: number;
  subjectY: number;
  subjectWidth: number;
  subjectHeight: number;
}

export interface ComparisonLayerPlacement {
  x: number;
  y: number;
  z: number;
}

export interface ComparisonCamera {
  x: number;
  y: number;
  zoom: number;
}

export function arrangeComparisonLayers(
  layers: ComparisonLayerGeometry[],
  arrangement: ComparisonArrangement,
  difference: [string, string] | null,
): Record<string, ComparisonLayerPlacement> {
  if (layers.length === 0) return {};

  if (arrangement === "vertical-stack") {
    return placeLinear(layers, "vertical", 34);
  }
  if (arrangement === "side-by-side") {
    return placeWrapped(layers, 28);
  }
  if (arrangement === "by-view") {
    return placeGrouped(layers, (layer) => layer.view);
  }
  if (arrangement === "overlay-pair") {
    return placeOverlayGroups(layers, difference);
  }
  if (arrangement === "custom") {
    return placeCentered(layers);
  }
  return placeGrouped(layers, (layer) => layer.subjectId);
}

export function getFittedComparisonCamera(
  layers: ComparisonLayerGeometry[],
  placements: Record<string, ComparisonLayerPlacement>,
  viewport: { width: number; height: number },
): ComparisonCamera {
  if (layers.length === 0 || viewport.width <= 0 || viewport.height <= 0) {
    return { x: 0, y: 0, zoom: 1 };
  }
  const bounds = getLayerBounds(layers, placements);
  // Fit the visible alpha bounds, not the transparent source canvases. A
  // modest fixed margin keeps the field legible without making Fit all feel
  // like a distant overview on wide screens.
  const padding = Math.min(36, Math.max(18, viewport.width * 0.035));
  const availableWidth = Math.max(1, viewport.width - padding * 2);
  const availableHeight = Math.max(1, viewport.height - padding * 2);
  const zoom = clamp(
    Math.min(availableWidth / bounds.width, availableHeight / bounds.height),
    minimumFieldZoom,
    maximumFieldZoom,
  );
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  return {
    x: -(centerX - comparisonWorldWidth / 2) * zoom,
    y: -(centerY - comparisonWorldHeight / 2) * zoom,
    zoom,
  };
}

export function getNextLayerZ(
  placements: Record<string, ComparisonLayerPlacement>,
) {
  return Math.max(0, ...Object.values(placements).map(({ z }) => z)) + 1;
}

function placeLinear(
  layers: ComparisonLayerGeometry[],
  axis: "horizontal" | "vertical",
  gap: number,
) {
  const total = layers.reduce(
    (sum, layer) => sum + (axis === "horizontal" ? layer.width : layer.height),
    0,
  );
  let cursor =
    (axis === "horizontal" ? comparisonWorldWidth : comparisonWorldHeight) / 2 -
    (total + gap * (layers.length - 1)) / 2;
  const result: Record<string, ComparisonLayerPlacement> = {};
  layers.forEach((layer, index) => {
    const x =
      axis === "horizontal" ? cursor : (comparisonWorldWidth - layer.width) / 2;
    const y =
      axis === "vertical" ? cursor : (comparisonWorldHeight - layer.height) / 2;
    result[layer.key] = { x, y, z: index + 1 };
    cursor += (axis === "horizontal" ? layer.width : layer.height) + gap;
  });
  return result;
}

function placeCentered(layers: ComparisonLayerGeometry[]) {
  const result: Record<string, ComparisonLayerPlacement> = {};
  layers.forEach((layer, index) => {
    result[layer.key] = {
      x: (comparisonWorldWidth - layer.width) / 2,
      y: (comparisonWorldHeight - layer.height) / 2,
      z: index + 1,
    };
  });
  return result;
}

function placeWrapped(layers: ComparisonLayerGeometry[], gap: number) {
  const rows: ComparisonLayerGeometry[][] = [];
  let row: ComparisonLayerGeometry[] = [];
  let rowWidth = 0;
  const targetWidth = comparisonWorldWidth - 120;
  for (const layer of layers) {
    const nextWidth = rowWidth + (row.length > 0 ? gap : 0) + layer.width;
    if (row.length > 0 && nextWidth > targetWidth) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push(layer);
    rowWidth += (row.length > 1 ? gap : 0) + layer.width;
  }
  if (row.length > 0) rows.push(row);

  const rowHeights = rows.map((items) =>
    Math.max(...items.map((item) => item.height)),
  );
  const totalHeight =
    rowHeights.reduce((sum, height) => sum + height, 0) +
    gap * (rows.length - 1);
  let y = (comparisonWorldHeight - totalHeight) / 2;
  const result: Record<string, ComparisonLayerPlacement> = {};
  let z = 1;
  rows.forEach((items, rowIndex) => {
    const width =
      items.reduce((sum, item) => sum + item.width, 0) +
      gap * (items.length - 1);
    let x = (comparisonWorldWidth - width) / 2;
    items.forEach((item) => {
      result[item.key] = {
        x,
        y: y + (rowHeights[rowIndex]! - item.height) / 2,
        z,
      };
      x += item.width + gap;
      z += 1;
    });
    y += rowHeights[rowIndex]! + gap;
  });
  return result;
}

function placeGrouped(
  layers: ComparisonLayerGeometry[],
  groupFor: (layer: ComparisonLayerGeometry) => string,
) {
  const groups = new Map<string, ComparisonLayerGeometry[]>();
  for (const layer of layers) {
    const key = groupFor(layer);
    groups.set(key, [...(groups.get(key) ?? []), layer]);
  }
  const groupEntries = [...groups.values()];
  const groupGap = 54;
  const itemGap = 18;
  const widths = groupEntries.map((group) =>
    Math.max(...group.map((layer) => layer.width)),
  );
  const totalWidth =
    widths.reduce((sum, width) => sum + width, 0) +
    groupGap * (groupEntries.length - 1);
  let x = (comparisonWorldWidth - totalWidth) / 2;
  const result: Record<string, ComparisonLayerPlacement> = {};
  let z = 1;
  groupEntries.forEach((group, groupIndex) => {
    const height =
      group.reduce((sum, layer) => sum + layer.height, 0) +
      itemGap * (group.length - 1);
    let y = (comparisonWorldHeight - height) / 2;
    group.forEach((layer) => {
      result[layer.key] = {
        x: x + (widths[groupIndex]! - layer.width) / 2,
        y,
        z,
      };
      y += layer.height + itemGap;
      z += 1;
    });
    x += widths[groupIndex]! + groupGap;
  });
  return result;
}

function placeOverlayGroups(
  layers: ComparisonLayerGeometry[],
  _difference: [string, string] | null,
) {
  void _difference;
  const preferredViews = [
    "lateral",
    "dorsal",
    "ventral",
    "frontal",
    "mandible-dorsal",
  ];
  const groups = preferredViews
    .map((view) => ({
      view,
      layers: layers.filter((layer) => layer.view === view),
    }))
    .filter(({ layers: groupLayers }) => groupLayers.length > 0);
  if (groups.length === 0) return {};

  const groupGap = 44;
  const rowGap = 54;
  const targetWidth = comparisonWorldWidth - 120;
  const rows: (typeof groups)[] = [];
  let row: typeof groups = [];
  let rowWidth = 0;
  for (const group of groups) {
    const groupWidth = Math.max(...group.layers.map(({ width }) => width));
    const nextWidth = rowWidth + (row.length > 0 ? groupGap : 0) + groupWidth;
    if (row.length > 0 && nextWidth > targetWidth) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push(group);
    rowWidth += (row.length > 1 ? groupGap : 0) + groupWidth;
  }
  if (row.length > 0) rows.push(row);

  const rowHeights = rows.map((items) =>
    Math.max(
      ...items.map(({ layers: groupLayers }) =>
        Math.max(...groupLayers.map(({ height }) => height)),
      ),
    ),
  );
  const totalHeight =
    rowHeights.reduce((sum, height) => sum + height, 0) +
    rowGap * (rows.length - 1);
  let y = (comparisonWorldHeight - totalHeight) / 2;
  const result: Record<string, ComparisonLayerPlacement> = {};
  let z = 1;
  rows.forEach((items, rowIndex) => {
    const widths = items.map(({ layers: groupLayers }) =>
      Math.max(...groupLayers.map(({ width }) => width)),
    );
    const totalWidth =
      widths.reduce((sum, width) => sum + width, 0) +
      groupGap * (items.length - 1);
    let x = (comparisonWorldWidth - totalWidth) / 2;
    items.forEach((group, groupIndex) => {
      const groupWidth = widths[groupIndex]!;
      const groupLayers = group.layers;
      const groupHeight = Math.max(...groupLayers.map(({ height }) => height));
      const groupTop = y + (rowHeights[rowIndex]! - groupHeight) / 2;
      groupLayers.forEach((layer) => {
        result[layer.key] = {
          x: x + (groupWidth - layer.width) / 2,
          y: groupTop + (groupHeight - layer.height) / 2,
          z,
        };
        z += 1;
      });
      x += groupWidth + groupGap;
    });
    y += rowHeights[rowIndex]! + rowGap;
  });
  return result;
}

function getLayerBounds(
  layers: ComparisonLayerGeometry[],
  placements: Record<string, ComparisonLayerPlacement>,
) {
  const positioned = layers.flatMap((layer) => {
    const placement = placements[layer.key];
    return placement ? [{ layer, placement }] : [];
  });
  if (positioned.length === 0) {
    return { left: 0, top: 0, width: comparisonWorldWidth, height: 900 };
  }
  const left = Math.min(
    ...positioned.map(({ layer, placement }) => placement.x + layer.subjectX),
  );
  const top = Math.min(
    ...positioned.map(({ layer, placement }) => placement.y + layer.subjectY),
  );
  const right = Math.max(
    ...positioned.map(
      ({ layer, placement }) =>
        placement.x + layer.subjectX + layer.subjectWidth,
    ),
  );
  const bottom = Math.max(
    ...positioned.map(
      ({ layer, placement }) =>
        placement.y + layer.subjectY + layer.subjectHeight,
    ),
  );
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
