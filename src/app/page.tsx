import Link from "next/link";

import { siteConfig } from "@/config/site";

const foundations = [
  {
    label: "Photography",
    text: "Consistent multi-angle skull images will lead each exhibit.",
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
        <span className="phase-label">Foundation · Phase 0/1</span>
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
          <p className="phase-note">
            The repository foundation is established. Catalog exhibits begin
            with the next approved vertical slice.
          </p>
        </section>

        <section className="foundation" aria-labelledby="foundation-title">
          <div className="section-heading">
            <p className="eyebrow">Collection principles</p>
            <h2 id="foundation-title">Built as an exhibit and a reference.</h2>
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

      <footer className="site-footer">
        <p>{siteConfig.name}</p>
        <p>Working foundation · No collection records published yet</p>
      </footer>
    </div>
  );
}
