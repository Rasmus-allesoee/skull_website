export const siteConfig = {
  description:
    "A visual-first online natural-history museum for animal skulls, their measurements, provenance, and preparation.",
  name: "Skull Collection",
  shortDescription: "A visual archive of animal skulls.",
} as const;

export type SiteConfig = typeof siteConfig;
