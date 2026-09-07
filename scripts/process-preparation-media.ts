import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";
import { z } from "zod";
import { fromRepositoryRoot } from "./lib/paths";
import {
  loadPreparationMedia,
  preparationMediaSchema,
} from "./lib/preparation";
const source = z
  .strictObject({
    schema_version: z.literal(1),
    source_root: z.literal("agent_context/preparation_page"),
    entries: z.array(
      z.strictObject({
        asset_id: z.string().regex(/^[a-z][a-z0-9-]*$/),
        source_file: z.string().regex(/^[^/\\]+\.(png|jpg)$/),
      }),
    ),
  })
  .parse(
    JSON.parse(
      await readFile(
        fromRepositoryRoot("scripts/preparation-media-source-map.json"),
        "utf8",
      ),
    ),
  );
const declaration = preparationMediaSchema.parse(
  JSON.parse(
    await readFile(
      fromRepositoryRoot("content/guides/preparation-media.json"),
      "utf8",
    ),
  ),
);
if (
  source.entries.length !== declaration.assets.length ||
  new Set(source.entries.map((e) => e.asset_id)).size !==
    source.entries.length ||
  declaration.assets.some(
    (a) => !source.entries.some((e) => e.asset_id === a.asset_id),
  )
)
  throw new Error("Preparation source/declaration mismatch");
await mkdir(fromRepositoryRoot("public/media/preparation"), {
  recursive: true,
});
for (const entry of source.entries) {
  const asset = declaration.assets.find((a) => a.asset_id === entry.asset_id)!;
  await sharp(fromRepositoryRoot(source.source_root, entry.source_file), {
    failOn: "error",
  })
    .rotate()
    .toColourspace("srgb")
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 86, alphaQuality: 100, smartSubsample: true })
    .toFile(fromRepositoryRoot("public", asset.public_path.slice(1)));
}
const media = await loadPreparationMedia();
console.log(
  `Validated ${media.length} preparation WebPs, ${(media.reduce((n, a) => n + a.bytes, 0) / 1024).toFixed(0)} KiB; metadata stripped.`,
);
