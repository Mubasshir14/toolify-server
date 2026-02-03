import { Router } from "express";
import path from "path";
import fs from "fs";
import { upload } from "../../middlewares/upload.middleware.js";
import { pdfToImageController } from "./pdfToImage.controller.js";

const router = Router();

router.post("/to-image", upload.single("pdf"), pdfToImageController);

router.get("/preview/:name", (req, res) => {
  const imagePath = path.join(
    process.cwd(),
    "static/pdf_to_image/previews",
    req.params.name
  );

  if (!fs.existsSync(imagePath)) {
    return res.sendStatus(404);
  }
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");

  return res.sendFile(imagePath);
});

router.get("/download/:zip", (req, res) => {
  const zipPath = path.join(
    process.cwd(),
    "static/pdf_to_image/zips",
    req.params.zip
  );

  if (!fs.existsSync(zipPath)) {
    return res.sendStatus(404);
  }

  return res.download(zipPath, "images.zip");
});

export const pdfTOImageRoutes = router;
