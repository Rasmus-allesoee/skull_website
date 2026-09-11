import { getMeasuredValue } from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";

export interface ComparisonStartingPoint {
  id: string;
  label: string;
  subjectIds: string[];
}

export function getComparisonStartingPoints(
  records: SkullComparisonRecord[],
): ComparisonStartingPoint[] {
  const physical = records
    .filter((record) => record.kind === "specimen")
    .toSorted(compareById);
  const defaultSpecimen = physical.find(
    (record) => record.id === "specimen:SPEC-0001",
  );
  const human = records.find(
    (record) => record.id === "reference:adult-human-skull",
  );
  const byLength = physical
    .filter(
      (record) => getMeasuredValue(record.measurements.skullLength) !== null,
    )
    .toSorted(
      (first, second) =>
        getMeasuredValue(first.measurements.skullLength)! -
          getMeasuredValue(second.measurements.skullLength)! ||
        compareById(first, second),
    );
  const sameTaxon = firstGroup(physical, (record) => record.taxonId, 2, 2);
  const sameGenus = firstGroup(physical, (record) => record.genusSlug, 2, 5);
  const candidates: Array<ComparisonStartingPoint | null> = [
    defaultSpecimen && human
      ? {
          id: "raccoon-human",
          label: "Raccoon dog + adult human",
          subjectIds: [defaultSpecimen.id, human.id],
        }
      : null,
    byLength.length >= 2
      ? {
          id: "smallest-largest",
          label: "Smallest + largest recorded length",
          subjectIds: [byLength[0]!.id, byLength.at(-1)!.id],
        }
      : null,
    sameTaxon
      ? {
          id: "same-taxon",
          label: "Two specimens from one taxon",
          subjectIds: sameTaxon.map(({ id }) => id),
        }
      : null,
    sameGenus
      ? {
          id: "same-genus",
          label: `${sameGenus.length} specimens from one genus`,
          subjectIds: sameGenus.map(({ id }) => id),
        }
      : null,
  ];
  const seen = new Set<string>();
  return candidates.filter(
    (candidate): candidate is ComparisonStartingPoint => {
      if (!candidate) return false;
      const key = subjectIdsToKey(candidate.subjectIds);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    },
  );
}

export function getContextualComparisonSuggestions(
  records: SkullComparisonRecord[],
  selectedIds: string[],
) {
  const selected = new Set(selectedIds);
  const anchor = records.find((record) => record.id === selectedIds[0]);
  if (!anchor) return [];
  const candidates: SkullComparisonRecord[] = [];
  const add = (record: SkullComparisonRecord | undefined) => {
    if (
      record &&
      !selected.has(record.id) &&
      !candidates.some((candidate) => candidate.id === record.id)
    ) {
      candidates.push(record);
    }
  };

  records
    .filter(
      (record) =>
        record.kind === "specimen" && record.taxonId === anchor.taxonId,
    )
    .toSorted(compareById)
    .forEach(add);
  records
    .filter(
      (record) =>
        record.kind === "specimen" && record.genusSlug === anchor.genusSlug,
    )
    .toSorted(compareById)
    .forEach(add);

  const anchorLength = getMeasuredValue(anchor.measurements.skullLength);
  if (anchorLength !== null) {
    add(
      records
        .filter(
          (record) =>
            record.kind === "specimen" &&
            !selected.has(record.id) &&
            getMeasuredValue(record.measurements.skullLength) !== null,
        )
        .toSorted((first, second) => {
          const firstDistance = Math.abs(
            getMeasuredValue(first.measurements.skullLength)! - anchorLength,
          );
          const secondDistance = Math.abs(
            getMeasuredValue(second.measurements.skullLength)! - anchorLength,
          );
          return firstDistance - secondDistance || compareById(first, second);
        })[0],
    );
  }
  const physicalByLength = records
    .filter(
      (record) =>
        record.kind === "specimen" &&
        getMeasuredValue(record.measurements.skullLength) !== null,
    )
    .toSorted(
      (first, second) =>
        getMeasuredValue(first.measurements.skullLength)! -
          getMeasuredValue(second.measurements.skullLength)! ||
        compareById(first, second),
    );
  add(physicalByLength[0]);
  add(physicalByLength.at(-1));
  add(records.find((record) => record.id === "reference:adult-human-skull"));
  return candidates.slice(0, 5);
}

function firstGroup(
  records: SkullComparisonRecord[],
  keyFor: (record: SkullComparisonRecord) => string | null,
  minimum: number,
  maximum: number,
) {
  const groups = new Map<string, SkullComparisonRecord[]>();
  for (const record of records) {
    const key = keyFor(record);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  const group = [...groups.entries()]
    .filter(([, group]) => group.length >= minimum)
    .toSorted(([first], [second]) => first.localeCompare(second, "en"))[0]?.[1];
  return group?.slice(0, maximum);
}

function compareById(
  first: SkullComparisonRecord,
  second: SkullComparisonRecord,
) {
  return first.id.localeCompare(second.id, "en", { numeric: true });
}

function subjectIdsToKey(ids: string[]) {
  return ids.join("|");
}
