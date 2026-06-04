import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Metadata } from "next";
import {
  Clock,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  FolderPlus,
  FolderSync,
  FolderMinus,
  Activity,
  Layers,
  CheckSquare,
  Sparkles
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ActivityChart from "@/components/dashboard/ActivityChart";

export const metadata: Metadata = {
  title: "Activity Feed & Analytics – Taskmate",
  description: "Monitor and analyze recent actions across the platform with detailed timeline visualizations.",
};

const actionMeta = (action: string) => {
  switch (action) {
    case "TASK_CREATED":
      return {
        colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: "Task Created",
        icon: PlusCircle,
      };
    case "TASK_COMPLETED":
      return {
        colorClass: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Task Completed",
        icon: CheckCircle2,
      };
    case "TASK_UPDATED":
      return {
        colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Task Updated",
        icon: RefreshCw,
      };
    case "TASK_DELETED":
      return {
        colorClass: "bg-red-500/10 text-red-500 border-red-500/20",
        label: "Task Deleted",
        icon: Trash2,
      };
    case "PROJECT_CREATED":
      return {
        colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        label: "Project Created",
        icon: FolderPlus,
      };
    case "PROJECT_UPDATED":
      return {
        colorClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        label: "Project Updated",
        icon: FolderSync,
      };
    case "PROJECT_DELETED":
      return {
        colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        label: "Project Deleted",
        icon: FolderMinus,
      };
    default:
      return {
        colorClass: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        label: "System Action",
        icon: Clock,
      };
  }
};

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch activities
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Calculate statistics
  const totalActivities = await prisma.activityLog.count();

  const projectActionsCount = await prisma.activityLog.count({
    where: {
      action: { in: ["PROJECT_CREATED", "PROJECT_UPDATED", "PROJECT_DELETED"] }
    }
  });

  const taskActionsCount = await prisma.activityLog.count({
    where: {
      action: { in: ["TASK_CREATED", "TASK_UPDATED", "TASK_DELETED", "TASK_COMPLETED"] }
    }
  });

  const completedTaskCount = await prisma.activityLog.count({
    where: { action: "TASK_COMPLETED" }
  });

  // Aggregate data for Chart
  const actionGroups = await prisma.activityLog.groupBy({
    by: ["action"],
    _count: { _all: true },
  });

  const chartData = actionGroups.map(g => ({
    action: g.action,
    count: g._count._all,
  }));

  const summary =
    activities.length === 0
      ? "No recent activities recorded."
      : `Latest updates showcase ${activities
        .slice(0, 4)
        .map((a) => a.details)
        .join(", and ")}.`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8 animate-fade-in">
      {/* HEADER */}
      <div className="border-b border-[var(--border)]/50 pb-6">
        <DashboardHeader
          title="Activity Feed & Analytics"
          subtitle="Analyze real-time events, project updates, and team productivity logs."
        />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Logs */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Logs</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{totalActivities}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] group-hover:scale-110 transition-transform duration-300">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Project Actions */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Project Actions</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{projectActionsCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Task Actions */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Task Actions</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{taskActionsCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Tasks Completed</span>
            <span className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{completedTaskCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--success)]/10 text-[var(--success)] group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-5 items-start">
        {/* Left Column - Analytics & Summary (40%) */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-8">
          {/* AI SUMMARY */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm border border-[var(--border)]/50 relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
            <div className="absolute top-0 right-0 p-4 text-[var(--primary)]/10 animate-pulse">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> System Highlight Summary
            </h2>
            <p className="text-[var(--foreground)] text-sm leading-relaxed font-semibold">
              {summary}
            </p>
          </div>

          {/* DISTRIBUTION CHART */}
          <div className="w-full">
            {chartData.length > 0 ? (
              <ActivityChart data={chartData} />
            ) : (
              <div className="glass-panel p-6 rounded-2xl shadow-sm text-center text-[var(--text-muted)] min-h-[360px] flex items-center justify-center border border-[var(--border)]/50">
                No activity data available to map.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Timeline (60%) */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-6 rounded-2xl shadow-sm border border-[var(--border)]/50">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">Activity Timeline</h2>
            </div>

            <div className="relative border-l-2 border-[var(--border)] ml-4 pl-8 space-y-6 py-2">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] flex flex-col items-center gap-2">
                  <Activity className="w-8 h-8 text-[var(--text-muted)]/40" />
                  <p className="text-sm">No logs found in the system.</p>
                </div>
              ) : (
                activities.map((activity) => {
                  const meta = actionMeta(activity.action);
                  const Icon = meta.icon;

                  return (
                    <div key={activity.id} className="relative group animate-fade-in">
                      {/* Timeline Dot & Icon */}
                      <span className={`absolute -left-[48px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center border bg-[var(--surface)] shadow-sm transition-transform duration-300 group-hover:scale-110 ${meta.colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </span>

                      {/* Content Card */}
                      <div className="glass-panel p-5 rounded-2xl hover:shadow-md hover:bg-[var(--surface-hover)]/40 hover:border-[var(--primary)]/30 transition-all duration-300 border border-[var(--border)]/40 flex flex-col gap-3">
                        {/* Upper row */}
                        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)]/30 pb-2.5">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase border tracking-wider ${meta.colorClass}`}>
                            {meta.label}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]/70" />
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {/* Details */}
                        <p className="text-sm text-[var(--foreground)] leading-relaxed font-semibold">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}