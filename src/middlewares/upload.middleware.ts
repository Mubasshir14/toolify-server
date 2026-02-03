import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  }
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});
