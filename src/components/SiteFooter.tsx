import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter({ context }: { context?: string }) {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-title">{siteConfig.name}</p>
        <p>
          {context ??
            "A visual archive built from reviewed collection records."}
        </p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/species">Browse species</Link>
        <Link href="/methodology">Measurements</Link>
        <Link href="/guides/skull-preparation">Preparation guide</Link>
      </nav>
      <p className="footer-rights">{siteConfig.copyright}</p>
    </footer>
  );
}
