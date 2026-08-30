import { validatePublicMedia, printValidationError } from "./lib/media";
import { loadMeasurementReference } from "./lib/measurements";

try {
  const result = await validatePublicMedia({ writeManifest: true });
  const methodology = await loadMeasurementReference();
  console.log(
    `Media validation passed: ${result.assets.length} specimen assets, ${result.comparisonReferences.length} comparison reference, and ${methodology.reference.diagrams.length} methodology images, ${((result.totalBytes + methodology.publicMediaBytes) / 1024 / 1024).toFixed(2)} MiB, no EXIF/IPTC/XMP metadata.`,
  );
} catch (error) {
  printValidationError(error);
}
