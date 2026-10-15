import sql from "@/lib/db";

export const dynamic = "force-dynamic";

type CourseRow = {
  id: number; code: string; name: string; department: string;
  credits: number; semester: number; enrolled: number; avg_marks: number;
  highest: number; lowest: number;
};

export default async function CoursesPage() {
  const courses = (await sql`SELECT * FROM v_course_stats ORDER BY code`) as CourseRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">Courses</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow p-5 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{c.code}</span>
                <h3 className="font-semibold mt-1">{c.name}</h3>
                <p className="text-xs text-slate-400">{c.department} · Sem {c.semester}</p>
              </div>
              <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{c.credits} cr</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-50">
              <div>
                <p className="text-lg font-bold text-indigo-600">{c.enrolled}</p>
                <p className="text-xs text-slate-400">Enrolled</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">{c.avg_marks ?? "–"}</p>
                <p className="text-xs text-slate-400">Avg Marks</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{c.highest ?? "–"}</p>
                <p className="text-xs text-slate-400">Highest</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
