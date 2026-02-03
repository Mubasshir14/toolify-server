import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { removeBackground } from "@imgly/background-removal-node";

const BASE_DIR = "static/bgremove";
const PREVIEW_DIR = path.join(BASE_DIR, "preview");
const FINAL_DIR = path.join(BASE_DIR, "final");

fs.mkdirSync(PREVIEW_DIR, { recursive: true });
fs.mkdirSync(FINAL_DIR, { recursive: true });

type BgType = "transparent" | "color" | "image";

export const bgRemoveService = async (
  imagePath: string,
  bgType: BgType,
  bgColor?: string,
  bgImagePath?: string
) => {
  const uid = uuid();

  const previewPath = path.join(PREVIEW_DIR, `${uid}_preview.png`);
  const finalPath = path.join(FINAL_DIR, `${uid}_final.png`);

  // 🔹 Remove background
  const inputBuffer = fs.readFileSync(imagePath);
  const removedBuffer = await removeBackground(inputBuffer);

  // Save preview (transparent)
  await sharp(removedBuffer as any).png().toFile(previewPath);

  let finalImage = sharp(removedBuffer as any);

  // 🔹 Solid color background
  if (bgType === "color" && bgColor) {
    const meta = await sharp(removedBuffer as any).metadata();

    const bg = sharp({
      create: {
        width: meta.width!,
        height: meta.height!,
        channels: 4,
        background: bgColor
      }
    });

    finalImage = bg.composite([
      { input: removedBuffer as any, blend: "over" }
    ]);
  }

  // 🔹 Image background
  if (bgType === "image" && bgImagePath) {
    const fgMeta = await sharp(removedBuffer as any).metadata();

    const bg = sharp(bgImagePath).resize(
      fgMeta.width!,
      fgMeta.height!
    );

    finalImage = bg.composite([
      { input: removedBuffer as any, blend: "over" }
    ]);
  }

  await finalImage.png().toFile(finalPath);

  return {
    preview: `/static/bgremove/preview/${uid}_preview.png`,
    final: `/static/bgremove/final/${uid}_final.png`
  };
};
