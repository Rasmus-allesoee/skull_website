import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const packageRoot = path.dirname(require.resolve("maplibre-gl/package.json"));
const outputDirectory = path.join(process.cwd(), "public", "maplibre");

mkdirSync(outputDirectory, { recursive: true });

for (const fileName of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(
    path.join(packageRoot, "dist", fileName),
    path.join(outputDirectory, fileName),
  );
}

console.log(
  "Copied the pinned MapLibre worker and shared module to public/maplibre.",
);
