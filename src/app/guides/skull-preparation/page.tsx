import Link from "next/link";
import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getPreparationGuide } from "@/data/preparation";
import { PreparationGuide } from "@/features/preparation/PreparationGuide";
import "./preparation.css";
export const metadata = createPageMetadata({
  title: "Skull preparation guide",
  description:
    "A detailed illustrated guide to defleshing, maceration, beetles, degreasing, peroxide whitening, teeth and jaw assembly, with method comparisons and references.",
  path: "/guides/skull-preparation",
});
export default function SkullPreparationGuidePage() {
  const guide = getPreparationGuide();
  return (
    <MuseumShell
      activePath="/guides/skull-preparation"
      footerContext="Skull preparation guide"
      mainClassName="prep-page"
    >
      <nav className="prep-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Skull preparation</span>
      </nav>
      <header className="prep-intro">
        <p className="eyebrow">Methods & practice</p>
        <h1>{guide.metadata.title}</h1>
        <p>{guide.metadata.summary}</p>
      </header>
      <PreparationGuide guide={guide} />
    </MuseumShell>
  );
}
