import { readFileSync } from "node:fs";
import path from "node:path";
import type { PreparationGuide } from "@/domain/guides/guide";
export function getPreparationGuide(): PreparationGuide {
  return JSON.parse(
    readFileSync(
      path.join(process.cwd(), ".generated/preparation-guide-v1.json"),
      "utf8",
    ),
  ) as PreparationGuide;
}
