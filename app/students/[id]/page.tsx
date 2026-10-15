import sql from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type StudentProfile = {
  roll_no: string; full_name: string; email: string; department: string;
  semester: number; status: string; cgpa: number; backlogs: number; courses_attempted: number;
};
type GradeRow = {
  code: string; course: string; credits: number; marks: number; grade: string; exam_date: string;
};

const gradeBadge: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700",
  "A":  "bg-green-100 text-green-700",
  "B+": "bg-sky-100 text-sky-700",
  "B":  "bg-blue-100 text-blue-700",
  "C":  "bg-amber-100 text-amber-700",
  "F":  "bg-rose-100 text-rose-700",
};

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [studentRows, grades] = await Promise.all([
    sql`SELECT * FROM v_student_academic WHERE student_id = ${id}`,
    sql`SELECT g.marks, g.grade, g.exam_date, c.code, c.name AS course, c.credits
        FROM grades g JOIN courses c ON c.id = g.course_id
        WHERE g.student_id = ${id} ORDER BY c.code`,
  ]);

  if (!studentRows.length) notFound();
  const s = studentRows[0] as StudentProfile;
  const gradeList = grades as GradeRow[];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {s.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{s.full_name}</h1>
          <p className="text-indigo-100">{s.roll_no} · {s.department}</p>
          <p className="text-indigo-100 text-sm">{s.email}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-4xl font-extrabold">{s.cgpa ?? "—"}</p>
          <p className="text-indigo-200 text-xs">CGPA</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Semester", val: s.semester },
          { label: "Courses",  val: s.courses_attempted },
          { label: "Backlogs", val: s.backlogs },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl shadow py-4">
            <p className="text-2xl font-bold text-indigo-700">{m.val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Grades */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4 text-indigo-700">Academic Record</h2>
        {gradeList.length === 0 ? (
          <p className="text-slate-400 text-sm">No grades recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b">
                <th className="pb-2">Code</th>
                <th className="pb-2">Course</th>
                <th className="pb-2 text-center">Credits</th>
                <th className="pb-2 text-right">Marks</th>
                <th className="pb-2 text-center">Grade</th>
                <th className="pb-2 text-right">Exam Date</th>
              </tr>
            </thead>
            <tbody>
              {gradeList.map((g) => (
                <tr key={g.code} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 font-mono text-xs text-slate-500">{g.code}</td>
                  <td className="py-2 font-medium">{g.course}</td>
                  <td className="py-2 text-center text-slate-500">{g.credits}</td>
                  <td className="py-2 text-right font-bold">{g.marks}</td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeBadge[g.grade?.trim()] ?? ""}`}>
                      {g.grade?.trim()}
                    </span>
                  </td>
                  <td className="py-2 text-right text-slate-400 text-xs">{String(g.exam_date).slice(0,10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
