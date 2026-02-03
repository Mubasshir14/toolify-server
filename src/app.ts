import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import router from "./routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiRateLimiter);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Toolify API running 🚀",
  });
});

app.use(
  "/static",
  express.static(path.join(process.cwd(), "static"), {
    index: false,
    maxAge: "1h",
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    },
  }),
);


app.use("/api", router);
app.use(errorHandler);

export default app;
