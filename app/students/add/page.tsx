"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddStudentPage() {
  const router = useRouter();
  const [depts, setDepts] = useState<{ id: number; name: string; code: string }[]>([]);
  const [form, setForm] = useState({
    roll_no: "", first_name: "", last_name: "", email: "",
    dob: "", dept_id: "", semester: "1",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/departments").then(r => r.json()).then(setDepts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dept_id: Number(form.dept_id), semester: Number(form.semester) }),
    });
    if (res.ok) {
      setStatus("success");
      setMsg("Student added successfully!");
      setTimeout(() => router.push("/students"), 1200);
    } else {
      const data = await res.json();
      setStatus("error");
      setMsg(data.error ?? "Something went wrong");
    }
  };

  const field = (label: string, name: keyof typeof form, type = "text", extra?: object) => (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        required
        className="mt-0.5 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        {...extra}
      />
    </label>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">Add New Student</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {field("First Name", "first_name")}
          {field("Last Name",  "last_name")}
        </div>
        {field("Roll Number", "roll_no", "text", { placeholder: "e.g. CS2401" })}
        {field("Email",        "email",   "email")}
        {field("Date of Birth","dob",    "date")}

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Department
          <select
            value={form.dept_id}
            onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}
            required
            className="mt-0.5 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select…</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Semester
          <select
            value={form.semester}
            onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
            className="mt-0.5 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </label>

        {msg && (
          <p className={`text-sm font-medium ${status === "success" ? "text-emerald-600" : "text-rose-600"}`}>{msg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "Saving…" : "Add Student"}
        </button>
      </form>
    </div>
  );
}
