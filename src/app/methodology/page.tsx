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

      <header className="methodology-intro">
        <p className="eyebrow">Reference data</p>
        <h1>Measurements</h1>
        <p>
          These numbered diagrams define the collection’s current measurement
          vocabulary. Select any number to see the matching anatomical landmarks
          and method note.
        </p>
      </header>

      <MeasurementReferenceBoard reference={reference} />
    </MuseumShell>
  );
}
