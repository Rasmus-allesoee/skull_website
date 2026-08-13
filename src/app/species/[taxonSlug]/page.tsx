import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getExhibit, getPublishedTaxa } from "@/data/collection";
import { ExhibitPage } from "@/features/exhibit/ExhibitPage";

interface TaxonPageProps {
  params: Promise<{ taxonSlug: string }>;
}

export function generateStaticParams() {
  return getPublishedTaxa().map((taxon) => ({ taxonSlug: taxon.slug }));
}

export async function generateMetadata({
  params,
}: TaxonPageProps): Promise<Metadata> {
  const { taxonSlug } = await params;
  const exhibit = getExhibit(taxonSlug);
  if (!exhibit) return {};
  const title = `${exhibit.taxon.names.english ?? exhibit.taxon.scientificName} skull`;
  return {
    title,
    description: exhibit.profile.summary,
    alternates: { canonical: `/species/${taxonSlug}` },
  };
}

export default async function TaxonPage({ params }: TaxonPageProps) {
  const { taxonSlug } = await params;
  const exhibit = getExhibit(taxonSlug);
  if (!exhibit) notFound();
  return <ExhibitPage exhibit={exhibit} exactSpecimen={false} />;
}
