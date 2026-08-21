import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { createPageMetadata } from "@/config/metadata";
import {
  getExhibit,
  getPublishedTaxa,
  getTaxonSlugResolution,
} from "@/data/collection";
import { ExhibitPage } from "@/features/exhibit/ExhibitPage";

interface TaxonPageProps {
  params: Promise<{ taxonSlug: string }>;
}

export function generateStaticParams() {
  return getPublishedTaxa().flatMap((taxon) =>
    [taxon.slug, ...taxon.previousSlugs].map((taxonSlug) => ({ taxonSlug })),
  );
}

export async function generateMetadata({
  params,
}: TaxonPageProps): Promise<Metadata> {
  const { taxonSlug } = await params;
  const resolution = getTaxonSlugResolution(taxonSlug);
  if (!resolution) return {};
  const exhibit = getExhibit(resolution.taxon.slug);
  if (!exhibit) return {};
  const title = `${exhibit.taxon.names.english ?? exhibit.taxon.scientificName} skull`;
  const name = exhibit.taxon.names.english ?? exhibit.taxon.scientificName;
  const image = exhibit.media.find((asset) => asset.view === "lateral");
  return createPageMetadata({
    title,
    description: `Six-view photography, measurements, and collection data for ${name} skull ${exhibit.specimen.specimenId}.`,
    path: `/species/${exhibit.taxon.slug}`,
    image: image?.publicPath,
  });
}

export default async function TaxonPage({ params }: TaxonPageProps) {
  const { taxonSlug } = await params;
  const resolution = getTaxonSlugResolution(taxonSlug);
  if (!resolution) notFound();
  if (resolution.redirect) {
    permanentRedirect(`/species/${resolution.taxon.slug}`);
  }
  const exhibit = getExhibit(taxonSlug);
  if (!exhibit) notFound();
  return <ExhibitPage exhibit={exhibit} exactSpecimen={false} />;
}
