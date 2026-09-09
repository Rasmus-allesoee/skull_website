import type { BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Analytics is intentionally limited to the public Vercel production
 * deployment. Local and Preview builds must not send visitor data or test
 * traffic to the project dashboard.
 */
export function isProductionAnalyticsDeployment(
  environment: Readonly<Record<string, string | undefined>>,
): boolean {
  return environment.VERCEL === "1" && environment.VERCEL_ENV === "production";
}

/**
 * Catalog and map state live in query parameters. Keep those values out of
 * page-view URLs because some parameters contain free-form visitor input.
 */
export function redactAnalyticsUrl(event: BeforeSendEvent): BeforeSendEvent {
  try {
    const url = new URL(event.url);
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return { ...event, url: event.url.split(/[?#]/, 1)[0] ?? event.url };
  }
}
