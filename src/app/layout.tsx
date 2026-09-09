import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { ProductionAnalytics } from "@/components/ProductionAnalytics";
import { isProductionAnalyticsDeployment } from "@/config/analytics";
import { siteConfig } from "@/config/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.defaultOgImage,
        alt: `${siteConfig.name} featured animal skull`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.defaultOgImage],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0B0D0C",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    creator: {
      "@type": "Person",
      name: "Rasmus",
      email: `mailto:${siteConfig.contactEmail}`,
    },
  }).replaceAll("<", "\\u003c");

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        {children}
        {isProductionAnalyticsDeployment(process.env) ? (
          <ProductionAnalytics />
        ) : null}
      </body>
    </html>
  );
}
