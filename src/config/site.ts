export const siteConfig = {
  description:
    "A visual-first online natural-history museum for animal skulls, their measurements, provenance, and preparation.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  name: "Skull Collection",
  shortDescription: "A visual archive of animal skulls.",
  featuredTaxonId: "TAX-0001",
  defaultOgImage: "/media/specimens/SPEC-0001/SPEC-0001__lateral.webp",
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
