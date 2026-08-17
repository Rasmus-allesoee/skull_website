import Image from "next/image";
import type { CSSProperties } from "react";

import { getScalePresentation } from "@/domain/comparison/scale";
import type { SkullComparisonRecord } from "@/domain/comparison/types";
import { formatMeasurement } from "@/domain/content/display";

type ScaleStyle = CSSProperties & {
  "--relative-length": string;
  "--subject-aspect": string;
  "--canvas-width": string;
  "--canvas-height": string;
  "--canvas-left": string;
  "--canvas-top": string;
};

export function ScaledSkullImage({
  record,
  largestLengthMm,
  targetOrientation,
  position,
}: {
  record: SkullComparisonRecord;
  largestLengthMm: number;
  targetOrientation: SkullComparisonRecord["image"]["orientation"];
  position: "primary" | "comparison";
}) {
  const presentation = getScalePresentation(
    record,
    largestLengthMm,
    targetOrientation,
  );
  const style: ScaleStyle = {
    "--relative-length": `${presentation.relativeLengthPercent}%`,
    "--subject-aspect": `${presentation.subjectAspectRatio}`,
    "--canvas-width": `${presentation.canvasWidthPercent}%`,
    "--canvas-height": `${presentation.canvasHeightPercent}%`,
    "--canvas-left": `${presentation.canvasLeftPercent}%`,
    "--canvas-top": `${presentation.canvasTopPercent}%`,
  };

  return (
    <figure className={`scaled-skull scaled-skull-${position}`}>
      <figcaption>
        <span>
          <strong>{record.specimenId ?? record.label}</strong>
          {record.specimenId ? <small>{record.label}</small> : null}
        </span>
        <b>{formatMeasurement(record.measurements.skullLength)}</b>
      </figcaption>
      <div className="scaled-skull-track">
        <div
          className={`scaled-skull-subject${presentation.flipHorizontally ? "is-flipped" : ""}`}
          style={style}
          data-comparison-id={record.id}
          data-anatomical-length={record.measurements.skullLength.value}
        >
          <Image
            className="scaled-skull-canvas"
            src={record.image.publicPath}
            alt={record.image.alt}
            width={record.image.width}
            height={record.image.height}
            sizes="(max-width: 48rem) calc(100vw - 4rem), 34rem"
            unoptimized
            draggable={false}
          />
        </div>
      </div>
    </figure>
  );
}
