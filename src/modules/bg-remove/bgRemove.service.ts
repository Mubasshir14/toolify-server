import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { spawn } from "child_process";

type Input = {
  image: Express.Multer.File;
  bgType: "transparent" | "color" | "image";
  bgColor?: string;
  bgImage?: Express.Multer.File;
};

const getFileBuffer = async (file: Express.Multer.File) => {
  if (file.buffer) return file.buffer;
  if (file.path) return fs.promises.readFile(file.path);
  throw new Error("Invalid uploaded file");
};

/* --------------------------- */
/* Node 23 safe rembg process  */
/* --------------------------- */
const runRembg = async (inputBuffer: Buffer) => {
  const tmpId = uuid();
  const tmpInput = path.join(process.cwd(), "uploads", `${tmpId}-in.png`);
  const tmpOutput = path.join(process.cwd(), "uploads", `${tmpId}-out.png`);

  await fs.promises.writeFile(tmpInput, inputBuffer);

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("rembg", ["i", tmpInput, tmpOutput]);
    const errChunks: Buffer[] = [];

    proc.stderr.on("data", (d) => errChunks.push(d));
    proc.on("error", reject);

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            errChunks.length ? Buffer.concat(errChunks).toString() : "rembg failed"
          )
        );
      }
      resolve();
    });
  });

  const outputBuffer = await fs.promises.readFile(tmpOutput);

  // clean temp files
  fs.promises.unlink(tmpInput).catch(() => {});
  fs.promises.unlink(tmpOutput).catch(() => {});

  return outputBuffer;
};

/* --------------------------- */
/* main processImage function  */
/* --------------------------- */
export const processImage = async ({
  image,
  bgType,
  bgColor,
  bgImage
}: Input) => {
  const uploadDir = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const id = uuid();
  const previewPath = path.join(uploadDir, `${id}-preview.png`);
  const finalPath = path.join(uploadDir, `${id}-final.png`);

  // 1️⃣ read main image
  const inputBuffer = await getFileBuffer(image);

  // 2️⃣ normalize via sharp
  const normalized = await sharp(inputBuffer, { limitInputPixels: 4096 * 4096 })
    .ensureAlpha()
    .png()
    .toBuffer();

  // 3️⃣ remove background via rembg (temp file)
  const cutBuffer = await runRembg(normalized);

  // 4️⃣ save preview (transparent)
  await fs.promises.writeFile(previewPath, cutBuffer);

  // 5️⃣ final output
  if (bgType === "transparent") {
    await fs.promises.writeFile(finalPath, cutBuffer);
  }

  if (bgType === "color") {
    const meta = await sharp(cutBuffer).metadata();
    const bg = await sharp({
      create: {
        width: meta.width || 512,
        height: meta.height || 512,
        channels: 4,
        background: bgColor || "#ffffff"
      }
    }).png().toBuffer();

    await sharp(bg)
      .composite([{ input: cutBuffer }])
      .png()
      .toFile(finalPath);
  }

  if (bgType === "image") {
    if (!bgImage) throw new Error("Background image missing");
    const fgMeta = await sharp(cutBuffer).metadata();
    const bgBuffer = await getFileBuffer(bgImage);

    const resizedBg = await sharp(bgBuffer)
      .resize(fgMeta.width, fgMeta.height, { fit: "cover" })
      .png()
      .toBuffer();

    await sharp(resizedBg)
      .composite([{ input: cutBuffer }])
      .png()
      .toFile(finalPath);
  }

  return {
    preview: `/uploads/${path.basename(previewPath)}`,
    final: `/uploads/${path.basename(finalPath)}`
  };
};
