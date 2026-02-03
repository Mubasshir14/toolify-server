import { z } from "zod";

export const bgRemoveSchema = z.object({
  bg_type: z.enum(["transparent", "color", "image"]),
  bg_color: z.string().optional()
});
