export interface HomeMediaAsset {
  assetId: string;
  publicPath: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
  credit: string;
  rights: "all_rights_reserved";
}

export interface HomeMediaManifest {
  schemaVersion: 1;
  assets: HomeMediaAsset[];
}
