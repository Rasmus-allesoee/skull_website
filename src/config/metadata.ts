import type { Metadata } from "next";

import { siteConfig } from "./site";

export function createPageMetadata({
  title,
  description,
  path,
  image = siteConfig.defaultOgImage,
}: {
  title?: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const resolvedTitle = title ?? siteConfig.name;
  return {
    title: title ?? { absolute: siteConfig.name },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: resolvedTitle,
      description,
      url: path,
      images: [{ url: image, alt: `${resolvedTitle} — ${siteConfig.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [image],
    },
  };
}
