import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export const connectDB = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    console.log("Connected to PostgreSQL successfully.");
  } finally {
    client.release();
  }
};
