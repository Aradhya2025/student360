import sql from "@/lib/db";

export const dynamic = "force-dynamic";

type StudentStat = { roll_no: string; full_name: string; department: string; cgpa: number };
type CourseStat  = { name: string; enrolled: number; avg_marks: number };
type DashStats   = { total_students: number; avg_cgpa: number; total_backlogs: number; graduated: number };

async function getDashboardData() {
  const [stats, topStudents, courseStats] = await Promise.all([
    sql`SELECT COUNT(*)::int          AS total_students,
               ROUND(AVG(cgpa)::NUMERIC,2) AS avg_cgpa,
               SUM(backlogs)::int     AS total_backlogs,
               SUM(CASE WHEN status='graduated' THEN 1 ELSE 0 END)::int AS graduated
        FROM v_student_academic`,
    sql`SELECT roll_no, full_name, department, cgpa
        FROM   v_student_academic
        WHERE  courses_attempted > 0
        ORDER  BY cgpa DESC NULLS LAST
        LIMIT  5`,
    sql`SELECT name, avg_marks, enrolled FROM v_course_stats ORDER BY enrolled DESC LIMIT 5`,
  ]);
  return {
    stats: stats[0] as DashStats,
    topStudents: topStudents as StudentStat[],
    courseStats: courseStats as CourseStat[],
  };
}

const Stat = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className={`rounded-2xl p-5 text-white ${color} shadow-md`}>
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-4xl font-bold mt-1">{value ?? "–"}</p>
  </div>
);

export default async function Dashboard() {
  const { stats, topStudents, courseStats } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-extrabold">Academic Dashboard</h1>
        <p className="mt-2 text-indigo-100">Real-time student & performance overview · powered by Neon PostgreSQL</p>
        <a
          href="/api/seed"
          className="mt-4 inline-block bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
        >
          ⚡ Initialize / Re-seed Database
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Students"   value={stats?.total_students ?? 0} color="bg-indigo-500" />
        <Stat label="Average CGPA"     value={stats?.avg_cgpa ?? 0}       color="bg-violet-500" />
        <Stat label="Total Backlogs"   value={stats?.total_backlogs ?? 0} color="bg-rose-500"   />
        <Stat label="Graduated"        value={stats?.graduated ?? 0}      color="bg-emerald-500" />
      </div>

      {/* Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4 text-indigo-700">🏆 Top Performers</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b">
                <th className="pb-2">Roll No</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Dept</th>
                <th className="pb-2 text-right">CGPA</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((s) => (
                <tr key={s.roll_no} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 font-mono text-xs text-slate-500">{s.roll_no}</td>
                  <td className="py-2 font-medium">{s.full_name}</td>
                  <td className="py-2 text-slate-500">{s.department}</td>
                  <td className="py-2 text-right font-bold text-indigo-600">{s.cgpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4 text-violet-700">📚 Course Overview</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b">
                <th className="pb-2">Course</th>
                <th className="pb-2 text-right">Enrolled</th>
                <th className="pb-2 text-right">Avg Marks</th>
              </tr>
            </thead>
            <tbody>
              {courseStats.map((c) => (
                <tr key={c.name} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2 text-right text-slate-500">{c.enrolled}</td>
                  <td className="py-2 text-right font-bold text-violet-600">{c.avg_marks ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
