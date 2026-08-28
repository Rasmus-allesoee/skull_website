import Image from "next/image";

import type { MapRecord } from "@/domain/map/types";

export function MapThumbnail({
  record,
  sizes = "96px",
}: {
  record: MapRecord;
  sizes?: string;
}) {
  if (!record.image) {
    return <span className="map-thumbnail-placeholder" aria-hidden="true" />;
  }
  return (
    <span className="map-thumbnail">
      <Image
        src={record.image.publicPath}
        alt={record.image.alt}
        width={record.image.width}
        height={record.image.height}
        sizes={sizes}
        quality={70}
      />
    </span>
  );
}
