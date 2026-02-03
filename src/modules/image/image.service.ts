import sharp from "sharp";
import path from "path";
import { ensureDir } from "../../utils/file.util.js";

const OUTPUT_DIR = "processed/images";

export const convertImage = async (inputPath: string, format: string) => {
  ensureDir(OUTPUT_DIR);

  const outputPath = path.join(OUTPUT_DIR, `${Date.now()}.${format}`);

  await sharp(inputPath)
    .toFormat(format as any)
    .toFile(outputPath);

  return outputPath;
};

export const compressImage = async (inputPath: string, quality?: number) => {
  ensureDir(OUTPUT_DIR);

  const outputPath = path.join(OUTPUT_DIR, `${Date.now()}_compressed.jpg`);

  const safeQuality: number =
    typeof quality === "number" &&
    Number.isFinite(quality) &&
    quality >= 1 &&
    quality <= 100
      ? Math.round(quality)
      : 75;

  await sharp(inputPath).jpeg({ quality: safeQuality }).toFile(outputPath);

  return outputPath;
};
