import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/departments
export async function GET() {
  const depts = await sql`SELECT id, name, code FROM departments ORDER BY name`;
  return NextResponse.json(depts);
}
