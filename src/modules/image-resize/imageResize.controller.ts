import type { Request, Response } from "express";
import path from "path";
import { safeUnlink } from "../../utils/file.util.js";
import { processImage } from "./imageResize.service.js";

export const resizeImageCtrl = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "Image file is required",
      });
    }

    // 🔥 frontend sends these
    const cropRaw = req.body.crop;
    const rotateRaw = req.body.rotate;
    const scaleRaw = req.body.scale || req.body.percentage;
    const widthRaw = req.body.width || req.body.target_width;
    const heightRaw = req.body.height || req.body.target_height;

    const crop = cropRaw ? JSON.parse(cropRaw) : null;
    const rotate = rotateRaw ? Number(rotateRaw) : 0;
    const scale = scaleRaw ? Number(scaleRaw) : undefined;
    const width = widthRaw ? Number(widthRaw) : undefined;
    const height = heightRaw ? Number(heightRaw) : undefined;

    const outputPath = await processImage({
      inputPath: file.path,
      crop,
      rotate,
      scale,
      width,
      height,
    });

    safeUnlink(file.path);

    const fileName = path.basename(outputPath);

    return res.json({
      status: "success",
      preview: `/api/image/preview/${fileName}`,
      download: `/api/image/download/${fileName}`,
    });
  } catch (err) {
    console.error("❌ Image processing failed:", err);
    return res.status(500).json({
      status: "error",
      message: "Image processing failed",
    });
  }
};
