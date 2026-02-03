import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI as string,
  RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW) || 15,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
};

// Safety check (recommended)
if (!ENV.MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}
