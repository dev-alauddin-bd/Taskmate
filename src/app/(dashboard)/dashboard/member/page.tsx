import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

import TasksByPriorityChart from "@/components/dashboard/TasksByPriorityChart";
import UpcomingDeadlinesCard from "@/components/dashboard/UpcomingDeadlinesCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";

import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

export default async function MemberDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "MEMBER") redirect("/dashboard");

  const memberId = session.user.id;

  /* ================= PROJECTS ================= */
  const userMemberships = await prisma.projectMember.findMany({
    where: { userId: memberId },
    select: { projectId: true },
  });

  const projectIds = userMemberships.map((m) => m.projectId);

  const totalProjects = projectIds.length;

  /* ================= TASKS (FIXED: assignees) ================= */
  const totalTasks = await prisma.task.count({
    where: {
      assignees: {
        some: { userId: memberId },
      },
    },
  });

  const completedTasks = await prisma.task.count({
    where: {
      assignees: {
        some: { userId: memberId },
      },
      status: "COMPLETED",
    },
  });

  const pendingTasks = await prisma.task.count({
    where: {
      assignees: {
        some: { userId: memberId },
      },
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
  });

  const overdueTasks = await prisma.task.count({
    where: {
      assignees: {
        some: { userId: memberId },
      },
      status: { not: "COMPLETED" },
      dueDate: { lt: new Date() },
    },
  });

  /* ================= RECENT ACTIVITY (FIXED SAFE RELATION) ================= */
  const recentActivities = await prisma.activityLog.findMany({
    where: {
      OR: [
        { userId: memberId },
        { projectId: { in: projectIds } },
      ],
    },
    select: {
      id: true,
      action: true,
      details: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  /* ================= TASK PRIORITY (FIXED) ================= */
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    where: {
      assignees: {
        some: { userId: memberId },
      },
    },
    _count: { _all: true },
  });

  /* ================= UPCOMING DEADLINES (FIXED) ================= */
  const upcomingDeadlines = await prisma.task.findMany({
    where: {
      assignees: {
        some: { userId: memberId },
      },
      dueDate: { gte: new Date() },
      status: { not: "COMPLETED" },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      priority: true,
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return (
    <div className="space-y-6">

      {/* ================= KPI CARDS ================= */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        {/* PROJECTS */}
        <div className="glass-panel p-5 rounded-2xl min-h-[140px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-500" />
              <p className="text-xs text-[var(--text-muted)]">
                Assigned Projects
              </p>
            </div>
            <p className="text-xl font-bold text-blue-500">{totalProjects}</p>
          </div>
        </div>

        {/* TASKS */}
        <div className="glass-panel p-5 rounded-2xl min-h-[140px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-500" />
              <p className="text-xs text-[var(--text-muted)]">My Tasks</p>
            </div>
            <p className="text-xl font-bold text-indigo-500">{totalTasks}</p>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="glass-panel p-5 rounded-2xl min-h-[140px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-xs text-[var(--text-muted)]">
                Completed
              </p>
            </div>
            <p className="text-xl font-bold text-green-500">
              {completedTasks}
            </p>
          </div>

          <div className="mt-3 h-1 bg-green-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{
                width: totalTasks
                  ? `${(completedTasks / totalTasks) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        {/* PENDING */}
        <div className="glass-panel p-5 rounded-2xl min-h-[140px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-yellow-500" />
              <p className="text-xs text-[var(--text-muted)]">Pending</p>
            </div>
            <p className="text-xl font-bold text-yellow-500">
              {pendingTasks}
            </p>
          </div>
        </div>

        {/* OVERDUE */}
        <div className="glass-panel p-5 rounded-2xl min-h-[140px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-xs text-[var(--text-muted)]">
                Overdue
              </p>
            </div>
            <p className="text-xl font-bold text-red-500">
              {overdueTasks}
            </p>
          </div>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid gap-6 md:grid-cols-2">
        <TasksByPriorityChart data={tasksByPriority} />
        <UpcomingDeadlinesCard data={upcomingDeadlines} />

        <div className="md:col-span-2">
          <RecentActivityCard recentActivities={recentActivities} />
        </div>
      </div>
    </div>
  );
}