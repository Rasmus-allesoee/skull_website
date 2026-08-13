import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export function fromRepositoryRoot(...segments: string[]): string {
  return path.join(repositoryRoot, ...segments);
}
