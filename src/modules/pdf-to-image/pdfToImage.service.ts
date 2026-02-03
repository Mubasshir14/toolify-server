import { fromPath } from "pdf2pic";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { v4 as uuid } from "uuid";

const PREVIEW_DIR = "static/pdf_to_image/previews";
const ZIP_DIR = "static/pdf_to_image/zips";

fs.mkdirSync(PREVIEW_DIR, { recursive: true });
fs.mkdirSync(ZIP_DIR, { recursive: true });

export const pdfToImageService = async (pdfPath: string) => {
  const uid = uuid();

  const converter = fromPath(pdfPath, {
    density: 200,
    format: "png",
    savePath: PREVIEW_DIR,
    saveFilename: uid
  });

  const pages = await converter.bulk(-1);

  const imageNames: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    imageNames.push(`${uid}_${i + 1}.png`);
  }

  const zipPath = path.join(ZIP_DIR, `${uid}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip");

  archive.pipe(output);
  imageNames.forEach(name =>
    archive.file(path.join(PREVIEW_DIR, name), { name })
  );
  await archive.finalize();

  return { uid, zip: `${uid}.zip`, previews: imageNames };
};
