import fs from "fs";
import path from "path";

export const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export const safeUnlink = (filePath: string) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const getSafePath = (...segments: string[]) => {
  return path.resolve(...segments);
};
