import { readFileSync } from "node:fs";
import path from "node:path";

import type { MeasurementReference } from "@/domain/methodology/types";

let measurementReferenceCache: MeasurementReference | undefined;

export function getMeasurementReference(): MeasurementReference {
  measurementReferenceCache ??= JSON.parse(
    readFileSync(
      path.join(process.cwd(), ".generated", "measurement-reference-v1.json"),
      "utf8",
    ),
  ) as MeasurementReference;
  return measurementReferenceCache;
}
