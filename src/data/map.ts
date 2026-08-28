import { readFileSync } from "node:fs";
import path from "node:path";

import {
  mapProjectionVersion,
  type MapProjectionArtifact,
} from "@/domain/map/types";

let mapProjectionCache: MapProjectionArtifact | undefined;

export function getMapProjection(): MapProjectionArtifact {
  mapProjectionCache ??= JSON.parse(
    readFileSync(
      path.join(process.cwd(), ".generated", "map-records-v1.json"),
      "utf8",
    ),
  ) as MapProjectionArtifact;
  if (mapProjectionCache.schemaVersion !== mapProjectionVersion) {
    throw new Error("Generated map projection version is not supported.");
  }
  return mapProjectionCache;
}
