import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import {
  compressPdfController,
  mergePdfController,
  pdfMetadataController,
  splitPdfController,
} from "./pdf.controller.js";

const router = Router();

router.post("/split", upload.single("pdf"), splitPdfController);
router.post(
  "/merge",
  upload.fields([
    { name: "pdf1", maxCount: 1 },
    { name: "pdf2", maxCount: 1 },
  ]),
  mergePdfController,
);
router.post("/compress", upload.single("pdf"), compressPdfController);
router.post("/metadata", upload.single("pdf"), pdfMetadataController);

export const pdfRoutes = router;
