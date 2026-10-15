import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student360 – Academic Management",
  description: "Production-ready student information & academic performance system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <nav className="sticky top-0 z-50 bg-indigo-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-14">
            <img src="/logo.svg" alt="Student360" className="h-8 w-8" />
            <span className="text-white font-bold text-lg tracking-tight">Student360</span>
            <div className="ml-auto flex gap-6 text-sm font-medium text-indigo-100">
              <a href="/"          className="hover:text-white transition-colors">Dashboard</a>
              <a href="/students"  className="hover:text-white transition-colors">Students</a>
              <a href="/courses"   className="hover:text-white transition-colors">Courses</a>
              <a href="/grades"    className="hover:text-white transition-colors">Grades</a>
              <a href="/report.html" target="_blank" className="hover:text-white transition-colors">📄 Report</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
