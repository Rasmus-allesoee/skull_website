import { validatePublicMedia, printValidationError } from "./lib/media";
import { loadMeasurementReference } from "./lib/measurements";
import { loadPreparationMedia } from "./lib/preparation";
import { loadHomeMedia } from "./lib/home-media";

try {
  const result = await validatePublicMedia({ writeManifest: true });
  const methodology = await loadMeasurementReference();
  const preparation = await loadPreparationMedia();
  console.log(
    `Preparation media: ${preparation.length} validated derivatives.`,
  );
  const homeMedia = await loadHomeMedia();
  const homeMediaBytes = homeMedia.assets.reduce(
    (total, asset) => total + asset.bytes,
    0,
  );
  console.log(
    `Media validation passed: ${result.assets.length} specimen assets, ${result.comparisonReferences.length} comparison reference, ${methodology.reference.diagrams.length} methodology images, and ${homeMedia.assets.length} Home assets, ${preparation.length} preparation assets, ${((result.totalBytes + methodology.publicMediaBytes + homeMediaBytes + preparation.reduce((total, asset) => total + asset.bytes, 0)) / 1024 / 1024).toFixed(2)} MiB, no EXIF/IPTC/XMP metadata.`,
  );
} catch (error) {
  printValidationError(error);
}
