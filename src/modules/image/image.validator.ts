import { z } from "zod";

export const convertSchema = z.object({
  targetFormat: z.enum(["jpg", "jpeg", "png", "webp"])
});

export const compressSchema = z.object({
  quality: z.number().min(30).max(95).optional()
});
