import type { Request, Response } from "express";

import fs from "fs";
import { compressImageService, convertImageService, imagesToPdfService } from "./imageResize.service.js";

export const convertImageController = async (req: Request, res: Response) => {
  try {
    const file = req.file!;
    const { target_format } = req.body;

    const { outputPath, outputName } =
      await convertImageService(file.path, file.originalname, target_format);

    fs.unlinkSync(file.path);
    res.download(outputPath, outputName);

  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const compressImageController = async (req: Request, res: Response) => {
  try {
    const file = req.file!;
    const { target_kb, quality_percent } = req.body;

    const { outputPath, outputName } =
      await compressImageService(
        file.path,
        file.originalname,
        target_kb ? Number(target_kb) : undefined,
        quality_percent ? Number(quality_percent) : undefined
      );

    fs.unlinkSync(file.path);
    res.download(outputPath, outputName);

  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const imagesToPdfController = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Images required" });
    }

    const { outputPath, outputName } = await imagesToPdfService(files);

    files.forEach(f => fs.unlinkSync(f.path));
    res.download(outputPath, outputName);

  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
