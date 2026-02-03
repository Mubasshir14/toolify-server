import { Router } from "express";
import { imageRoutes } from "./modules/image/image.route.js";
import { bgRemoverRoutes } from "./modules/bg-remove/bgRemove.route.js";
import { imageResizeRoutes } from "./modules/image-resize/imageResize.route.js";
import { pdfRoutes } from "./modules/pdf/pdf.route.js";
import { pdfTOImageRoutes } from "./modules/pdf-to-image/pdfToImage.route.js";
import { docxToPdfRoutes } from "./modules/docx-to-pdf/docxToPdf.routes.js";

const router = Router();

const moduleRoutes = [
  {
    path: "/image",
    route: imageRoutes,
  },
  {
    path: "/image",
    route: bgRemoverRoutes,
  },
  {
    path: "/image",
    route: imageResizeRoutes,
  },
  {
    path: "/pdf",
    route: pdfRoutes,
  },
  {
    path: "/pdf",
    route: pdfTOImageRoutes,
  },
  {
    path: "/",
    route: docxToPdfRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
