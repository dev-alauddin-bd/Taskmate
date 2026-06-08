import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import Link from "next/link";
import {
  CheckSquare,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // ✅ logged in user redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ================= NAVBAR ================= */}
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
              href="/login"
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

      {/* ================= HERO ================= */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[var(--primary)]/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-4xl space-y-6">

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight">
            Manage your projects with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-blue-500">
              Intelligent Collaboration
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            A smart, unified platform for teams to plan, track, and execute tasks seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">

            <Link
              href="/login"
              className="btn btn-primary px-8 py-3 flex items-center gap-2"
            >
              Start for free <ArrowRight size={18} />
            </Link>

            <Link
              href="/login"
              className="btn btn-outline px-8 py-3"
            >
              Try Demo Login
            </Link>

          </div>
        </div>

        {/* ================= FEATURES ================= */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-32">

          <div className="glass-panel p-6 rounded-xl">
            <CheckSquare className="mb-3 text-[var(--primary)]" />
            <h3 className="font-bold">Task Management</h3>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Organize tasks with priorities and deadlines.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <Users className="mb-3 text-[var(--success)]" />
            <h3 className="font-bold">Role-Based Access</h3>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Admin, Manager & Team roles control access.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <BarChart3 className="mb-3 text-blue-500" />
            <h3 className="font-bold">Productivity Insights</h3>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Track performance and project progress.
            </p>
          </div>

        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--text-muted)]">
        © {new Date().getFullYear()} Taskmate – All rights reserved
      </footer>

    </div>
  );
}