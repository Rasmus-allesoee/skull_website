import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const dimensions = [1600, 1400, 1200];
const qualities = [86, 80, 74, 68, 62];
for (const entry of source.entries) {
  const asset = declaration.assets.find((a) => a.asset_id === entry.asset_id)!;
  let derivative: Buffer | undefined;
  for (const size of dimensions) {
    for (const quality of qualities) {
      const candidate = await sharp(
        fromRepositoryRoot(source.source_root, entry.source_file),
        { failOn: "error" },
      )
        .rotate()
        .toColourspace("srgb")
        .resize({
          width: size,
          height: size,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality, alphaQuality: 100, smartSubsample: true })
        .toBuffer();
      if (candidate.byteLength <= 750000) {
        derivative = candidate;
        break;
      }
    }
    if (derivative) break;
  }
  if (!derivative)
    throw new Error(
      `Could not fit preparation derivative: ${asset.public_path}`,
    );
  await writeFile(
    fromRepositoryRoot("public", asset.public_path.slice(1)),
    derivative,
  );
}
const media = await loadPreparationMedia();
console.log(
  `Validated ${media.length} preparation WebPs, ${(media.reduce((n, a) => n + a.bytes, 0) / 1024).toFixed(0)} KiB; metadata stripped.`,
);
