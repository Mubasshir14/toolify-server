import { Router } from "express";
import path from "path";
import fs from "fs";
import { upload } from "../../middlewares/upload.middleware.js";
import { pdfToImageController } from "./pdfToImage.controller.js";

const router = Router();

router.post("/to-image", upload.single("pdf"), pdfToImageController);

router.get("/preview/:name", (req, res) => {
  const p = path.join("static/pdf_to_image/previews", req.params.name);
  if (!fs.existsSync(p)) return res.sendStatus(404);
  res.sendFile(path.resolve(p));
});

router.get("/download/:zip", (req, res) => {
  const p = path.join("static/pdf_to_image/zips", req.params.zip);
  if (!fs.existsSync(p)) return res.sendStatus(404);
  res.download(p, "images.zip");
});

export const pdfTOImageRoutes = router;
