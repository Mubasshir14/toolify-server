import sharp from "sharp";
import path from "path";
import { ensureDir } from "../../utils/file.util.js";

const OUTPUT_DIR = "processed/images";

export const convertImage = async (
  inputPath: string,
  format: string
) => {
  ensureDir(OUTPUT_DIR);

  const outputPath = path.join(
    OUTPUT_DIR,
    `${Date.now()}.${format}`
  );

  await sharp(inputPath).toFormat(format as any).toFile(outputPath);

  return outputPath;
};

export const compressImage = async (
  inputPath: string,
  quality = 80
) => {
  ensureDir(OUTPUT_DIR);

  const outputPath = path.join(
    OUTPUT_DIR,
    `${Date.now()}_compressed.jpg`
  );

  await sharp(inputPath)
    .jpeg({ quality })
    .toFile(outputPath);

  return outputPath;
};
