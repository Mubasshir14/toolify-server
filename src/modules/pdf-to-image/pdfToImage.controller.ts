import type { Request, Response } from "express";
import fs from "fs";
import { pdfToImageService } from "./pdfToImage.service.js";

export const pdfToImageController = async (req: Request, res: Response) => {
  const file = req.file!;
  const result = await pdfToImageService(file.path);
  fs.unlinkSync(file.path);

  res.json({
    status: "success",
    zip_url: `/api/pdf/download/${result.zip}`,
    previews: result.previews.map(
      name => `/api/pdf/preview/${name}`
    )
  });
};
