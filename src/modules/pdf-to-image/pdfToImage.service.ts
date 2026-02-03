import fs from "fs";
import path from "path";
import archiver from "archiver";
import { v4 as uuid } from "uuid";
import os from "os";
import { execa } from "execa";

const PREVIEW_DIR = "static/pdf_to_image/previews";
const ZIP_DIR = "static/pdf_to_image/zips";

fs.mkdirSync(PREVIEW_DIR, { recursive: true });
fs.mkdirSync(ZIP_DIR, { recursive: true });

export const pdfToImageService = async (pdfPath: string) => {
  const uid = uuid();
  const outputPrefix = path.join(PREVIEW_DIR, uid);

  const PDFTOPPM =
    os.platform() === "win32" ? "pdftoppm.exe" : "pdftoppm";

  // ✅ THIS is the key: no stdin, no EOF
  await execa(
    PDFTOPPM,
    [
      "-png",
      "-r",
      "200",
      pdfPath,
      outputPrefix,
    ],
    {
      stdio: "ignore",
    }
  );

  // collect generated images
  const files = fs
    .readdirSync(PREVIEW_DIR)
    .filter((f) => f.startsWith(uid) && f.endsWith(".png"));

  const zipPath = path.join(ZIP_DIR, `${uid}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip");

  archive.pipe(output);
  files.forEach((file) =>
    archive.file(path.join(PREVIEW_DIR, file), { name: file })
  );

  await archive.finalize();

  return {
    uid,
    zip: `${uid}.zip`,
    previews: files,
  };
};
