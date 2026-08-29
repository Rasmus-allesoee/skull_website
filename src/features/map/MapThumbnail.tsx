import Image from "next/image";

import type { MapRecord } from "@/domain/map/types";

export function MapThumbnail({
  record,
  sizes = "96px",
  cropToSubject = false,
}: {
  record: MapRecord;
  sizes?: string;
  cropToSubject?: boolean;
}) {
  if (!record.image) {
    return <span className="map-thumbnail-placeholder" aria-hidden="true" />;
  }
  const { subjectBounds } = record.image;
  return (
    <span className="map-thumbnail">
      {cropToSubject ? (
        <svg
          className="map-thumbnail-subject-svg"
          viewBox={`${subjectBounds.x} ${subjectBounds.y} ${subjectBounds.width} ${subjectBounds.height}`}
          role="img"
          aria-label={record.image.alt}
        >
          <image
            href={record.image.publicPath}
            x="0"
            y="0"
            width={record.image.width}
            height={record.image.height}
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      ) : (
        <Image
          src={record.image.publicPath}
          alt={record.image.alt}
          width={record.image.width}
          height={record.image.height}
          sizes={sizes}
          quality={70}
        />
      )}
    </span>
  );
}
