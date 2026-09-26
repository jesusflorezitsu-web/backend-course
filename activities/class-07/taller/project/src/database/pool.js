// Single shared pool for the whole process. Every module that needs the
// database imports this pool; nobody creates their own.
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

// Fail early with an actionable message instead of a cryptic error on the
// first query minutes later.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});