import { buildContent, printContentError } from "./lib/content";

try {
  const result = await buildContent({ writeArtifact: true });
  for (const warning of result.warnings) {
    console.warn(`Warning: ${warning.rule}: ${JSON.stringify(warning.value)}`);
  }
  console.log(
    `Content build passed: ${result.collection.taxa.length} taxon, ${result.collection.specimens.length} specimen, ${result.collection.media.length} media assets, ${result.collection.profiles.length} cited profile.`,
  );
} catch (error) {
  printContentError(error);
}
