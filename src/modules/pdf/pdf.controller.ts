import type { Request, Response } from "express";

import fs from "fs";
import { compressPdfService, getPdfMetadata, mergePdfService, splitPdfService } from "./pdf.service.js";

export const splitPdfController = async (req: Request, res: Response) => {
  const file = req.file!;
  const { start_page, end_page } = req.body;

  const result = await splitPdfService(
    file.path,
    Number(start_page),
    Number(end_page)
  );

  fs.unlinkSync(file.path);
  res.download(result.outputPath, result.filename);
};

export const mergePdfController = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  const result = await mergePdfService(files[0].path, files[1].path);
  files.forEach(f => fs.unlinkSync(f.path));

  res.download(result.outputPath, result.filename);
};

export const compressPdfController = async (req: Request, res: Response) => {
  const file = req.file!;
  const { quality } = req.body;

  const outputPath = await compressPdfService(file.path, quality);
  fs.unlinkSync(file.path);

  res.download(outputPath);
};

export const pdfMetadataController = async (req: Request, res: Response) => {
  const file = req.file!;
  const pages = await getPdfMetadata(file.path);
  fs.unlinkSync(file.path);

  res.json({ status: "success", total_pages: pages });
};
