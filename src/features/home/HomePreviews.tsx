import Image from "next/image";
import type { CSSProperties } from "react";

import { SubjectImage } from "@/components/SubjectImage";
import type { SpecimenCardRecord } from "@/domain/catalog/queries";
import {
  getScalePresentation,
  getMeasuredValue,
} from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";
import type { HomeMediaAsset } from "@/domain/home/types";
import type { MeasurementDiagram } from "@/domain/methodology/types";

export function SpeciesCardPreview({
  specimens,
}: {
  specimens: SpecimenCardRecord[];
}) {
  return (
    <div className="home-species-preview" aria-hidden="true">
      {specimens
        .slice(0, 3)
        .map((record, index) =>
          record.image ? (
            <SubjectImage
              key={record.specimen.specimenId}
              className={`home-species-subject home-species-subject-${index + 1}`}
              asset={record.image}
              sizes="(max-width: 48rem) 44vw, 20vw"
            />
          ) : null,
        )}
    </div>
  );
}

export function HomeMapPreview({
  specimens,
}: {
  specimens: SpecimenCardRecord[];
}) {
  const points = specimens.flatMap((record) => {
    const { latitude, longitude, precision } = record.specimen.location;
    return latitude !== null && longitude !== null && precision !== "unknown"
      ? [{ latitude, longitude, precision }]
      : [];
  });
  const longitudes = points.map((point) => point.longitude);
  const latitudes = points.map((point) => point.latitude);
  const longitudeMin = Math.min(...longitudes);
  const longitudeMax = Math.max(...longitudes);
  const latitudeMin = Math.min(...latitudes);
  const latitudeMax = Math.max(...latitudes);
  const project = (
    value: number,
    min: number,
    max: number,
    start: number,
    span: number,
  ) => start + ((value - min) / Math.max(max - min, 0.01)) * span;

  return (
    <div className="home-location-preview" aria-hidden="true">
      <svg viewBox="0 0 640 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="home-map-glow">
            <stop offset="0" stopColor="var(--color-data)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--color-data)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="640" height="300" fill="url(#home-map-glow)" />
        {[120, 240, 360, 480].map((x) => (
          <path
            key={`x-${x}`}
            d={`M ${x} 24 V 276`}
            className="home-map-grid-line"
          />
        ))}
        {[80, 150, 220].map((y) => (
          <path
            key={`y-${y}`}
            d={`M 36 ${y} H 604`}
            className="home-map-grid-line"
          />
        ))}
        <path
          className="home-map-route"
          d={points
            .map((point, index) => {
              const x = project(
                point.longitude,
                longitudeMin,
                longitudeMax,
                70,
                500,
              );
              const y =
                250 - project(point.latitude, latitudeMin, latitudeMax, 0, 200);
              return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(" ")}
        />
        {points.map((point, index) => {
          const x = project(
            point.longitude,
            longitudeMin,
            longitudeMax,
            70,
            500,
          );
          const y =
            250 - project(point.latitude, latitudeMin, latitudeMax, 0, 200);
          return (
            <g key={`${point.latitude}-${point.longitude}-${index}`}>
              {point.precision === "approximate" ? (
                <circle cx={x} cy={y} r="10" className="home-map-approximate" />
              ) : null}
              <circle cx={x} cy={y} r="4.5" className="home-map-point" />
            </g>
          );
        })}
      </svg>
      <span>{points.length} reviewed location records</span>
    </div>
  );
}

export function MeasurementCardPreview({
  diagram,
}: {
  diagram: MeasurementDiagram;
}) {
  const [x, y, width, height] = diagram.viewport;
  return (
    <div className="home-measurement-preview" aria-hidden="true">
      <svg
        viewBox={`${x} ${y} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="home-measurement-arrow"
            markerWidth="12"
            markerHeight="12"
            refX="6"
            refY="6"
            orient="auto-start-reverse"
            markerUnits="strokeWidth"
          >
            <path d="M 1 1 L 11 6 L 1 11 Z" />
          </marker>
        </defs>
        <image
          href={diagram.publicPath}
          x="0"
          y="0"
          width={diagram.coordinateWidth}
          height={diagram.coordinateHeight}
        />
        {diagram.occurrences.slice(0, 4).map((occurrence) => (
          <g key={occurrence.number}>
            {occurrence.extensions.map((extension, index) => (
              <line
                key={index}
                x1={extension[0]}
                y1={extension[1]}
                x2={extension[2]}
                y2={extension[3]}
                className="home-measurement-extension"
              />
            ))}
            <line
              x1={occurrence.line[0]}
              y1={occurrence.line[1]}
              x2={occurrence.line[2]}
              y2={occurrence.line[3]}
              className="home-measurement-line"
              markerStart="url(#home-measurement-arrow)"
              markerEnd="url(#home-measurement-arrow)"
            />
            <circle
              cx={occurrence.label[0]}
              cy={occurrence.label[1]}
              r="82"
              className="home-measurement-number-ring"
            />
            <text
              x={occurrence.label[0]}
              y={occurrence.label[1]}
              className="home-measurement-number"
            >
              {occurrence.number}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function PreparationCardPreview({ asset }: { asset: HomeMediaAsset }) {
  return (
    <figure className="home-preparation-preview">
      <Image
        src={asset.publicPath}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes="(max-width: 48rem) 92vw, 42vw"
        quality={90}
      />
      <figcaption>Owner-supplied preparation photograph</figcaption>
    </figure>
  );
}

type ComparisonStyle = CSSProperties & {
  "--comparison-width": string;
  "--comparison-flip": string;
};

export function ComparisonCardPreview({
  specimen,
  reference,
}: {
  specimen: SkullComparisonRecord;
  reference: SkullComparisonRecord;
}) {
  const specimenLength = getMeasuredValue(specimen.measurements.skullLength);
  const referenceLength = getMeasuredValue(reference.measurements.skullLength);
  if (specimenLength === null || referenceLength === null) return null;
  const largestLength = Math.max(specimenLength, referenceLength);

  return (
    <div className="home-comparison-preview" aria-hidden="true">
      <ComparisonSubject
        record={reference}
        largestLength={largestLength}
        targetOrientation={specimen.image.orientation}
      />
      <span>relative length</span>
      <ComparisonSubject
        record={specimen}
        largestLength={largestLength}
        targetOrientation={specimen.image.orientation}
      />
    </div>
  );
}

function ComparisonSubject({
  record,
  largestLength,
  targetOrientation,
}: {
  record: SkullComparisonRecord;
  largestLength: number;
  targetOrientation: SkullComparisonRecord["image"]["orientation"];
}) {
  const presentation = getScalePresentation(
    record,
    largestLength,
    targetOrientation,
  );
  const style: ComparisonStyle = {
    "--comparison-width": `${presentation.relativeLengthPercent}%`,
    "--comparison-flip": presentation.flipHorizontally ? "-1" : "1",
  };
  return (
    <div className="home-comparison-track">
      <div className="home-comparison-subject" style={style}>
        <Image
          src={record.image.publicPath}
          alt=""
          fill
          sizes="(max-width: 48rem) 80vw, 38vw"
        />
      </div>
    </div>
  );
}
