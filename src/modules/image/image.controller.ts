import type { Request, Response } from "express";
import { compressImage, convertImage } from "./image.service.js";
import { safeUnlink } from "../../utils/file.util.js";

export const convertImageCtrl = async (req: Request, res: Response) => {
  const file = req.file!;
  const { targetFormat } = req.body;

  const output = await convertImage(file.path, targetFormat);
  safeUnlink(file.path);

  res.download(output);
};

export const compressImageCtrl = async (req: Request, res: Response) => {
  const file = req.file!;
  const { quality } = req.body;

  const output = await compressImage(file.path, Number(quality));
  safeUnlink(file.path);

  res.download(output);
};
