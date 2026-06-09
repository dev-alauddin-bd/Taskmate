import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import TasksByPriorityChart from "@/components/dashboard/TasksByPriorityChart";
import TeamProductivityChart from "@/components/dashboard/TeamProductivityChart";
import ActivityChart from "@/components/dashboard/ActivityChart";

import KpiCard from "@/components/shared/KpiCard";
import {
  CheckCircle2,
  ListTodo,
  Users,
  Activity,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  // ================= TASK STATUS =================
  const tasksByStatus = await prisma.task.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  // ================= PRIORITY =================
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    _count: { _all: true },
  });

  // ================= TEAM PRODUCTIVITY =================
  const usersWithCompletedTasks = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "PROJECT_MANAGER", "MEMBER"] },
    },
    select: {
      name: true,
      _count: {
        select: {
          tasks: {
            where: {
              task: { status: "COMPLETED" },
            },
          },
        },
      },
    },
    take: 10,
  });

  const teamProductivity = usersWithCompletedTasks.map((u) => ({
    name: u.name || "Unknown",
    completedTasks: u._count.tasks,
  }));

  // ================= ACTIVITY =================
  const activityActions = await prisma.activityLog.groupBy({
    by: ["action"],
    _count: { _all: true },
  });

  const activityDistribution = activityActions.map((a) => ({
    action: a.action,
    count: a._count._all,
  }));

  // ================= REAL KPIs =================
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({
    where: { status: "COMPLETED" },
  });
  const pendingTasks = totalTasks - completedTasks;

  const totalUsers = await prisma.user.count();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER */}
      <DashboardHeader
        title="Admin Analytics Overview"
        subtitle="System-wide performance insights & reporting"
      />

      {/* KPI ROW (CONSISTENT WITH OTHER PAGES) */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          title="Total Tasks"
          value={totalTasks}
          icon={<ListTodo size={20} />}
          color="var(--info)"
        />

        <KpiCard
          title="Completed"
          value={completedTasks}
          icon={<CheckCircle2 size={20} />}
          color="var(--success)"
        />

        <KpiCard
          title="Pending"
          value={pendingTasks}
          icon={<Activity size={20} />}
          color="var(--accent-purple)"
        />

        <KpiCard
          title="Total Users"
          value={totalUsers}
          icon={<Users size={20} />}
          color="var(--primary)"
        />

      </div>

      {/* CHART SECTION (CLEAN GRID LIKE PROJECT PAGE STYLE) */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <TaskStatusChart data={tasksByStatus} />
        <TasksByPriorityChart data={tasksByPriority} />
        <TeamProductivityChart data={teamProductivity} />
        <ActivityChart data={activityDistribution} />
      </div>
    </div>
  );
}