import type { Request, Response } from "express";

import fs from "fs";
import {
  compressPdfService,
  getPdfMetadata,
  mergePdfService,
  splitPdfService,
} from "./pdf.service.js";
import { PDFDocument } from "pdf-lib";

export const splitPdfController = async (req: Request, res: Response) => {
  const file = req.file!;
  const { start_page, end_page } = req.body;

  const result = await splitPdfService(
    file.path,
    Number(start_page),
    Number(end_page),
  );

  fs.unlinkSync(file.path);
  res.download(result.outputPath, result.filename);
};

export const mergePdfController = async (req: Request, res: Response) => {
  try {
    const files = req.files as {
      pdf1?: Express.Multer.File[];
      pdf2?: Express.Multer.File[];
    };

    if (!files?.pdf1 || !files?.pdf2) {
      return res.status(400).json({
        status: "error",
        message: "Both pdf1 and pdf2 are required",
      });
    }

    const pdf1Path = files.pdf1[0].path;
    const pdf2Path = files.pdf2[0].path;

    const pdf1Bytes = fs.readFileSync(pdf1Path);
    const pdf2Bytes = fs.readFileSync(pdf2Path);

    const mergedPdf = await PDFDocument.create();

    const pdf1Doc = await PDFDocument.load(pdf1Bytes);
    const pdf2Doc = await PDFDocument.load(pdf2Bytes);

    const pdf1Pages = await mergedPdf.copyPages(
      pdf1Doc,
      pdf1Doc.getPageIndices(),
    );
    pdf1Pages.forEach((p) => mergedPdf.addPage(p));

    const pdf2Pages = await mergedPdf.copyPages(
      pdf2Doc,
      pdf2Doc.getPageIndices(),
    );
    pdf2Pages.forEach((p) => mergedPdf.addPage(p));

    const mergedPdfBytes = await mergedPdf.save();

    // optional cleanup
    fs.unlinkSync(pdf1Path);
    fs.unlinkSync(pdf2Path);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");

    return res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to merge PDFs",
    });
  }
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
