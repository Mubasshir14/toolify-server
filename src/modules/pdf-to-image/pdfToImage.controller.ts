import type { Request, Response } from "express";
import fs from "fs";
import { pdfToImageService } from "./pdfToImage.service.js";

export const pdfToImageController = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "PDF file is required",
    });
  }

  const filePath = req.file.path;

  try {
    const result = await pdfToImageService(filePath);

    return res.json({
      status: "success",
      zip_url: `/api/pdf/download/${result.zip}`,
      previews: result.previews.map(
        (name) => `/api/pdf/preview/${name}`
      ),
    });
  } catch (error) {
    console.error("❌ PDF to Image failed:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to convert PDF to images",
    });
  } finally {
    // 🔥 always cleanup uploaded pdf
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
