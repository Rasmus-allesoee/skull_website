import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { networkInterfaces } from "node:os";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const developmentScriptSources =
  process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : [];
const commonSecurityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "browsing-topics=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  },
];
const defaultContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "frame-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  ["script-src 'self' 'unsafe-inline'", ...developmentScriptSources].join(" "),
  "worker-src 'none'",
  "connect-src 'self'",
].join("; ");
const mapContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "frame-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://tiles.openfreemap.org",
  "style-src 'self' 'unsafe-inline'",
  ["script-src 'self' 'unsafe-inline'", ...developmentScriptSources].join(" "),
  "worker-src 'self' blob:",
  "connect-src 'self' https://tiles.openfreemap.org",
].join("; ");
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
  async headers() {
    return [
      {
        source: "/map/:path*",
        headers: [
          ...commonSecurityHeaders,
          { key: "Content-Security-Policy", value: mapContentSecurityPolicy },
        ],
      },
      {
        // MapLibre v6 loads its module worker as a same-origin public asset.
        // The worker fetches the OpenFreeMap vector tiles itself, so it needs
        // the same route-scoped CSP allowance as the /map document.
        source: "/maplibre/:path*",
        headers: [
          ...commonSecurityHeaders,
          { key: "Content-Security-Policy", value: mapContentSecurityPolicy },
        ],
      },
      {
        source: "/((?!map(?:/|$)|maplibre(?:/|$)).*)",
        headers: [
          ...commonSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: defaultContentSecurityPolicy,
          },
        ],
      },
    ];
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
