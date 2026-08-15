import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { networkInterfaces } from "node:os";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const localDevelopmentOrigins = new Set(["127.0.0.1", "0.0.0.0"]);
for (const addresses of Object.values(networkInterfaces())) {
  for (const address of addresses ?? []) {
    if (address.family === "IPv4" && !address.internal) {
      localDevelopmentOrigins.add(address.address);
    }
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [...localDevelopmentOrigins],
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
