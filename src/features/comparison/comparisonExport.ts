import type { SkullComparisonRecord } from "@/domain/comparison/types";
import { comparisonMeasurementKeys } from "@/domain/content/types";

type ExportFormat = "long" | "wide";

function csvCell(value: string | number): string {
  const text = String(value);
  // Spreadsheet programs can execute a leading formula in a downloaded CSV.
  const safe =
    /^[\s\t\r\n]*[=+@-]/.test(text) && typeof value === "string"
      ? `'${text}`
      : text;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

function csvLine(values: (string | number)[]): string {
  return values.map(csvCell).join(",");
}

function sourceName(key: string, unit: string): string {
  return `${key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()}_${unit}`;
}

function identity(record: SkullComparisonRecord, index: number): string[] {
  return [
    String(index + 1),
    record.id,
    record.kind,
    record.label,
    record.scientificName ?? "",
  ];
}

/** Export source values only; UI comparison mappings and calculated differences stay out. */
export function serializeComparisonMeasurements(
  subjects: SkullComparisonRecord[],
  format: ExportFormat,
): string {
  const available = comparisonMeasurementKeys.filter((key) =>
    subjects.some((record) => record.measurements[key].value !== null),
  );
  const identityHeader = [
    "skull_slot",
    "subject_id",
    "subject_type",
    "name",
    "scientific_name",
  ];
  const rows: (string | number)[][] = [];

  if (format === "long") {
    rows.push([...identityHeader, "measurement", "value", "unit", "status"]);
    subjects.forEach((record, index) => {
      for (const key of available) {
        const measurement = record.measurements[key];
        if (measurement.value === null) continue;
        rows.push([
          ...identity(record, index),
          sourceName(key, measurement.unit),
          measurement.value,
          measurement.unit,
          measurement.status,
        ]);
      }
    });
  } else {
    rows.push([
      ...identityHeader,
      ...available.flatMap((key) => {
        const name = sourceName(key, subjects[0]!.measurements[key].unit);
        return [name, `${name}_status`];
      }),
    ]);
    subjects.forEach((record, index) => {
      rows.push([
        ...identity(record, index),
        ...available.flatMap<string | number>((key) => {
          const measurement = record.measurements[key];
          return measurement.value === null
            ? ["", ""]
            : [measurement.value, measurement.status];
        }),
      ]);
    });
  }

  return `\uFEFF${rows.map(csvLine).join("\r\n")}\r\n`;
}

export function downloadComparisonCsv(
  subjects: SkullComparisonRecord[],
  format: ExportFormat,
): void {
  const blob = new Blob([serializeComparisonMeasurements(subjects, format)], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `skull-comparison-${format}.csv`);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
