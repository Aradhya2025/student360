import sql from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type StudentRow = {
  student_id: number; roll_no: string; full_name: string; department: string;
  semester: number; status: string; courses_attempted: number; cgpa: number; backlogs: number;
};

export default async function StudentsPage() {
  const students = (await sql`SELECT * FROM v_student_academic ORDER BY roll_no`) as StudentRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">Students</h1>
        <Link
          href="/students/add"
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
        >
          + Add Student
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-left">
            <tr>
              {["Roll No","Name","Department","Semester","Status","Courses","CGPA","Backlogs"].map(h => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.student_id} className="border-t hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.roll_no}</td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/students/${s.student_id}`} className="text-indigo-600 hover:underline">
                    {s.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{s.department}</td>
                <td className="px-4 py-3 text-center">{s.semester}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'graduated' ? 'bg-violet-100 text-violet-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-center">{s.courses_attempted}</td>
                <td className="px-4 py-3 text-center font-bold text-indigo-600">{s.cgpa ?? "–"}</td>
                <td className="px-4 py-3 text-center">
                  {s.backlogs > 0
                    ? <span className="text-rose-600 font-bold">{s.backlogs}</span>
                    : <span className="text-emerald-500">✓</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="text-center py-12 text-slate-400">No students yet. Seed the database first.</p>
        )}
      </div>
    </div>
  );
}
