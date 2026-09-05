import { z } from "zod";

import type { ParsedRow } from "@/domain/content/csv";
import type { Diagnostic } from "@/domain/content/types";
import { ValidationError } from "@/domain/content/types";

import type {
  MeasurementDefinition,
  MeasurementDiagram,
  MeasurementReference,
  MeasurementSegment,
} from "./types";

export const measurementDefinitionHeaders = [
  "Number",
  "Measurement",
  "Exact landmarks / method",
] as const;

export const measurementDefinitionRowSchema = z.strictObject({
  Number: z
    .string()
    .regex(/^\d+$/, "Number must be a positive integer")
    .transform(Number)
    .pipe(z.number().int().min(1).max(21)),
  Measurement: z.string().min(1),
  "Exact landmarks / method": z.string().min(1),
});

const coordinate = z.number().int().nonnegative();
const segmentSchema = z.tuple([coordinate, coordinate, coordinate, coordinate]);
const pointSchema = z.tuple([coordinate, coordinate]);
const viewportSchema = z.tuple([
  coordinate,
  coordinate,
  z.number().int().positive(),
  z.number().int().positive(),
]);

export const measurementReferenceSourceSchema = z.strictObject({
  schema_version: z.literal(1),
  source_note: z.string().min(1),
  diagrams: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        title: z.string().min(1),
        public_path: z
          .string()
          .regex(/^\/media\/methodology\/[a-z0-9-]+\.webp$/),
        alt: z.string().min(1),
        credit: z.string().min(1),
        rights: z.literal("all_rights_reserved"),
        coordinate_width: z.number().int().positive(),
        coordinate_height: z.number().int().positive(),
        viewport: viewportSchema,
        occurrences: z
          .array(
            z.strictObject({
              number: z.number().int().min(1).max(21),
              line: segmentSchema,
              extensions: z.array(segmentSchema),
              label: pointSchema,
            }),
          )
          .min(1),
      }),
    )
    .length(5),
});

export type MeasurementDefinitionRow = z.infer<
  typeof measurementDefinitionRowSchema
>;
export type MeasurementReferenceSource = z.infer<
  typeof measurementReferenceSourceSchema
>;

