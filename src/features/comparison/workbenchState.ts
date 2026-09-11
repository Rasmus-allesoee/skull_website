import type {
  ComparisonView,
  SkullComparisonRecord,
} from "@/domain/comparison/types";

export const comparisonStateVersion = 1;
export const maximumComparisonSubjects = 5;
export const maximumComparisonLayers = 10;

export const arrangementValues = [
  "by-specimen",
  "by-view",
  "side-by-side",
  "overlay-pair",
  "vertical-stack",
] as const;

export type ComparisonArrangement = (typeof arrangementValues)[number];

export interface ComparisonSubjectState {
  id: string;
  views: ComparisonView[];
}

export interface ComparisonWorkbenchState {
  subjects: ComparisonSubjectState[];
  difference: [string, string] | null;
  arrangement: ComparisonArrangement;
  comparableOnly: boolean;
}

export interface ParsedComparisonState {
  state: ComparisonWorkbenchState;
  warnings: string[];
}

export function getDefaultComparisonState(
  records: SkullComparisonRecord[],
): ComparisonWorkbenchState {
  const raccoonDog = records.find(
    (record) => record.id === "specimen:SPEC-0001",
  );
  const human = records.find(
    (record) => record.id === "reference:adult-human-skull",
  );
  const defaults = [raccoonDog, human].filter(
    (record): record is SkullComparisonRecord => Boolean(record),
  );
  const subjects = defaults.map((record) => ({
    id: record.id,
    views: ["lateral" as const],
  }));
  return {
    subjects,
    difference:
      subjects.length >= 2 ? [subjects[0]!.id, subjects[1]!.id] : null,
    arrangement: "by-specimen",
    comparableOnly: false,
  };
}

export function parseComparisonState(
  search: string,
  records: SkullComparisonRecord[],
): ParsedComparisonState {
  const params = new URLSearchParams(search);
  const hasComparisonState = [
    "subjects",
    "views",
    "difference",
    "arrange",
    "comparable",
  ].some((key) => params.has(key));
  if (!hasComparisonState) {
    return { state: getDefaultComparisonState(records), warnings: [] };
  }

  const warnings: string[] = [];
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const requestedIds = splitList(params.get("subjects"));
  const subjectIds: string[] = [];
  for (const id of requestedIds) {
    if (!recordsById.has(id)) {
      warnings.push(`Unknown or unavailable subject discarded: ${id}`);
    } else if (subjectIds.includes(id)) {
      warnings.push(`Duplicate subject discarded: ${id}`);
    } else if (subjectIds.length >= maximumComparisonSubjects) {
      warnings.push(`${maximumComparisonSubjects}-subject limit applied.`);
    } else {
      subjectIds.push(id);
    }
  }

  const requestedViews = parseViewParameter(params.get("views"));
  let layerCount = 0;
  const subjects = subjectIds.flatMap((id, subjectIndex) => {
    const record = recordsById.get(id)!;
    const remainingSubjects = subjectIds.length - subjectIndex - 1;
    const available = new Set(record.views.map((view) => view.view));
    const requested = requestedViews.get(id) ?? ["lateral"];
    const views: ComparisonView[] = [];
    for (const view of requested) {
      if (!available.has(view)) {
        warnings.push(`${id} ${view} view is unavailable and was discarded.`);
      } else if (views.includes(view)) {
        warnings.push(`Duplicate ${id} ${view} view discarded.`);
      } else if (layerCount >= maximumComparisonLayers - remainingSubjects) {
        warnings.push(`${maximumComparisonLayers}-view field limit applied.`);
      } else {
        views.push(view);
        layerCount += 1;
      }
    }
    if (views.length === 0 && available.has("lateral")) {
      if (layerCount >= maximumComparisonLayers) return [];
      views.push("lateral");
      layerCount += 1;
      warnings.push(`${id} was restored with its lateral view.`);
    }
    return views.length > 0 ? [{ id, views }] : [];
  });

  const selectedIds = new Set(subjects.map((subject) => subject.id));
  const requestedDifference = splitList(params.get("difference"));
  let difference: [string, string] | null = null;
  if (
    requestedDifference.length >= 2 &&
    requestedDifference[0] !== requestedDifference[1] &&
    selectedIds.has(requestedDifference[0]!) &&
    selectedIds.has(requestedDifference[1]!)
  ) {
    difference = [requestedDifference[0]!, requestedDifference[1]!];
  } else if (subjects.length >= 2) {
    difference = [subjects[0]!.id, subjects[1]!.id];
    if (params.has("difference")) {
      warnings.push("Difference pair was restored to the first two skulls.");
    }
  }

  const requestedArrangement = params.get("arrange");
  const arrangement = arrangementValues.includes(
    requestedArrangement as ComparisonArrangement,
  )
    ? (requestedArrangement as ComparisonArrangement)
    : "by-specimen";
  if (requestedArrangement && requestedArrangement !== arrangement) {
    warnings.push("Unknown arrangement was replaced with By specimen.");
  }

  return {
    state: {
      subjects,
      difference,
      arrangement,
      comparableOnly: params.get("comparable") === "1",
    },
    warnings,
  };
}

export function serializeComparisonState(
  state: ComparisonWorkbenchState,
): string {
  const params = new URLSearchParams();
  params.set("v", String(comparisonStateVersion));
  params.set("subjects", state.subjects.map((subject) => subject.id).join(","));
  params.set(
    "views",
    state.subjects
      .map((subject) => `${subject.id}@${subject.views.join("+")}`)
      .join(";"),
  );
  if (state.difference) params.set("difference", state.difference.join(","));
  params.set("arrange", state.arrangement);
  if (state.comparableOnly) params.set("comparable", "1");
  return params.toString();
}

function splitList(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function parseViewParameter(value: string | null) {
  const result = new Map<string, ComparisonView[]>();
  if (!value) return result;
  for (const entry of value.split(";")) {
    const separator = entry.lastIndexOf("@");
    if (separator <= 0) continue;
    const id = entry.slice(0, separator);
    const views = entry
      .slice(separator + 1)
      .split("+")
      .filter(isComparisonView);
    result.set(id, views);
  }
  return result;
}

function isComparisonView(value: string): value is ComparisonView {
  return [
    "lateral",
    "frontal",
    "dorsal",
    "ventral",
    "mandible-dorsal",
  ].includes(value);
}
