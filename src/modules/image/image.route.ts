import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { compressImageCtrl, convertImageCtrl } from "./image.controller.js";


const router = Router();

router.post(
  "/convert",
  upload.single("image"),
  convertImageCtrl
);

router.post(
  "/compress",
  upload.single("image"),
  compressImageCtrl
);

export const imageRoutes = router;