export function compileMeasurementReference(options: {
  definitions: ParsedRow<MeasurementDefinitionRow>[];
  source: MeasurementReferenceSource;
}): MeasurementReference {
  const { definitions: rows, source } = options;
  const diagnostics: Diagnostic[] = [];
  const definitionNumbers = rows.map((row) => row.data.Number);
  const duplicateDefinitions = definitionNumbers.filter(
    (number, index) => definitionNumbers.indexOf(number) !== index,
  );
  const expectedNumbers = Array.from({ length: 21 }, (_, index) => index + 1);

  if (
    rows.length !== expectedNumbers.length ||
    expectedNumbers.some((number) => !definitionNumbers.includes(number))
  ) {
    diagnostics.push({
      source: "content/methodology/measurement-definitions.csv",
      field: "Number",
      value: definitionNumbers,
      rule: "Measurement definitions must contain every number from 1 through 21 exactly once",
      suggestion: "Restore the complete reviewed 21-row measurement source.",
    });
  }
  if (duplicateDefinitions.length > 0) {
    diagnostics.push({
      source: "content/methodology/measurement-definitions.csv",
      field: "Number",
      value: [...new Set(duplicateDefinitions)],
      rule: "Measurement numbers must be unique in the definition source",
      suggestion: "Keep one canonical definition for each number.",
    });
  }

  const diagramIds = source.diagrams.map((diagram) => diagram.id);
  const duplicateDiagramIds = diagramIds.filter(
    (id, index) => diagramIds.indexOf(id) !== index,
  );
  if (duplicateDiagramIds.length > 0) {
    diagnostics.push({
      source: "content/methodology/measurement-reference.json",
      field: "diagrams.id",
      value: [...new Set(duplicateDiagramIds)],
      rule: "Diagram IDs must be unique",
      suggestion: "Give each registered source view one stable ID.",
    });
  }

  const occurrenceNumbers: number[] = [];
  for (const diagram of source.diagrams) {
    if (
      diagram.viewport[0] + diagram.viewport[2] > diagram.coordinate_width ||
      diagram.viewport[1] + diagram.viewport[3] > diagram.coordinate_height
    ) {
      diagnostics.push({
        source: "content/methodology/measurement-reference.json",
        key: diagram.id,
        field: "viewport",
        value: diagram.viewport,
        rule: "The presentation viewport must remain inside the registered source canvas",
        suggestion:
          "Adjust only the non-destructive crop window; retain the original image and SVG coordinate system.",
      });
    }
    const localNumbers = diagram.occurrences.map(
      (occurrence) => occurrence.number,
    );
    const localDuplicates = localNumbers.filter(
      (number, index) => localNumbers.indexOf(number) !== index,
    );
    if (localDuplicates.length > 0) {
      diagnostics.push({
        source: "content/methodology/measurement-reference.json",
        key: diagram.id,
        field: "occurrences.number",
        value: [...new Set(localDuplicates)],
        rule: "A measurement may appear only once within a single source view",
        suggestion:
          "Keep repeated numbers in their separate intentional views.",
      });
    }
    for (const occurrence of diagram.occurrences) {
      occurrenceNumbers.push(occurrence.number);
      validateOccurrenceGeometry({ diagram, occurrence, diagnostics });
    }
  }

  for (const number of definitionNumbers) {
    if (!occurrenceNumbers.includes(number)) {
      diagnostics.push({
        source: "content/methodology/measurement-reference.json",
        key: String(number),
        field: "occurrences.number",
        rule: "Every measurement definition requires at least one visual occurrence",
        suggestion: "Register the reviewed SVG geometry for this number.",
      });
    }
  }
  for (const number of occurrenceNumbers) {
    if (!definitionNumbers.includes(number)) {
      diagnostics.push({
        source: "content/methodology/measurement-reference.json",
        key: String(number),
        field: "occurrences.number",
        rule: "Every visual occurrence must resolve to one canonical definition",
        suggestion:
          "Add the reviewed definition or remove the unsupported occurrence.",
      });
    }
  }

  if (diagnostics.length > 0) {
    throw new ValidationError(
      "Measurement reference validation failed",
      diagnostics,
    );
  }

  const definitions: MeasurementDefinition[] = rows
    .map(({ data }) => ({
      number: data.Number,
      name: data.Measurement,
      description: data["Exact landmarks / method"],
    }))
    .sort((first, second) => first.number - second.number);
  const diagrams: MeasurementDiagram[] = source.diagrams.map((diagram) => ({
    id: diagram.id,
    title: diagram.title,
    publicPath: diagram.public_path,
    alt: diagram.alt,
    credit: diagram.credit,
    rights: diagram.rights,
    coordinateWidth: diagram.coordinate_width,
    coordinateHeight: diagram.coordinate_height,
    viewport: diagram.viewport,
    occurrences: diagram.occurrences.map((occurrence) => ({
      number: occurrence.number,
      line: occurrence.line,
      extensions: occurrence.extensions,
      label: occurrence.label,
    })),
  }));

  return {
    schemaVersion: 1,
    sourceNote: source.source_note,
    definitions,
    diagrams,
    occurrenceCount: diagrams.reduce(
      (total, diagram) => total + diagram.occurrences.length,
      0,
    ),
  };
}

function validateOccurrenceGeometry(options: {
  diagram: MeasurementReferenceSource["diagrams"][number];
  occurrence: MeasurementReferenceSource["diagrams"][number]["occurrences"][number];
  diagnostics: Diagnostic[];
}) {
  const { diagram, occurrence, diagnostics } = options;
  const segments = [occurrence.line, ...occurrence.extensions];
  for (const [index, segment] of segments.entries()) {
    if (segment[0] === segment[2] && segment[1] === segment[3]) {
      addGeometryDiagnostic(
        diagram.id,
        occurrence.number,
        index === 0 ? "line" : `extensions.${index - 1}`,
        segment,
        "Measurement segments must have two distinct endpoints",
        diagnostics,
      );
    }
    if (
      !segmentFitsDiagram(
        segment,
        diagram.coordinate_width,
        diagram.coordinate_height,
      )
    ) {
      addGeometryDiagnostic(
        diagram.id,
        occurrence.number,
        index === 0 ? "line" : `extensions.${index - 1}`,
        segment,
        "Segment coordinates must remain inside the registered source canvas",
        diagnostics,
      );
    }
  }
  const [labelX, labelY] = occurrence.label;
  if (labelX > diagram.coordinate_width || labelY > diagram.coordinate_height) {
    addGeometryDiagnostic(
      diagram.id,
      occurrence.number,
      "label",
      occurrence.label,
      "Label coordinates must remain inside the registered source canvas",
      diagnostics,
    );
  }
}

function segmentFitsDiagram(
  segment: MeasurementSegment,
  width: number,
  height: number,
) {
  return (
    segment[0] <= width &&
    segment[2] <= width &&
    segment[1] <= height &&
    segment[3] <= height
  );
}

function addGeometryDiagnostic(
  diagramId: string,
  number: number,
  field: string,
  value: readonly number[],
  rule: string,
  diagnostics: Diagnostic[],
) {
  diagnostics.push({
    source: "content/methodology/measurement-reference.json",
    key: `${diagramId}:${number}`,
    field,
    value,
    rule,
    suggestion:
      "Reconcile this coordinate with the owner-supplied annotated/raw pair.",
  });
}
