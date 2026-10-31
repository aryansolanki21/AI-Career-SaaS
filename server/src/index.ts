import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDB, pool } from "./config/db.js";
import { errorHandler } from "./middlewares/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import resumeAnalysisRoutes from "./routes/resumeAnalysis.routes.js";
import jobMatcherRoutes from "./routes/jobMatcher.routes.js";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

app.disable("x-powered-by");

app.use(cors({ origin: CLIENT_URL }));

// 7 MB covers a 5 MB PDF sent as base64 (resume analysis).
app.use(express.json({ limit: "7mb" }));
app.use(express.urlencoded({ extended: true, limit: "7mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/user", authRoutes);
app.use("/api/ai", resumeAnalysisRoutes);
app.use("/api/ai", jobMatcherRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);

    await pool.end();
    process.exitCode = 1;
  }
};

void startServer();
