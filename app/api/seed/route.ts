import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const schema = readFileSync(join(process.cwd(), "lib", "schema.sql"), "utf8");

  // Use Pool for multi-statement execution
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(schema);
    return NextResponse.json({ ok: true, message: "Schema seeded successfully ✓" });
  } finally {
    client.release();
    await pool.end();
  }
}
