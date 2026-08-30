export interface MeasurementDefinition {
  number: number;
  name: string;
  description: string;
}

export type MeasurementSegment = readonly [
  x1: number,
  y1: number,
  x2: number,
  y2: number,
];

export type MeasurementLabelPoint = readonly [x: number, y: number];

export interface MeasurementOccurrence {
  number: number;
  line: MeasurementSegment;
  extensions: MeasurementSegment[];
  label: MeasurementLabelPoint;
}

export interface MeasurementDiagram {
  id: string;
  title: string;
  publicPath: string;
  alt: string;
  credit: string;
  rights: "all_rights_reserved";
  coordinateWidth: number;
  coordinateHeight: number;
  occurrences: MeasurementOccurrence[];
}

export interface MeasurementReference {
  schemaVersion: 1;
  sourceNote: string;
  definitions: MeasurementDefinition[];
  diagrams: MeasurementDiagram[];
  occurrenceCount: number;
}
