import Link from "next/link";

import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";

export const metadata = createPageMetadata({
  title: "Skull preparation guide",
  description:
    "Planned preparation guide for defleshing, degreasing, and whitening animal skulls.",
  path: "/guides/skull-preparation",
});

const plannedSections = [
  {
    title: "Defleshing",
    description:
      "Maceration, dermestid beetles, and controlled heat methods, including method selection and specimen risks.",
  },
  {
    title: "Degreasing",
    description:
      "Dish soap, ammonia, and acetone approaches, with material compatibility and safety boundaries.",
  },
  {
    title: "Whitening",
    description:
      "Hydrogen peroxide treatment, concentration records, exposure time, rinsing, and final inspection.",
  },
] as const;

export default function SkullPreparationGuidePage() {
  return (
    <MuseumShell
      activePath="/guides/skull-preparation"
      footerContext="Skull preparation guide · Reviewed outline only"
      mainClassName="guide-page"
    >
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Skull preparation</span>
      </nav>

      <header className="guide-page-intro">
        <p className="eyebrow">Preparation guide</p>
        <h1>Skull preparation</h1>
        <p>
          This page reserves the permanent route and structure for the full
          guide. Detailed procedures are not published until the practical
          instructions, chemical safety guidance, and citations have been
          reviewed together.
        </p>
      </header>

      <section aria-labelledby="guide-outline-title">
        <h2 id="guide-outline-title">Planned guide structure</h2>
        <ol className="guide-outline">
          {plannedSections.map((section, index) => (
            <li key={section.title}>
              <span className="index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="guide-status-note">
          Status: route and outline only. This is not yet a procedural or safety
          guide.
        </p>
      </section>

      <Link className="text-link" href="/species">
        ← Back to the species catalog
      </Link>
    </MuseumShell>
  );
}
