import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { createPageMetadata } from "@/config/metadata";
import {
  getCollection,
  getExhibit,
  getTaxonSlugResolution,
} from "@/data/collection";
import { ExhibitPage } from "@/features/exhibit/ExhibitPage";

interface SpecimenPageProps {
  params: Promise<{ taxonSlug: string; specimenId: string }>;
}

export function generateStaticParams() {
  const collection = getCollection();
  return collection.specimens
    .filter((specimen) => specimen.publicationStatus === "published")
    .flatMap((specimen) => {
      const taxon = collection.taxa.find(
        (candidate) => candidate.taxonId === specimen.taxonId,
      );
      return taxon
        ? [taxon.slug, ...taxon.previousSlugs].map((taxonSlug) => ({
            taxonSlug,
            specimenId: specimen.specimenId,
          }))
        : [];
    });
}

export async function generateMetadata({
  params,
}: SpecimenPageProps): Promise<Metadata> {
  const { taxonSlug, specimenId } = await params;
  const resolution = getTaxonSlugResolution(taxonSlug);
  if (!resolution) return {};
  const exhibit = getExhibit(resolution.taxon.slug, specimenId);
  if (!exhibit) return {};
  const name = exhibit.taxon.names.english ?? exhibit.taxon.scientificName;
  const title = `${name} skull · ${specimenId}`;
  const image = exhibit.media.find((asset) => asset.view === "lateral");
  return createPageMetadata({
    title,
    description: `Multi-view photography, measurements, and collection data for exact ${name} skull specimen ${specimenId}.`,
    path: `/species/${exhibit.taxon.slug}/specimens/${specimenId}`,
    image: image?.publicPath,
  });
}

export default async function SpecimenPage({ params }: SpecimenPageProps) {
  const { taxonSlug, specimenId } = await params;
  const resolution = getTaxonSlugResolution(taxonSlug);
  if (!resolution) notFound();
  if (resolution.redirect) {
    permanentRedirect(
      `/species/${resolution.taxon.slug}/specimens/${specimenId}`,
    );
  }
  const exhibit = getExhibit(taxonSlug, specimenId);
  if (!exhibit) notFound();
  return <ExhibitPage exhibit={exhibit} exactSpecimen />;
}
