import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/grades?student_id=1
export async function GET(req: Request) {
  const sid = new URL(req.url).searchParams.get("student_id");
  if (!sid) return NextResponse.json({ error: "student_id required" }, { status: 400 });

  const grades = await sql`
    SELECT g.id, c.code, c.name AS course, g.marks, g.grade, g.exam_date
    FROM   grades  g
    JOIN   courses c ON c.id = g.course_id
    WHERE  g.student_id = ${sid}
    ORDER  BY c.code`;

  return NextResponse.json(grades);
}

// POST /api/grades  { student_id, course_id, marks }
export async function POST(req: Request) {
  const { student_id, course_id, marks } = await req.json();
  // Call PL/pgSQL stored procedure
  await sql`CALL sp_enrol_student(${student_id}, ${course_id}, ${marks})`;
  return NextResponse.json({ ok: true }, { status: 201 });
}
