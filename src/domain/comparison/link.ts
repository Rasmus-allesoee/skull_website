import type { ComparisonView } from "./types";

export function buildComparisonHref(
  subjects: Array<{ id: string; views?: ComparisonView[] }>,
  difference?: [string, string] | null,
) {
  const params = new URLSearchParams();
  params.set("v", "1");
  params.set("subjects", subjects.map(({ id }) => id).join(","));
  params.set(
    "views",
    subjects
      .map(({ id, views = ["lateral"] }) => `${id}@${views.join("+")}`)
      .join(";"),
  );
  if (difference) params.set("difference", difference.join(","));
  params.set("arrange", "by-specimen");
  return `/compare?${params.toString()}`;
}
