import Link from "next/link";

import { MuseumShell } from "@/components/MuseumShell";

export default function NotFound() {
  return (
    <MuseumShell activePath="" footerContext="Page not found">
      <section className="not-found-page" aria-labelledby="not-found-title">
        <p className="eyebrow">404 · Record not found</p>
        <h1 id="not-found-title">
          This path does not match a published record.
        </h1>
        <p>
          The link may be incomplete, or the requested taxon or specimen may not
          be published.
        </p>
        <div className="hero-actions">
          <Link className="primary-link" href="/species">
            Browse species
          </Link>
          <Link className="text-link" href="/">
            Return home
          </Link>
        </div>
      </section>
    </MuseumShell>
  );
}
