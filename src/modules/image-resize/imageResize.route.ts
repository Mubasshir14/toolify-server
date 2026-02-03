import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { compressImageController, convertImageController, imagesToPdfController } from "./imageResize.controller.js";

const router = Router();

router.post("/convert", upload.single("image"), convertImageController);

router.post("/compress", upload.single("image"), compressImageController);

router.post("/to-pdf", upload.array("images"), imagesToPdfController);

export const imageResizeRoutes = router;
