import { readFile, stat } from "node:fs/promises";

import sharp from "sharp";
import { z } from "zod";

import type { HomeMediaManifest } from "../../src/domain/home/types";
import { fromRepositoryRoot } from "./paths";

const declarationSchema = z.strictObject({
  schema_version: z.literal(1),
  assets: z.array(
    z.strictObject({
      asset_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      public_path: z.string().regex(/^\/media\/home\/[a-z0-9-]+\.webp$/),
      alt: z.string().min(1),
      credit: z.string().min(1),
      rights: z.literal("all_rights_reserved"),
    }),
  ),
});

export async function loadHomeMedia(): Promise<HomeMediaManifest> {
  const declarationPath = fromRepositoryRoot(
    "content",
    "home",
    "home-media.json",
  );
  const declaration = declarationSchema.parse(
    JSON.parse(await readFile(declarationPath, "utf8")),
  );
  const ids = declaration.assets.map((asset) => asset.asset_id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Home media asset IDs must be unique.");
  }

  const assets = await Promise.all(
    declaration.assets.map(async (asset) => {
      const publicFile = fromRepositoryRoot(
        "public",
        asset.public_path.replace(/^\//, ""),
      );
      const [metadata, fileStats] = await Promise.all([
        sharp(publicFile, { failOn: "error" }).metadata(),
        stat(publicFile),
      ]);
      if (
        metadata.format !== "webp" ||
        !metadata.width ||
        !metadata.height ||
        Math.max(metadata.width, metadata.height) < 1200
      ) {
        throw new Error(
          `${asset.public_path}: Home media must be a readable WebP with a longest edge of at least 1200 px.`,
        );
      }
      if (metadata.exif || metadata.icc || metadata.iptc || metadata.xmp) {
        throw new Error(
          `${asset.public_path}: Home media must not retain EXIF, ICC, IPTC, or XMP metadata.`,
        );
      }

      return {
        assetId: asset.asset_id,
        publicPath: asset.public_path,
        width: metadata.width,
        height: metadata.height,
        bytes: fileStats.size,
        alt: asset.alt,
        credit: asset.credit,
        rights: asset.rights,
      };
    }),
  );

  return { schemaVersion: 1, assets };
}
