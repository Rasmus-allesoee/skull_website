import { validatePublicMedia, printValidationError } from "./lib/media";

try {
  const result = await validatePublicMedia({ writeManifest: true });
  console.log(
    `Media validation passed: ${result.assets.length} specimen assets plus ${result.comparisonReferences.length} comparison reference, ${(result.totalBytes / 1024 / 1024).toFixed(2)} MiB, no EXIF/IPTC/XMP metadata.`,
  );
} catch (error) {
  printValidationError(error);
}
