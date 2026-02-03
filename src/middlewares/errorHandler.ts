import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("❌ ERROR:", err);

  return res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error"
  });
};
