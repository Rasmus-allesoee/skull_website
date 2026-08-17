import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/config/site";

const foundations = [
  {
    label: "Photography",
    text: "Consistent multi-angle skull images will lead each species display.",
  },
  {
    label: "Taxonomy",
    text: "Species-first browsing will connect every physical specimen to a stable identity.",
  },
  {
    label: "Provenance",
    text: "Measurements, preparation, locations, rights, and citations will remain explicit.",
  },
] as const;

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header" aria-label="Site header">
        <Link className="wordmark" href="/" aria-current="page">
          {siteConfig.name}
        </Link>
        <span className="phase-label">Phase 2 · Vertical slice</span>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-light" aria-hidden="true" />
          <div className="catalog-mark" aria-hidden="true">
            SC
          </div>
          <p className="eyebrow">Online natural-history museum</p>
          <h1 id="hero-title">{siteConfig.shortDescription}</h1>
          <p className="hero-copy">
            A carefully structured collection is taking shape around real
            specimens, high-resolution photography, and transparent scientific
            records.
          </p>
          <div className="home-actions">
            <Link className="primary-link" href="/species/raccoon-dog">
              View the raccoon dog display
            </Link>
            <p className="phase-note">
              One real specimen is ready for visual-direction review. The full
              catalog remains intentionally unbuilt.
            </p>
          </div>
        </section>

        <section className="foundation" aria-labelledby="foundation-title">
          <div className="section-heading">
            <p className="eyebrow">Collection principles</p>
            <h2 id="foundation-title">Built for visual study and reference.</h2>
          </div>

          <ol className="foundation-list">
            {foundations.map((item, index) => (
              <li key={item.label}>
                <span className="index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter context="Phase 2 review · One validated specimen" />
    </div>
  );
}
