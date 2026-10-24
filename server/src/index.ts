import "dotenv/config";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { connectDB, pool } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/user", authRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Request error:", error);

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
};

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
