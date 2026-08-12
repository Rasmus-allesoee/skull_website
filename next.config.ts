import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    formats: ["image/avif", "image/webp"],
    imageSizes: [64, 96, 128, 256, 384],
    qualities: [55, 70, 80, 90, 100],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
