import type { Request, Response } from "express";
import { bgRemoveSchema } from "./bgRemove.validator.js";
import { processImage } from "./bgRemove.service.js";


export const bgRemove = async (req: Request, res: Response) => {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const image = files?.image?.[0];
    const bgImage = files?.bg_image?.[0];

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!image.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image file is allowed"
      });
    }

    const parsed = bgRemoveSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0].message
      });
    }

    if (parsed.data.bg_type === "image" && !bgImage) {
      return res.status(400).json({
        message: "Background image is required"
      });
    }

    const result = await processImage({
      image,
      bgType: parsed.data.bg_type,
      bgColor: parsed.data.bg_color,
      bgImage
    });

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Background remove failed"
    });
  }
};
