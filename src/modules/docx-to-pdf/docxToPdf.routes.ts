import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { docxToPdfController } from "./docxToPdf.controller.js";

const router = Router();

router.post(
  "/docx-to-pdf",
  upload.single("docx"),
  docxToPdfController
);

export const docxToPdfRoutes = router;
