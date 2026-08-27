import { buildContent, printContentError } from "./lib/content";

try {
  const result = await buildContent({ writeArtifact: true });
  for (const warning of result.warnings) {
    console.warn(`Warning: ${warning.rule}: ${JSON.stringify(warning.value)}`);
  }
  const reviewedProfiles = result.collection.profiles.filter(
    (profile) => profile.reviewStatus === "reviewed",
  ).length;
  console.log(
    `Content build passed: ${result.collection.taxa.length} taxon, ${result.collection.specimens.length} specimen, ${result.collection.media.length} specimen media assets, ${result.searchDocumentCount} search documents, ${result.collection.comparisonReferences.length} comparison reference, ${reviewedProfiles} reviewed profiles (${result.collection.profiles.length} source).`,
  );
} catch (error) {
  printContentError(error);
}
