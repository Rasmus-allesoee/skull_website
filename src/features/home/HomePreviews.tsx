import Image from "next/image";

import type { HomeMediaAsset } from "@/domain/home/types";

export function SpeciesCardPreview({ asset }: { asset: HomeMediaAsset }) {
  return <HomeMediaPreview asset={asset} className="home-species-preview" />;
}

export function HomeMapPreview({ asset }: { asset: HomeMediaAsset }) {
  return <HomeMediaPreview asset={asset} className="home-location-preview" />;
}

export function MeasurementCardPreview({ asset }: { asset: HomeMediaAsset }) {
  return (
    <HomeMediaPreview asset={asset} className="home-measurement-preview" />
  );
}

export function PreparationCardPreview({ asset }: { asset: HomeMediaAsset }) {
  return (
    <HomeMediaPreview asset={asset} className="home-preparation-preview" />
  );
}

export function ComparisonCardPreview({ asset }: { asset: HomeMediaAsset }) {
  return <HomeMediaPreview asset={asset} className="home-comparison-preview" />;
}

function HomeMediaPreview({
  asset,
  className,
}: {
  asset: HomeMediaAsset;
  className: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <Image
        src={asset.publicPath}
        alt=""
        fill
        sizes="(max-width: 48rem) 92vw, 42vw"
        quality={88}
      />
    </div>
  );
}
