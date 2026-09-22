import type {
  ComparisonCamera,
  ComparisonLayerPlacement,
} from "./workbenchLayout";
import {
  comparisonWorldHeight,
  comparisonWorldPixelsPerMillimetre,
  comparisonWorldWidth,
} from "./workbenchLayout";

export type FieldPngBackground = "black" | "ui";

export interface FieldPngLayer {
  src: string;
  width: number;
  height: number;
  subjectX: number;
  subjectY: number;
  subjectWidth: number;
  subjectHeight: number;
  placement: ComparisonLayerPlacement;
  opacity: number;
  flipped: boolean;
  subjectIndex: number;
  label: string;
}

export interface FieldPngSnapshot {
  viewport: { width: number; height: number };
  camera: ComparisonCamera;
  layers: FieldPngLayer[];
  showLabels: boolean;
  scaleBar: { x: number; y: number } | null;
  background: FieldPngBackground;
}

const maximumOutputDimension = 6_000;
const maximumOutputPixels = 24_000_000;
const labelColors = ["#8fb8aa", "#c3a66e", "#9b9fca", "#c18475", "#9fb078"];
const labelMarkers = ["●", "■", "▲", "◆", "⬟"];

export async function renderFieldPng(
  snapshot: FieldPngSnapshot,
): Promise<Blob> {
  const { width, height } = snapshot.viewport;
  if (width <= 0 || height <= 0) {
    throw new Error("The field is not ready to export yet.");
  }

  const multiplier = Math.min(
    3,
    maximumOutputDimension / Math.max(width, height),
    Math.sqrt(maximumOutputPixels / (width * height)),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * multiplier);
  canvas.height = Math.round(height * multiplier);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PNG export is unavailable in this browser.");
  context.scale(canvas.width / width, canvas.height / height);
  drawBackground(context, snapshot.background, width, height);

  const images = await Promise.all(
    snapshot.layers.map(async (layer) => {
      const image = new Image();
      image.src = layer.src;
      await image.decode();
      return image;
    }),
  );

  context.save();
  context.translate(
    width / 2 + snapshot.camera.x,
    height / 2 + snapshot.camera.y,
  );
  context.scale(snapshot.camera.zoom, snapshot.camera.zoom);
  context.translate(-comparisonWorldWidth / 2, -comparisonWorldHeight / 2);
  const sorted = snapshot.layers
    .map((layer, index) => ({ layer, image: images[index]!, index }))
    .sort(
      (a, b) => a.layer.placement.z - b.layer.placement.z || a.index - b.index,
    );
  for (const { layer, image } of sorted) {
    context.save();
    context.globalAlpha = layer.opacity;
    if (layer.flipped) {
      context.translate(layer.placement.x + layer.width, layer.placement.y);
      context.scale(-1, 1);
      context.drawImage(image, 0, 0, layer.width, layer.height);
    } else {
      context.drawImage(
        image,
        layer.placement.x,
        layer.placement.y,
        layer.width,
        layer.height,
      );
    }
    context.restore();
    if (snapshot.showLabels) drawLabel(context, layer, snapshot.camera.zoom);
  }
  context.restore();

  if (snapshot.scaleBar) {
    drawScaleBar(context, snapshot.scaleBar, snapshot.camera.zoom);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("The field image could not be encoded.")),
      "image/png",
    );
  });
}

function drawBackground(
  context: CanvasRenderingContext2D,
  background: FieldPngBackground,
  width: number,
  height: number,
): void {
  context.fillStyle = background === "black" ? "#000000" : "#0d100f";
  context.fillRect(0, 0, width, height);
  if (background === "black") return;

  const radius = Math.hypot(width / 2, height * 0.58);
  const radial = context.createRadialGradient(
    width / 2,
    height * 0.42,
    0,
    width / 2,
    height * 0.42,
    radius,
  );
  radial.addColorStop(0, "rgb(113 149 138 / 8%)");
  radial.addColorStop(0.6, "rgb(113 149 138 / 0%)");
  context.fillStyle = radial;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgb(255 255 255 / 2%)";
  for (let x = 0; x < width; x += 40) context.fillRect(x, 0, 1, height);
  for (let y = 0; y < height; y += 40) context.fillRect(0, y, width, 1);
}

function drawLabel(
  context: CanvasRenderingContext2D,
  layer: FieldPngLayer,
  zoom: number,
): void {
  const uiScale = Math.min(1.75, Math.max(0.05, 0.9 / zoom));
  const x = layer.placement.x + layer.subjectX;
  const y = layer.placement.y + layer.subjectY + layer.subjectHeight + 4 / zoom;
  context.save();
  context.translate(x, y);
  context.scale(uiScale, uiScale);
  context.font = "600 6.4px Arial, sans-serif";
  const label = layer.label.toUpperCase();
  const labelWidth = context.measureText(label).width + 18;
  context.fillStyle = "rgb(13 16 15 / 82%)";
  context.fillRect(0, 0, labelWidth, 10);
  context.fillStyle = labelColors[layer.subjectIndex] ?? "#8fb8aa";
  context.font = "700 8px Arial, sans-serif";
  context.fillText(labelMarkers[layer.subjectIndex] ?? "●", 2, 7.5);
  context.fillStyle = "#d6d9d7";
  context.font = "600 6.4px Arial, sans-serif";
  context.fillText(label, 13, 7.5);
  context.restore();
}

function drawScaleBar(
  context: CanvasRenderingContext2D,
  position: { x: number; y: number },
  zoom: number,
): void {
  const barWidth = 100 * comparisonWorldPixelsPerMillimetre * zoom;
  context.save();
  context.translate(position.x, position.y);
  context.font = "9px Arial, sans-serif";
  const boxWidth = Math.max(
    barWidth + 12,
    context.measureText("Relative scale; not monitor-calibrated").width + 12,
  );
  context.fillStyle = "rgb(13 16 15 / 82%)";
  context.fillRect(0, 0, boxWidth, 42);
  context.strokeStyle = "#f3f4f3";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(6, 6);
  context.lineTo(6, 14);
  context.lineTo(barWidth + 6, 14);
  context.lineTo(barWidth + 6, 6);
  context.stroke();
  context.fillStyle = "#f3f4f3";
  context.font = "700 11px Arial, sans-serif";
  context.fillText("100 mm", 6, 28);
  context.font = "9px Arial, sans-serif";
  context.fillText("Relative scale; not monitor-calibrated", 6, 38);
  context.restore();
}
