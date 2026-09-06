import { readFile, stat } from "node:fs/promises";
import sharp from "sharp";
import { z } from "zod";
import {
  parseGuide,
  type GuideBlock,
  type GuideMediaAsset,
  type PreparationGuide,
} from "../../src/domain/guides/guide";
import { fromRepositoryRoot } from "./paths";

export const preparationMediaSchema = z.strictObject({
  schema_version: z.literal(1),
  assets: z
    .array(
      z.strictObject({
        asset_id: z.string().regex(/^[a-z][a-z0-9-]*$/),
        public_path: z
          .string()
          .regex(/^\/media\/preparation\/[a-z0-9-]+\.webp$/),
        alt: z.string().min(1),
        caption: z.string().min(1),
        credit: z.string().min(1),
        rights: z.literal("all_rights_reserved"),
        provenance: z.enum(["owner-photograph", "ai-illustration"]),
      }),
    )
    .min(1),
});
export async function loadPreparationMedia(): Promise<GuideMediaAsset[]> {
  const declaration = preparationMediaSchema.parse(
    JSON.parse(
      await readFile(
        fromRepositoryRoot("content/guides/preparation-media.json"),
        "utf8",
      ),
    ),
  );
  if (
    new Set(declaration.assets.map((a) => a.asset_id)).size !==
      declaration.assets.length ||
    new Set(declaration.assets.map((a) => a.public_path)).size !==
      declaration.assets.length
  )
    throw new Error("Duplicate preparation media identity/path");
  return Promise.all(
    declaration.assets.map(async (a) => {
      const file = fromRepositoryRoot("public", a.public_path.slice(1));
      const meta = await sharp(file, { failOn: "error" }).metadata();
      const info = await stat(file);
      if (
        meta.format !== "webp" ||
        !meta.width ||
        !meta.height ||
        Math.max(meta.width, meta.height) > 1600 ||
        Math.max(meta.width, meta.height) < 1000 ||
        info.size > 750000 ||
        meta.exif ||
        meta.icc ||
        meta.iptc ||
        meta.xmp
      )
        throw new Error(`Invalid preparation derivative: ${a.public_path}`);
      return {
        assetId: a.asset_id,
        publicPath: a.public_path,
        width: meta.width,
        height: meta.height,
        bytes: info.size,
        alt: a.alt,
        caption: a.caption,
        credit: a.credit,
        rights: a.rights,
        provenance: a.provenance,
      };
    }),
  );
}
export async function loadPreparationGuide(): Promise<PreparationGuide> {
  const guide = parseGuide(
    await readFile(
      fromRepositoryRoot("content/guides/skull-preparation.mdx"),
      "utf8",
    ),
  );
  const media = await loadPreparationMedia();
  const used = new Set(guide.metadata.stages.map((s) => s.asset));
  function visit(blocks: GuideBlock[]) {
    for (const b of blocks) {
      if (b.kind === "figure") used.add(b.asset);
      if (b.kind === "aside" || b.kind === "details") visit(b.blocks);
    }
  }
  visit(guide.blocks);
  if (
    [...used].some((id) => !media.some((a) => a.assetId === id)) ||
    media.some((a) => !used.has(a.assetId))
  )
    throw new Error("Missing or unused preparation media");
  return { ...guide, media };
}
