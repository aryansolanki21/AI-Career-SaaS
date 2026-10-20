import "dotenv/config";
import express from "express";
import { connectDB, pool } from "./config/db.js";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

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
}

void startServer();

