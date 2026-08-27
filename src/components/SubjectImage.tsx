import Image from "next/image";
import type { CSSProperties } from "react";

import type { MediaAsset } from "@/domain/content/types";

type SubjectStyle = CSSProperties & {
  "--subject-aspect": string;
  "--subject-aspect-inverse": string;
  "--subject-canvas-width": string;
  "--subject-canvas-height": string;
  "--subject-canvas-left": string;
  "--subject-canvas-top": string;
};

export function SubjectImage({
  asset,
  className = "",
  priority = false,
  sizes,
}: {
  asset: MediaAsset;
  className?: string;
  priority?: boolean;
  sizes: string;
}) {
  const { subjectBounds } = asset;
  const style: SubjectStyle = {
    "--subject-aspect": `${subjectBounds.width / subjectBounds.height}`,
    "--subject-aspect-inverse": `${subjectBounds.height / subjectBounds.width}`,
    "--subject-canvas-width": `${(asset.width / subjectBounds.width) * 100}%`,
    "--subject-canvas-height": `${(asset.height / subjectBounds.height) * 100}%`,
    "--subject-canvas-left": `${(-subjectBounds.x / subjectBounds.width) * 100}%`,
    "--subject-canvas-top": `${(-subjectBounds.y / subjectBounds.height) * 100}%`,
  };

  return (
    <div className={`subject-image ${className}`.trim()} style={style}>
      <Image
        className="subject-image-canvas"
        src={asset.publicPath}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        priority={priority}
        quality={90}
      />
    </div>
  );
}
