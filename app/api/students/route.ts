import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [students, stats] = await Promise.all([
    sql`SELECT * FROM v_student_academic ORDER BY roll_no`,
    sql`SELECT COUNT(*) AS total,
               ROUND(AVG(cgpa)::NUMERIC,2) AS avg_cgpa,
               SUM(backlogs) AS total_backlogs
        FROM   v_student_academic`,
  ]);
  return NextResponse.json({ students, stats: stats[0] });
}

export async function POST(req: Request) {
  const { roll_no, first_name, last_name, email, dob, dept_id, semester } =
    await req.json();

  const [student] = await sql`
    INSERT INTO students (roll_no, first_name, last_name, email, dob, dept_id, semester)
    VALUES (${roll_no}, ${first_name}, ${last_name}, ${email},
            ${dob || null}, ${dept_id}, ${semester ?? 1})
    ON CONFLICT (roll_no) DO NOTHING
    RETURNING *`;
  return NextResponse.json(student ?? { error: "Duplicate roll_no" }, {
    status: student ? 201 : 409,
  });
}
