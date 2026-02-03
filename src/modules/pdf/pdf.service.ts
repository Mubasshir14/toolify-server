import fs from "fs";
import path from "path";
import os from "os";
import { PDFDocument } from "pdf-lib";
import ghostscript from "ghostscript-node";
import { v4 as uuid } from "uuid";
import { execa } from "execa";

const SPLIT_DIR = "static/pdfs/split";
const MERGE_DIR = "static/pdfs/merge";

fs.mkdirSync(SPLIT_DIR, { recursive: true });
fs.mkdirSync(MERGE_DIR, { recursive: true });
const GS_COMMAND =
  os.platform() === "win32" ? "gswin64c" : "gs";

export const getPdfMetadata = async (pdfPath: string) => {
  const bytes = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(bytes);
  return pdf.getPageCount();
};

export const splitPdfService = async (
  pdfPath: string,
  start: number,
  end: number
) => {
  const srcPdf = await PDFDocument.load(fs.readFileSync(pdfPath));
  const total = srcPdf.getPageCount();

  if (start < 1 || end > total || start > end) {
    throw new Error(`Invalid page range! Total pages: ${total}`);
  }

  const newPdf = await PDFDocument.create();
  for (let i = start - 1; i < end; i++) {
    const [page] = await newPdf.copyPages(srcPdf, [i]);
    newPdf.addPage(page);
  }

  const filename = `${start}_${end}.pdf`;
  const outputPath = path.join(SPLIT_DIR, filename);

  fs.writeFileSync(outputPath, await newPdf.save());
  return { outputPath, filename };
};

export const mergePdfService = async (
  pdf1: string,
  pdf2: string
) => {
  const pdfA = await PDFDocument.load(fs.readFileSync(pdf1));
  const pdfB = await PDFDocument.load(fs.readFileSync(pdf2));

  const merged = await PDFDocument.create();
  for (const p of [pdfA, pdfB]) {
    const pages = await merged.copyPages(p, p.getPageIndices());
    pages.forEach(page => merged.addPage(page));
  }

  const filename = "merged.pdf";
  const outputPath = path.join(MERGE_DIR, filename);
  fs.writeFileSync(outputPath, await merged.save());

  return { outputPath, filename };
};

export const compressPdfService = async (
  input: string,
  quality: "high" | "medium" | "low"
) => {
  const outputPath = path.join(
    "static/pdfs/merge",
    `compressed_${uuid()}.pdf`
  );

  const QUALITY_MAP: Record<string, string> = {
    high: "/prepress",
    medium: "/printer",
    low: "/ebook"
  };

 await execa(GS_COMMAND, [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dPDFSETTINGS=/printer",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=${outputPath}`,
    input,
  ]);

  return outputPath;
};

