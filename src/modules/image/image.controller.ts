import type { Request, Response } from "express";
import { compressImage, convertImage } from "./image.service.js";
import { safeUnlink } from "../../utils/file.util.js";


export const convertImageCtrl = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "Image file is required",
      });
    }

    // 🔥 ACCEPT BOTH snake_case & camelCase
    const targetFormatRaw =
      req.body.target_format || req.body.targetFormat;

    if (!targetFormatRaw || typeof targetFormatRaw !== "string") {
      safeUnlink(file.path);
      return res.status(400).json({
        status: "error",
        message: "Target format is required",
      });
    }

    const targetFormat = targetFormatRaw.toLowerCase();

    const allowedFormats = ["jpg", "jpeg", "png", "webp"];

    if (!allowedFormats.includes(targetFormat)) {
      safeUnlink(file.path);
      return res.status(400).json({
        status: "error",
        message: "Unsupported image format",
      });
    }

    const output = await convertImage(file.path, targetFormat);

    safeUnlink(file.path);

    return res.download(output);
  } catch (error) {
    console.error("❌ Image convert failed:", error);
    return res.status(500).json({
      status: "error",
      message: "Image conversion failed",
    });
  }
};


export const compressImageCtrl = async (req: Request, res: Response) => {
  const file = req.file!;
  const { quality } = req.body;

  const output = await compressImage(file.path, Number(quality));
  safeUnlink(file.path);

  res.download(output);
};
