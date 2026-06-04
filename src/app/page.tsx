import { getServerSession } from "next-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckSquare, Users, BarChart3, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-[var(--primary)]" />
          <span className="text-xl font-bold tracking-tight">Taskmate</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">
            Log in
          </Link>
          <ThemeToggle />
          <Link href="/signup" className="btn btn-primary btn-sm">
            Get Started
          </Link>
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