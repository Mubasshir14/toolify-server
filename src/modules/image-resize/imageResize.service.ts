import sharp from "sharp";
import path from "path";
import { ensureDir } from "../../utils/file.util.js";

const OUTPUT_DIR = "processed/images";

interface ProcessOptions {
  inputPath: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  rotate?: number;
  scale?: number;
  width?: number;
  height?: number;
}

export const processImage = async ({
  inputPath,
  crop,
  rotate = 0,
  scale,
  width,
  height,
}: ProcessOptions) => {
  ensureDir(OUTPUT_DIR);

  let image = sharp(inputPath);

  /* 🔥 1. ROTATE */
  if (rotate && rotate % 360 !== 0) {
    image = image.rotate(rotate);
  }

  /* 🔥 2. CROP */
  if (crop) {
    image = image.extract({
      left: Math.round(crop.x),
      top: Math.round(crop.y),
      width: Math.round(crop.width),
      height: Math.round(crop.height),
    });
  }

  /* 🔥 3. RESIZE */
  if (scale) {
    const meta = await image.metadata();
    if (!meta.width || !meta.height) {
      throw new Error("Invalid image metadata");
    }

    image = image.resize(
      Math.round(meta.width * (scale / 100)),
      Math.round(meta.height * (scale / 100))
    );
  } else if (width || height) {
    image = image.resize({
      width,
      height,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const outputPath = path.join(
    OUTPUT_DIR,
    `${Date.now()}_processed.jpg`
  );

  await image.jpeg({ quality: 90 }).toFile(outputPath);

  return outputPath;
};
