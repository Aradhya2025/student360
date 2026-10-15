"use client";
import { useState, useEffect } from "react";

type Student = { student_id: number; roll_no: string; full_name: string; department: string };
type Course  = { id: number; code: string; name: string };
type Grade   = { code: string; course: string; marks: number; grade: string; exam_date: string };

export default function GradesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [form, setForm] = useState({ course_id: "", marks: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/students").then(r => r.json()),
      fetch("/api/courses").then(r => r.json()),
    ]).then(([s, c]) => {
      setStudents(s.students ?? []);
      setCourses(c ?? []);
    });
  }, []);

  const loadGrades = async (sid: string) => {
    setSelectedStudent(sid);
    if (!sid) { setGrades([]); return; }
    const data = await fetch(`/api/grades?student_id=${sid}`).then(r => r.json());
    setGrades(Array.isArray(data) ? data : []);
  };

  const submitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: Number(selectedStudent), course_id: Number(form.course_id), marks: Number(form.marks) }),
    });
    setMsg(res.ok ? "Grade saved!" : "Error saving grade");
    if (res.ok) loadGrades(selectedStudent);
  };

  const gradeBadge: Record<string, string> = {
    "A+": "bg-emerald-100 text-emerald-700",
    "A":  "bg-green-100 text-green-700",
    "B+": "bg-sky-100 text-sky-700",
    "B":  "bg-blue-100 text-blue-700",
    "C":  "bg-amber-100 text-amber-700",
    "F":  "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">Grades Management</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Grade Entry */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-indigo-700">Record / Update Grade</h2>
          <form onSubmit={submitGrade} className="space-y-3">
            <label className="flex flex-col gap-1 text-sm text-slate-700 font-medium">
              Student
              <select
                value={selectedStudent}
                onChange={e => loadGrades(e.target.value)}
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select student…</option>
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.roll_no} – {s.full_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-700 font-medium">
              Course
              <select
                value={form.course_id}
                onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select course…</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-700 font-medium">
              Marks (0–100)
              <input
                type="number" min="0" max="100" step="0.01"
                value={form.marks}
                onChange={e => setForm(f => ({ ...f, marks: e.target.value }))}
                required
                placeholder="e.g. 85.5"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>

            {msg && <p className="text-sm text-indigo-600 font-medium">{msg}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Save Grade (via PL/pgSQL)
            </button>
          </form>
        </div>

        {/* Grade View */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-indigo-700 mb-4">Grade History</h2>
          {grades.length === 0 ? (
            <p className="text-slate-400 text-sm">Select a student to view grades.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Course</th>
                  <th className="pb-2 text-right">Marks</th>
                  <th className="pb-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(g => (
                  <tr key={g.code} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 font-mono text-xs text-slate-500">{g.code}</td>
                    <td className="py-2">{g.course}</td>
                    <td className="py-2 text-right font-bold">{g.marks}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeBadge[g.grade?.trim()] ?? ""}`}>
                        {g.grade?.trim()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
