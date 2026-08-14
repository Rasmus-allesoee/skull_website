export const siteConfig = {
  description:
    "A visual-first online natural-history museum for animal skulls, their measurements, provenance, and preparation.",
  name: "Skull Collection",
  shortDescription: "A visual archive of animal skulls.",
  copyright: "© 2026 Rasmus. All rights reserved.",
} as const;

export type SiteConfig = typeof siteConfig;
