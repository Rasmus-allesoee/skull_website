import { validatePublicMedia, printValidationError } from "./lib/media";
import { loadMeasurementReference } from "./lib/measurements";
import { loadHomeMedia } from "./lib/home-media";

try {
  const result = await validatePublicMedia({ writeManifest: true });
  const methodology = await loadMeasurementReference();
  const homeMedia = await loadHomeMedia();
  const homeMediaBytes = homeMedia.assets.reduce(
    (total, asset) => total + asset.bytes,
    0,
  );
  console.log(
    `Media validation passed: ${result.assets.length} specimen assets, ${result.comparisonReferences.length} comparison reference, ${methodology.reference.diagrams.length} methodology images, and ${homeMedia.assets.length} Home asset, ${((result.totalBytes + methodology.publicMediaBytes + homeMediaBytes) / 1024 / 1024).toFixed(2)} MiB, no EXIF/IPTC/XMP metadata.`,
  );
} catch (error) {
  printValidationError(error);
}
