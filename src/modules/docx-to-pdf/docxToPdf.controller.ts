import type { Request, Response } from "express";
import fs from "fs";
import { convertDocxToPdf } from "./docxToPdf.service.js";

export const docxToPdfController = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "DOCX file required" });
    }

    const pdfPath = await convertDocxToPdf(file.path);

    // cleanup docx
    fs.unlinkSync(file.path);

    res.download(pdfPath, "converted.pdf", () => {
      fs.unlinkSync(pdfPath); // optional cleanup
    });
  } catch (err: any) {
    console.error("❌ DOCX → PDF ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
