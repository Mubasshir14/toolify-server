import type { Request, Response } from "express";

import fs from "fs";
import { bgRemoveService } from "./bgRemove.service.js";

export const bgRemoveController = async (
  req: Request,
  res: Response
) => {
  try {
    const image = req.file;

    // 🔒 SAFE TYPE NARROWING
    let bgImage: Express.Multer.File | undefined;

    if (
      req.files &&
      !Array.isArray(req.files) &&
      req.files["bg_image"] &&
      req.files["bg_image"].length > 0
    ) {
      bgImage = req.files["bg_image"][0];
    }

    if (!image) {
      return res.status(400).json({ message: "Image required" });
    }

    const { bg_type, bg_color } = req.body;

    const result = await bgRemoveService(
      image.path,
      bg_type,
      bg_color,
      bgImage?.path
    );

    // 🧹 cleanup
    fs.unlinkSync(image.path);
    if (bgImage) fs.unlinkSync(bgImage.path);

    res.json({
      status: "success",
      preview: result.preview,
      final: result.final
    });

  } catch (err: any) {
    console.error("❌ BG REMOVE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
