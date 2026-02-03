import sharp from "sharp";
import path from "path";
import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import { v4 as uuid } from "uuid";

const IMAGE_DIR = "static/images";
const CONVERTED_DIR = "static/converted_images";
const IMAGE_PDF_DIR = "static/image_pdfs";

fs.mkdirSync(IMAGE_DIR, { recursive: true });
fs.mkdirSync(CONVERTED_DIR, { recursive: true });
fs.mkdirSync(IMAGE_PDF_DIR, { recursive: true });

const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "webp", "bmp", "tiff"];

export const convertImageService = async (
  inputPath: string,
  originalName: string,
  targetFormat: string
) => {
  if (!SUPPORTED_FORMATS.includes(targetFormat)) {
    throw new Error("Unsupported target format");
  }

  const base = path.parse(originalName).name;
  const outputName = `${base}.${targetFormat}`;
  const outputPath = path.join(CONVERTED_DIR, outputName);

  let img = sharp(inputPath);

  if (targetFormat === "jpg" || targetFormat === "jpeg") {
    img = img.flatten({ background: "#ffffff" });
  }

  await img.toFormat(targetFormat as any).toFile(outputPath);

  return { outputPath, outputName };
};

export const compressImageService = async (
  inputPath: string,
  originalName: string,
  targetKb?: number,
  qualityPercent?: number
) => {
  const ext = path.extname(originalName);
  const base = path.parse(originalName).name;

  const outputName = `${base}_compressed${ext}`;
  const outputPath = path.join(CONVERTED_DIR, outputName);

  let img = sharp(inputPath).flatten({ background: "#ffffff" });

  // 🔹 Case 1: quality %
  if (qualityPercent) {
    const quality = Math.min(95, Math.max(30, qualityPercent));
    await img.jpeg({ quality }).toFile(outputPath);
    return { outputPath, outputName };
  }

  // 🔹 Case 2: target KB (smart loop)
  if (!targetKb) throw new Error("target_kb or quality_percent required");

  let quality = 95;
  while (quality >= 30) {
    await img.jpeg({ quality }).toFile(outputPath);
    const sizeKb = fs.statSync(outputPath).size / 1024;
    if (sizeKb <= targetKb) break;
    quality -= 5;
  }

  return { outputPath, outputName };
};

export const imagesToPdfService = async (
  files: Express.Multer.File[]
) => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const buffer = fs.readFileSync(file.path);
    const img = await sharp(buffer).flatten({ background: "#ffffff" }).toBuffer();

    const imgEmbed = await pdfDoc.embedJpg(img);

    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = imgEmbed.scaleToFit(555, 802);

    page.drawImage(imgEmbed, {
      x: (595 - width) / 2,
      y: (842 - height) / 2,
      width,
      height
    });
  }

  const pdfBytes = await pdfDoc.save();
  const outputName = "scanned.pdf";
  const outputPath = path.join(IMAGE_PDF_DIR, outputName);

  fs.writeFileSync(outputPath, pdfBytes);

  return { outputPath, outputName };
};
