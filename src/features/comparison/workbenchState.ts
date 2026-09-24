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
  "custom",
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

export function getComparisonLayerCount(state: ComparisonWorkbenchState) {
  return state.subjects.reduce(
    (total, subject) => total + subject.views.length,
    0,
  );
}

export function addComparisonSubject(
  state: ComparisonWorkbenchState,
  id: string,
  initialView: ComparisonView,
): ComparisonWorkbenchState {
  if (
    state.subjects.some((subject) => subject.id === id) ||
    state.subjects.length >= maximumComparisonSubjects ||
    getComparisonLayerCount(state) >= maximumComparisonLayers
  ) {
    return state;
  }
  const subjects = [...state.subjects, { id, views: [initialView] }];
  return {
    ...state,
    subjects,
    difference:
      state.difference ??
      (subjects.length >= 2 ? [subjects[0]!.id, subjects[1]!.id] : null),
  };
}

export function removeComparisonSubject(
  state: ComparisonWorkbenchState,
  id: string,
): ComparisonWorkbenchState {
  const subjects = state.subjects.filter((subject) => subject.id !== id);
  if (subjects.length === state.subjects.length) return state;
  return {
    ...state,
    subjects,
    difference: getValidDifferencePair(subjects, state.difference),
  };
}

export function reorderComparisonSubjects(
  state: ComparisonWorkbenchState,
  sourceId: string,
  targetId: string,
): ComparisonWorkbenchState {
  if (sourceId === targetId) return state;
  const sourceIndex = state.subjects.findIndex(({ id }) => id === sourceId);
  const targetIndex = state.subjects.findIndex(({ id }) => id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return state;
  const differenceIndexes = state.difference?.map((id) =>
    state.subjects.findIndex((subject) => subject.id === id),
  );
  const subjects = [...state.subjects];
  const source = subjects.splice(sourceIndex, 1)[0];
  if (!source) return state;
  subjects.splice(Math.min(targetIndex, subjects.length), 0, source);
  // The Difference control names Skull slots, so keep those positions while
  // replacing the record IDs that now occupy them.
  const difference =
    differenceIndexes?.length === 2 &&
    differenceIndexes.every((index) => index >= 0 && index < subjects.length)
      ? ([
          subjects[differenceIndexes[0]!]!.id,
          subjects[differenceIndexes[1]!]!.id,
        ] as [string, string])
      : state.difference;
  return { ...state, subjects, difference };
}

export function addComparisonView(
  state: ComparisonWorkbenchState,
  id: string,
  view: ComparisonView,
): ComparisonWorkbenchState {
  if (getComparisonLayerCount(state) >= maximumComparisonLayers) return state;
  let changed = false;
  const subjects = state.subjects.map((subject) => {
    if (subject.id !== id || subject.views.includes(view)) return subject;
    changed = true;
    return { ...subject, views: [...subject.views, view] };
  });
  return changed ? { ...state, subjects } : state;
}

export function removeComparisonView(
  state: ComparisonWorkbenchState,
  id: string,
  view: ComparisonView,
): ComparisonWorkbenchState {
  const subject = state.subjects.find((candidate) => candidate.id === id);
  if (!subject || !subject.views.includes(view)) return state;
  if (subject.views.length === 1) return removeComparisonSubject(state, id);
  return {
    ...state,
    subjects: state.subjects.map((candidate) =>
      candidate.id === id
        ? {
            ...candidate,
            views: candidate.views.filter(
              (candidateView) => candidateView !== view,
            ),
          }
        : candidate,
    ),
  };
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
  const requestedVersion = params.get("v");
  if (
    requestedVersion !== null &&
    requestedVersion !== String(comparisonStateVersion)
  ) {
    warnings.push(
      `Unknown comparison-link version ${requestedVersion}; valid settings were restored with the current version.`,
    );
  }
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

function getValidDifferencePair(
  subjects: ComparisonSubjectState[],
  current: [string, string] | null,
): [string, string] | null {
  const ids = new Set(subjects.map(({ id }) => id));
  if (current?.every((id) => ids.has(id))) return current;
  return subjects.length >= 2 ? [subjects[0]!.id, subjects[1]!.id] : null;
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
