"use client";

import { Analytics } from "@vercel/analytics/next";

import { redactAnalyticsUrl } from "@/config/analytics";

export function ProductionAnalytics() {
  return <Analytics mode="production" beforeSend={redactAnalyticsUrl} />;
}
