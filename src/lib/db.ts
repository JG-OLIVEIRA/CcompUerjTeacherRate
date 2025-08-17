
import 'server-only';
import { Pool } from 'pg';

// The Pool instance will be created only once and reused across all server function calls.
// Next.js automatically loads environment variables from a .env file.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '', // Fallback to an empty string
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Recommended for production, disabled for local
});

export const db = {
    query: (text: string, params: any[]) => pool.query(text, params),
};
