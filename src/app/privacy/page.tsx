import Link from "next/link";

import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site";

export const metadata = createPageMetadata({
  title: "Privacy and analytics",
  description:
    "How Skull Collection uses production-only Vercel Web Analytics and handles visitor information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <MuseumShell
      activePath=""
      footerContext="Privacy and analytics"
      mainClassName="guide-page privacy-page"
    >
      <nav aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-current="page">Privacy and analytics</li>
        </ol>
      </nav>

      <div className="guide-page-intro">
        <p className="eyebrow">A short public notice</p>
        <h1>Privacy and analytics.</h1>
        <p>
          Skull Collection is a read-only natural-history archive. This page
          explains the limited visitor information used to understand which
          public pages are useful and to keep the site reliable.
        </p>
      </div>

      <section aria-labelledby="analytics-heading">
        <h2 id="analytics-heading">Production-only analytics</h2>
        <div>
          <p>
            The live Vercel production deployment uses Vercel Web Analytics to
            collect aggregated page-view information. Local development and
            Preview deployments do not send analytics data.
          </p>
          <p>
            The integration does not use third-party cookies, advertising
            profiles, accounts, forms, uploads, or custom event tracking. We do
            not intentionally send names, email addresses, free-form search
            text, or private collection notes as analytics fields.
          </p>
          <p>
            Page-view URLs are recorded without query parameters or fragments,
            so catalog searches, map selections, and other URL-backed controls
            are not included in the analytics URL.
          </p>
        </div>
      </section>

      <section aria-labelledby="data-heading">
        <h2 id="data-heading">Information involved</h2>
        <div>
          <p>
            Vercel Web Analytics may process an anonymous page-view event with
            information such as the visited public path, timestamp, referrer,
            broad location, device type, operating system, and browser. The
            service is configured here for aggregated traffic insight rather
            than individual profiling.
          </p>
          <p>
            Read Vercel&apos;s current explanations of its Web Analytics privacy
            model in the{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              rel="noreferrer"
              target="_blank"
            >
              Vercel Web Analytics privacy documentation
            </a>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Questions or corrections</h2>
        <div>
          <p>
            For questions about this notice, the collection, or a rights
            concern, contact{" "}
            <a href={"mailto:" + siteConfig.contactEmail}>
              {siteConfig.contactEmail}
            </a>
            .
          </p>
          <p className="guide-status-note">
            This notice describes the current v1.0.1 implementation. It will be
            revised if the site adds forms, accounts, custom events,
            advertising, or another data service.
          </p>
        </div>
      </section>
    </MuseumShell>
  );
}
