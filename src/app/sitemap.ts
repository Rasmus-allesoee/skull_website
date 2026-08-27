import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPublicRoutePaths } from "@/data/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublicRoutePaths().map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: path === "/" || path === "/species" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/species" ? 0.9 : 0.7,
  }));
}
