import { exec } from "child_process";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = "processed/docx_pdf";
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

export const convertDocxToPdf = (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputDir = path.resolve(OUTPUT_DIR);

    const command = `
      soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"
    `;

    exec(command, (error) => {
      if (error) {
        reject(new Error("DOCX to PDF conversion failed"));
        return;
      }

      const pdfName =
        path.basename(inputPath, path.extname(inputPath)) + ".pdf";

      const pdfPath = path.join(outputDir, pdfName);

      if (!fs.existsSync(pdfPath)) {
        reject(new Error("PDF file not generated"));
        return;
      }

      resolve(pdfPath);
    });
  });
};
