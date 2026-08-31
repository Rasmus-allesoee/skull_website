import Link from "next/link";

import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getMeasurementReference } from "@/data/measurements";
import { MeasurementReferenceBoard } from "@/features/methodology/MeasurementReferenceBoard";

export const metadata = createPageMetadata({
  title: "Measurements",
  description:
    "Explore 21 skull measurement definitions through five registered anatomical reference diagrams and exact landmark notes.",
  path: "/methodology",
  image: "/media/methodology/lateral-skull.webp",
});

export default function MethodologyPage() {
  const reference = getMeasurementReference();
  return (
    <MuseumShell
      activePath="/methodology"
      footerContext="Measurements · Illustrated collection reference"
      mainClassName="methodology-page"
    >
      <nav className="methodology-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>Methodology</li>
          <li aria-current="page">Measurements</li>
        </ol>
      </nav>

      <MeasurementReferenceBoard reference={reference} />
    </MuseumShell>
  );
}
