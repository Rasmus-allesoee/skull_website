import { buildContent, printContentError } from "./lib/content";

try {
  const result = await buildContent();
  console.log(
    `Content validation passed: ${result.collection.taxa.length} published taxon, ${result.collection.specimens.length} published specimen, and ${result.measurementReference.definitions.length} measurement definitions; ${result.warnings.length} warning(s).`,
  );
} catch (error) {
  printContentError(error);
}
