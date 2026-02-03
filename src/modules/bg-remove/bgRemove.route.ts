import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { bgRemoveController } from "./bgRemove.controller.js";

const router = Router();

router.post(
  "/bgremove",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
  ]),
  bgRemoveController,
);

export const bgRemoverRoutes = router;
