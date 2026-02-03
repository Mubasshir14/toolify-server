import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI as string,
  RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW || 15),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 100),
};
