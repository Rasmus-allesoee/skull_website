import { parse } from "csv-parse/sync";
import type { ZodType } from "zod";

import type { Diagnostic } from "./types";
import { ValidationError } from "./types";

export interface ParsedRow<T> {
  data: T;
  row: number;
  source: string;
}

export function parseStrictCsv<T>(options: {
  text: string;
  source: string;
  headers: readonly string[];
  schema: ZodType<T>;
}): ParsedRow<T>[] {
  const { text, source, headers, schema } = options;
  const diagnostics: Diagnostic[] = [];

  if (text.includes("\r")) {
    diagnostics.push({
      source,
      rule: "CSV must use LF line endings",
      suggestion: "Export or normalize the file with LF line endings.",
    });
  }

  let records: string[][];
  try {
    records = parse(text, {
      bom: true,
      relax_column_count: false,
      skip_empty_lines: true,
    }) as string[][];
  } catch (error) {
    throw new ValidationError("CSV parsing failed", [
      {
        source,
        rule: error instanceof Error ? error.message : "Malformed CSV",
        suggestion: "Correct the quoted fields and column count, then retry.",
      },
    ]);
  }

  const actualHeaders = records[0] ?? [];
  const duplicateHeaders = actualHeaders.filter(
    (header, index) => actualHeaders.indexOf(header) !== index,
  );
  if (duplicateHeaders.length > 0) {
    diagnostics.push({
      source,
      field: "header",
      value: [...new Set(duplicateHeaders)],
      rule: "CSV headers must be unique",
      suggestion: "Remove or rename the duplicate header.",
    });
  }

  if (
    actualHeaders.length !== headers.length ||
    actualHeaders.some((header, index) => header !== headers[index])
  ) {
    diagnostics.push({
      source,
      field: "header",
      value: actualHeaders,
      rule: "CSV headers do not match the canonical ordered contract",
      suggestion: `Use exactly: ${headers.join(",")}`,
    });
  }

  if (diagnostics.length > 0) {
    throw new ValidationError("CSV header validation failed", diagnostics);
  }

  const parsedRows: ParsedRow<T>[] = [];
  for (const [index, record] of records.slice(1).entries()) {
    const row = index + 2;
    const raw = Object.fromEntries(
      headers.map((header, columnIndex) => [
        header,
        (record[columnIndex] ?? "").trim(),
      ]),
    );
    const result = schema.safeParse(raw);

    if (!result.success) {
      for (const issue of result.error.issues) {
        diagnostics.push({
          source,
          row,
          field: issue.path.join(".") || undefined,
          value:
            issue.path.length === 1 ? raw[String(issue.path[0])] : undefined,
          rule: issue.message,
          suggestion:
            "Use a documented field name and controlled value from docs/content_data_model.md.",
        });
      }
      continue;
    }

    parsedRows.push({ data: result.data, row, source });
  }

  if (diagnostics.length > 0) {
    throw new ValidationError("CSV row validation failed", diagnostics);
  }

  return parsedRows;
}
