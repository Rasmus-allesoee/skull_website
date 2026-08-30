import { z } from "zod";

export const measurementSourceMapSchema = z.strictObject({
  schema_version: z.literal(1),
  source_root: z.string().min(1),
  entries: z
    .array(
      z.strictObject({
        diagram_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        raw_file: z.string().regex(/^raw\/[A-Za-z0-9_.-]+\.png$/),
        annotated_file: z.string().regex(/^annotated\/[A-Za-z0-9_.-]+\.png$/),
        public_file: z
          .string()
          .regex(/^public\/media\/methodology\/[a-z0-9-]+\.webp$/),
      }),
    )
    .length(5),
});

export type MeasurementSourceMap = z.infer<typeof measurementSourceMapSchema>;
