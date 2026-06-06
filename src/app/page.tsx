import { getServerSession } from "next-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckSquare, Users, BarChart3, ArrowRight } from "lucide-react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = session.user.role;
    if (role === "ADMIN") {
      redirect("/admin");
    } else if (role === "PROJECT_MANAGER" || role === "MANAGER") {
      redirect("/manager");
    } else {
      redirect("/member");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
    {/* Navbar */}
<header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-2xl">
  <div className="mx-auto flex container items-center justify-between px-4 sm:px-6 lg:px-8 py-3">

    {/* LEFT - Logo */}
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--primary)]/20 blur-lg rounded-xl group-hover:scale-110 transition" />
        <div className="relative p-2 rounded-xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition">
          <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
        </div>
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight">
          Taskmate
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">
          Smart Task Management
        </span>
      </div>
    </Link>

    {/* RIGHT - Actions */}
  <div className="flex items-center gap-2 sm:gap-4">

  {/* Auth Links Group */}
  <div className="flex items-center gap-2">
    <Link
      href="/login"
      className="hidden sm:flex text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition"
    >
      Log in
    </Link>

    <div className="hidden sm:block w-px h-5 bg-[var(--border)]" />

    <Link
      href="/signup"
      className="hidden sm:flex text-sm font-medium px-3 py-2 rounded-lg text-[var(--primary)] hover:bg-[var(--surface-hover)] transition"
    >
      Sign up
    </Link>
  </div>

  {/* Divider (desktop only) */}
  <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />

  {/* Utilities Group */}
  <div className="flex items-center gap-2">
    <ThemeToggle />
    <LocaleSwitcher />
  </div>

  {/* CTA Button (Primary Action) */}
  <Link
    href="/signup"
    className="relative group overflow-hidden btn btn-primary btn-sm px-4 sm:px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
  >
    <span className="relative z-10 flex items-center gap-2">
      Get Started
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
    </span>

    {/* glow effect */}
    <span className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-blue-500 opacity-0 group-hover:opacity-100 transition" />
  </Link>

</div>
  </div>
</header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary)]/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--foreground)] drop-shadow-sm">
            Manage your projects with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-blue-500">Intelligent Collaboration</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
            A smart, unified platform for teams to plan, track, and execute tasks seamlessly. Built for modern workflows with powerful role-based access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="btn btn-primary px-8 py-3 text-lg flex items-center gap-2">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn btn-outline px-8 py-3 text-lg">
              Try Demo Login
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 text-left">
          <div className="glass-panel p-8 rounded-2xl shadow-sm border-t-4 border-t-[var(--primary)] transition-transform hover:-translate-y-1 duration-300">
            <div className="bg-[var(--primary)]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <CheckSquare className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Task Management</h3>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Organize tasks with priorities, deadlines, and statuses. Built-in validation prevents duplicates and scheduling conflicts.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl shadow-sm border-t-4 border-t-[var(--success)] transition-transform hover:-translate-y-1 duration-300">
            <div className="bg-[var(--success)]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-[var(--success)]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Role-Based Access</h3>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Secure collaboration with Admin, Project Manager, and Team Member roles. Control exactly who sees and edits what.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl shadow-sm border-t-4 border-t-blue-500 transition-transform hover:-translate-y-1 duration-300">
            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Productivity Insights</h3>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Monitor team workload, track overdue tasks, and view project progress in a beautiful, real-time dashboard.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
        <p>&copy; {new Date().getFullYear()} Taskmate – Your Daily Task Companion. All rights reserved.</p>
      </footer>
    </div>
  );
}