import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Skull preparation guide",
  description:
    "Planned preparation guide for defleshing, degreasing, and whitening animal skulls.",
};

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
    <div className="site-shell guide-page-shell">
      <header className="site-header" aria-label="Site header">
        <Link className="wordmark" href="/">
          {siteConfig.name}
        </Link>
        <span className="phase-label">Supporting guide · Draft shell</span>
      </header>

      <main id="main-content" className="guide-page">
        <nav aria-label="Breadcrumb">
          <Link href="/species/raccoon-dog">Raccoon dog display</Link>
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
            Status: route and outline only. This is not yet a procedural or
            safety guide.
          </p>
        </section>

        <Link className="text-link" href="/species/raccoon-dog">
          ← Back to the raccoon dog display
        </Link>
      </main>

      <SiteFooter context="Skull preparation guide · Draft shell" />
    </div>
  );
}
