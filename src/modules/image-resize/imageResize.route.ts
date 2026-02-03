import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { resizeImageCtrl } from "./imageResize.controller.js";
import path from "path";
import fs from "fs";

const router = Router();

/**
 * Resize image (returns preview + download URLs)
 */
router.post(
  "/resize",
  upload.single("image"),
  resizeImageCtrl
);

/**
 * Preview resized image
 */
router.get("/preview/:name", (req, res) => {
  const filePath = path.join(
    process.cwd(),
    "processed/images",
    req.params.name
  );

  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }

  // 🔥 required for browser preview
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");

  return res.sendFile(filePath);
});

/**
 * Download resized image
 */
router.get("/download/:name", (req, res) => {
  const filePath = path.join(
    process.cwd(),
    "processed/images",
    req.params.name
  );

  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }

  return res.download(filePath);
});

export const imageResizeRoutes = router;
