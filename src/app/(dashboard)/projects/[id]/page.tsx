import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ProjectTasksView } from "@/components/ProjectTasksView";
import Link from "next/link";

export default async function ProjectDetailsPage({
  params,
}: {
  params: { id?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: String(id) },
    include: {
      manager: { select: { name: true, email: true } },
      tasks: {
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Calculate project metrics
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = project.tasks.filter((t) => t.status === "TODO").length;
  const overdueTasks = project.tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "COMPLETED"
  ).length;

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status color mappings
  const statusThemeMap = {
    ACTIVE: {
      border: "border-indigo-500",
      bg: "bg-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-400",
      label: "Active"
    },
    COMPLETED: {
      border: "border-green-500",
      bg: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
      label: "Completed"
    },
    ON_HOLD: {
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      label: "On Hold"
    }
  };

  const currentTheme = statusThemeMap[project.status as keyof typeof statusThemeMap] || statusThemeMap.ACTIVE;

  // Initials for Manager Avatar
  const managerInitials = project.manager.name
    ? project.manager.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PM";

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>
        <span className="text-xs text-[var(--text-muted)] font-mono">ID: {project.id}</span>
      </div>

      {/* PROJECT HEADER CARD */}
      <div className={`glass-panel p-6 md:p-8 rounded-2xl border-t-4 ${currentTheme.border} shadow-lg transition-all duration-300`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
                {project.name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${currentTheme.bg} ${currentTheme.text}`}>
                {currentTheme.label}
              </span>
            </div>
            
            {project.description ? (
              <p className="text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
                {project.description}
              </p>
            ) : (
              <p className="text-sm italic text-[var(--text-muted)]/60">
                No description provided for this project.
              </p>
            )}
          </div>

          {/* Quick Date Badge */}
          <div className="flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border)] p-3.5 rounded-xl text-sm w-full md:w-auto shrink-0 shadow-sm">
            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Deadline Date</p>
              <p className="font-semibold text-[var(--foreground)] mt-0.5">
                {format(new Date(project.deadline), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS ROW (HORIZONTAL GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Widget */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-base text-[var(--foreground)]">Project Progress</h3>
              <span className="text-xl font-black text-[var(--primary)]">{progressPercent}%</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Overall completion of tasks</p>
          </div>
          
          <div className="space-y-3">
            <div className="w-full bg-[var(--surface-hover)] rounded-full h-3 overflow-hidden border border-[var(--border)]/50">
              <div 
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-[var(--text-muted)] font-medium">
              <span>{completedTasks} of {totalTasks} Tasks Done</span>
              <span>{totalTasks - completedTasks} Left</span>
            </div>
          </div>
        </div>

        {/* Stats KPI Breakdown Widget */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="font-bold text-base text-[var(--foreground)]">Task Breakdown</h3>
            <p className="text-xs text-[var(--text-muted)]">Task status distribution overview</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider block">To Do</span>
              <span className="text-xl font-bold text-[var(--foreground)] block mt-1">{todoTasks}</span>
            </div>

            <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider block">Progress</span>
              <span className="text-xl font-bold text-[var(--primary)] block mt-1">{inProgressTasks}</span>
            </div>

            <div className="bg-[var(--danger)]/5 border border-[var(--danger)]/20 p-2.5 rounded-xl text-center">
              <span className="text-[10px] text-[var(--danger)] font-bold uppercase tracking-wider block">Overdue</span>
              <span className="text-xl font-bold text-[var(--danger)] block mt-1">{overdueTasks}</span>
            </div>
          </div>
        </div>

        {/* Manager Info Card Widget */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              {managerInitials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[var(--foreground)] truncate text-sm leading-tight">{project.manager.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{project.manager.email}</p>
            </div>
          </div>

          <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-2 rounded-xl text-[11px] text-[var(--text-muted)] mt-4 flex justify-between items-center font-medium">
            <span>Project Owner</span>
            <span className="px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-[10px] uppercase">
              Manager
            </span>
          </div>
        </div>

      </div>

      {/* FULL WIDTH TASK LIST */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm">
        <ProjectTasksView
          projectId={project.id}
          initialTasks={project.tasks}
          role={session.user.role}
        />
      </div>
    </div>
  );
}