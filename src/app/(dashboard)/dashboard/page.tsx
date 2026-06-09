// src/app/(dashboard)/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

import TasksByPriorityChart from "@/components/dashboard/TasksByPriorityChart";
import ProjectProgressChart from "@/components/dashboard/ProjectProgressChart";
import UpcomingDeadlinesCard from "@/components/dashboard/UpcomingDeadlinesCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import ProjectSummaryCard from "@/components/dashboard/ProjectSummaryCard";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
} from "lucide-react";

import KpiCard from "@/components/shared/KpiCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const userId = session.user.id;
  const now = new Date();

  const isAdmin = role === "ADMIN";
  const isManager = role === "PROJECT_MANAGER";
  const isMember = role === "MEMBER";

  /* ================= BASE DATA HOLDERS ================= */
  let projects: any[] = [];
  let tasks: any[] = [];
  let recentActivities: any[] = [];

  /* ================= ADMIN ================= */
  if (isAdmin) {
    projects = await prisma.project.findMany({
      where: { isDeleted: false },
      include: { tasks: true },
    });

    tasks = await prisma.task.findMany({
      where: { isDeleted: false },
    });

    recentActivities = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }

  /* ================= PROJECT MANAGER ================= */
  if (isManager) {
    projects = await prisma.project.findMany({
      where: {
        isDeleted: false,
        managerId: userId,
      },
      include: { tasks: true },
    });

    tasks = await prisma.task.findMany({
      where: {
        isDeleted: false,
        project: {
          managerId: userId,
        },
      },
    });
  }

  /* ================= MEMBER ================= */
  if (isMember) {
    tasks = await prisma.task.findMany({
      where: {
        isDeleted: false,
        assignees: {
          some: { userId },
        },
      },
      include: {
        project: true,
      },
    });

    projects = await prisma.project.findMany({
      where: {
        isDeleted: false,
        members: {
          some: { userId },
        },
      },
    });
  }

  /* ================= COMMON CALCULATION ================= */
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter(t => t.status !== "COMPLETED").length;

  const overdueTasks = tasks.filter(
    t => t.status !== "COMPLETED" && new Date(t.dueDate) < now
  ).length;

  /* ================= CHART DATA ================= */
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    where: {
      isDeleted: false,
      ...(isAdmin
        ? {}
        : isManager
        ? { project: { managerId: userId } }
        : { assignees: { some: { userId } } }),
    },
    _count: { _all: true },
  });

  const upcomingDeadlines = await prisma.task.findMany({
    where: {
      isDeleted: false,
      dueDate: { gte: now },
      status: { not: "COMPLETED" },
      ...(isAdmin
        ? {}
        : isManager
        ? { project: { managerId: userId } }
        : { assignees: { some: { userId } } }),
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  const projectProgress = projects.map(p => {
    const total = p.tasks?.length || 0;
    const done =
      p.tasks?.filter((t: any) => t.status === "COMPLETED").length || 0;

    return {
      name: p.name,
      progress: total ? Math.round((done / total) * 100) : 0,
      updatedAt: p.updatedAt,
    };
  });

  /* ================= UI ================= */
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ================= KPI (ROLE SEPARATED) ================= */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        <KpiCard
          title={
            isAdmin
              ? "All Projects"
              : isManager
              ? "My Projects"
              : "My Assigned Projects"
          }
          value={totalProjects}
          icon={<FolderKanban size={20} />}
        />

        <KpiCard title="Tasks" value={totalTasks} icon={<ListTodo size={20} />} />
        <KpiCard title="Completed" value={completedTasks} icon={<CheckCircle2 size={20} />} />
        <KpiCard title="Pending" value={pendingTasks} icon={<Clock3 size={20} />} />
        <KpiCard title="Overdue" value={overdueTasks} icon={<AlertTriangle size={20} />} />

      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid gap-6 md:grid-cols-3">

        <TasksByPriorityChart data={tasksByPriority} />
        <UpcomingDeadlinesCard data={upcomingDeadlines} />
        <ProjectProgressChart data={projectProgress} />

      </div>

      {/* ================= SUMMARY ================= */}
      <ProjectSummaryCard
        totalProjects={totalProjects}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        overdueTasks={overdueTasks}
      />

      {/* ================= ADMIN ONLY ================= */}
      {isAdmin && (
        <RecentActivityCard recentActivities={recentActivities} />
      )}
    </div>
  );
}