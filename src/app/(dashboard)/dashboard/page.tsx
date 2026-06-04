import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import TasksByPriorityChart from "@/components/dashboard/TasksByPriorityChart";
import ProjectProgressChart from "@/components/dashboard/ProjectProgressChart";
import TeamProductivityChart from "@/components/dashboard/TeamProductivityChart";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import UpcomingDeadlinesCard from "@/components/dashboard/UpcomingDeadlinesCard";
import HighPriorityBadge from "@/components/dashboard/HighPriorityBadge";
import AddProjectButton from "@/components/dashboard/AddProjectButton";
import { 
  FolderKanban, 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Zap, 
  Users 
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch KPI data
  const totalProjects = await prisma.project.count();
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({ where: { status: "COMPLETED" } });
  const pendingTasks = await prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } });
  const overdueTasks = await prisma.task.count({
    where: {
      status: { not: "COMPLETED" },
      dueDate: { lt: new Date() },
    },
  });

  // Fetch recent activities
  const recentActivities = await prisma.activityLog.findMany({
    select: {
      id: true,
      action: true,
      details: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch chart data directly via Prisma
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    _count: { _all: true },
  });
  const projectProgress = await prisma.project.findMany({
    select: { id: true, name: true, progress: true, updatedAt: true },
    orderBy: { updatedAt: "asc" },
  });
  const teamProductivityRaw = await prisma.user.findMany({
    select: { id: true, name: true, assignedTasks: { where: { status: "COMPLETED" }, select: { id: true } } },
  });
  const teamProductivity = teamProductivityRaw.map((u) => ({
    id: u.id,
    name: u.name,
    completedTasks: u.assignedTasks.length,
  }));
  const taskStatusDistribution = await prisma.task.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  
  // Fetch pending upcoming deadlines (exclude completed tasks)
  const upcomingDeadlines = await prisma.task.findMany({
    where: { 
      dueDate: { gte: new Date() },
      status: { not: "COMPLETED" }
    },
    select: { 
      id: true, 
      title: true, 
      dueDate: true,
      status: true,
      priority: true
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  // Count of pending high priority tasks
  const highPriorityCount = await prisma.task.count({ 
    where: { 
      priority: "HIGH",
      status: { not: "COMPLETED" }
    } 
  });

  const chartData = {
    tasksByPriority,
    projectProgress,
    teamProductivity,
    taskStatusDistribution,
    upcomingDeadlines,
    highPriorityCount,
  };

  return (
    <div className="container mx-auto space-y-8 animate-fade-in">
      {/* Header section with Welcome message and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)]/50 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Welcome back, <span className="font-semibold text-[var(--foreground)]">{session?.user?.name || "User"}</span>. Here's an overview of your workspaces.
          </p>
        </div>
        <div className="shrink-0">
          <AddProjectButton />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Projects */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Projects</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{totalProjects}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] group-hover:scale-110 transition-transform duration-300">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Total Tasks */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Tasks</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{totalTasks}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Completed Tasks</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{completedTasks}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--success)]/10 text-[var(--success)] group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pending Tasks</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{pendingTasks}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--warning)]/10 text-[var(--warning)] group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Overdue Tasks</span>
            <span className={`text-3xl font-extrabold tracking-tight ${overdueTasks > 0 ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}>{overdueTasks}</span>
          </div>
          <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 ${overdueTasks > 0 ? "bg-[var(--danger)]/15 text-[var(--danger)] animate-pulse" : "bg-[var(--danger)]/10 text-[var(--danger)]"}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TasksByPriorityChart data={chartData.tasksByPriority} />
        <ProjectProgressChart data={chartData.projectProgress} />
        <TeamProductivityChart data={chartData.teamProductivity} />
        <TaskStatusChart data={chartData.taskStatusDistribution} />
        <UpcomingDeadlinesCard data={chartData.upcomingDeadlines} />
        <HighPriorityBadge count={chartData.highPriorityCount} />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline-style Recent Activity */}
        <div className="glass-panel rounded-2xl shadow-sm overflow-hidden flex flex-col border border-[var(--border)]/50">
          <div className="p-6 border-b border-[var(--border)]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Activity</h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Real-time updates</span>
          </div>
          <div className="p-6 flex-1">
            {recentActivities.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-[var(--border)] ml-3 space-y-6">
                {recentActivities.map((activity) => {
                  let icon = <CheckSquare className="w-4 h-4" />;
                  let iconBg = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                  if (activity.action.includes("PROJECT")) {
                    icon = <FolderKanban className="w-4 h-4" />;
                    iconBg = "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20";
                  } else if (activity.action.includes("COMPLETED")) {
                    icon = <CheckCircle2 className="w-4 h-4" />;
                    iconBg = "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20";
                  } else if (activity.action.includes("DELETED")) {
                    icon = <AlertTriangle className="w-4 h-4" />;
                    iconBg = "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20";
                  }

                  return (
                    <div key={activity.id} className="relative group">
                      {/* Timeline dot/icon */}
                      <span className={`absolute -left-[38px] top-1 flex items-center justify-center w-8 h-8 rounded-full border bg-[var(--surface)] ${iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                        {icon}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-sm font-semibold text-[var(--foreground)]">
                            {activity.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] shrink-0">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)] gap-2">
                <Activity className="w-8 h-8 text-[var(--text-muted)]/50" />
                <p className="text-sm">No recent activity found</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[var(--border)]/50 bg-[var(--surface-hover)]/30 text-center">
            <Link href="/activity" className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold inline-flex items-center gap-1.5 hover:underline">
              View all activity <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Actions Card Grid */}
        <div className="glass-panel rounded-2xl shadow-sm overflow-hidden flex flex-col border border-[var(--border)]/50">
          <div className="p-6 border-b border-[var(--border)]/50">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--warning)]" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">Quick Actions</h2>
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4 flex-1 justify-center">
            <Link href="/projects" className="group flex items-start gap-4 p-4 rounded-xl border border-[var(--border)]/50 hover:bg-[var(--surface-hover)]/50 hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-sm">
              <div className="p-3 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] group-hover:scale-105 transition-transform duration-300">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div className="flex-1 flex flex-col text-left">
                <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Manage Projects</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5">Create, edit, or archive team workspaces</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </Link>

            <Link href="/tasks" className="group flex items-start gap-4 p-4 rounded-xl border border-[var(--border)]/50 hover:bg-[var(--surface-hover)]/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-sm">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform duration-300">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 flex flex-col text-left">
                <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">View All Tasks</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5">Track assignees, priorities, and task statuses</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </Link>

            <Link href="/team" className="group flex items-start gap-4 p-4 rounded-xl border border-[var(--border)]/50 hover:bg-[var(--surface-hover)]/50 hover:border-[var(--success)]/30 transition-all duration-300 hover:shadow-sm">
              <div className="p-3 rounded-lg bg-[var(--success)]/10 text-[var(--success)] group-hover:scale-105 transition-transform duration-300">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 flex flex-col text-left">
                <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--success)] transition-colors">View Team Workload</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5">Inspect member capacity and task distributions</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

