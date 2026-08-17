import { buildContent, printContentError } from "./lib/content";

try {
  const result = await buildContent();
  console.log(
    `Content validation passed: ${result.collection.taxa.length} published taxon and ${result.collection.specimens.length} published specimen; ${result.warnings.length} warning(s).`,
  );
} catch (error) {
  printContentError(error);
}
