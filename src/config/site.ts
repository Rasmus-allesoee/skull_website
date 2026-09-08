export function resolveSiteUrl(
  environment: Readonly<Record<string, string | undefined>>,
): string {
  const explicitUrl = environment.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitUrl) return explicitUrl.replace(/\/$/, "");

  const vercelHost =
    environment.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    environment.VERCEL_URL?.trim();
  return vercelHost ? `https://${vercelHost}` : "http://localhost:3000";
}

export const siteConfig = {
  description:
    "A visual-first online natural-history museum for animal skulls, their measurements, provenance, and preparation.",
  url: resolveSiteUrl(process.env),
  name: "Skull Collection",
  shortDescription: "A visual archive of animal skulls.",
  featuredTaxonId: "TAX-0001",
  defaultOgImage: "/media/specimens/SPEC-0001/SPEC-0001__lateral.webp",
  contactEmail: "rasmus.allesoee@gmail.com",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Species", href: "/species" },
    { label: "Map", href: "/map" },
    { label: "Measurements", href: "/methodology" },
    { label: "Preparation guide", href: "/guides/skull-preparation" },
  ],
  copyright: "© 2026 Rasmus. All rights reserved.",
} as const;

export type SiteConfig = typeof siteConfig;
