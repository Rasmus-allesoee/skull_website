import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCollection, getExhibit } from "@/data/collection";
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
        ? [{ taxonSlug: taxon.slug, specimenId: specimen.specimenId }]
        : [];
    });
}

export async function generateMetadata({
  params,
}: SpecimenPageProps): Promise<Metadata> {
  const { taxonSlug, specimenId } = await params;
  const exhibit = getExhibit(taxonSlug, specimenId);
  if (!exhibit) return {};
  const name = exhibit.taxon.names.english ?? exhibit.taxon.scientificName;
  const title = `${name} skull · ${specimenId}`;
  return {
    title,
    description: `Six-view photography, measurements, and collection data for exact ${name} skull specimen ${specimenId}.`,
    alternates: {
      canonical: `/species/${taxonSlug}/specimens/${specimenId}`,
    },
  };
}

export default async function SpecimenPage({ params }: SpecimenPageProps) {
  const { taxonSlug, specimenId } = await params;
  const exhibit = getExhibit(taxonSlug, specimenId);
  if (!exhibit) notFound();
  return <ExhibitPage exhibit={exhibit} exactSpecimen />;
}
