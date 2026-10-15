import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const courses = await sql`SELECT * FROM v_course_stats ORDER BY code`;
  return NextResponse.json(courses);
}
