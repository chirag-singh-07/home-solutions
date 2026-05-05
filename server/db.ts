import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;
const looksLocalDatabase =
  !connectionString ||
  /localhost|127\.0\.0\.1/i.test(connectionString) ||
  /sslmode=disable/i.test(connectionString);

export const pool = new pg.Pool({
  connectionString,
  ssl: looksLocalDatabase
    ? false
    : {
        rejectUnauthorized: false,
      },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || "15000", 10),
});


export const db = drizzle(pool, { schema });
