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
import MemberTaskPieChart from "@/components/dashboard/MemberTaskPieChart";
import { generateCalendarDays, isToday, hasTasksOnDay } from "@/lib/dashboard/calendar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const userId = session.user.id;
  const now = new Date();

  const isAdmin = role === "ADMIN";
  const isManager = role === "PROJECT_MANAGER";
  const isMember = role === "MEMBER";

  /* ================= SAFE USER SCOPE ================= */
  const getScope = () => {
    if (isAdmin) return {};

    if (isManager) {
      return {
        project: {
          managerId: userId,
        },
      };
    }

    return {
      project: {
        isDeleted: false,
        members: {
          some: { userId },
        },
      },
    };
  };

  const scope = getScope();

  /* ================= TASK PRIORITY CHART ================= */
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    where: {
      isDeleted: false,
      project: { isDeleted: false },
      ...scope,
    },
    _count: { _all: true },
  });

  /* ================= UPCOMING DEADLINES ================= */
  const upcomingDeadlines = await prisma.task.findMany({
    where: {
      isDeleted: false,
      project: { isDeleted: false },
      dueDate: { gte: now },
      status: { not: "COMPLETED" },
      ...scope,
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  /* ================= ACTIVITY LOG ================= */
  let recentActivities: any[] = [];

  if (isAdmin) {
    recentActivities = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }

  /* ================= DEFAULT STATS ================= */
  let totalProjects = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  let pendingTasks = 0;
  let overdueTasks = 0;

  let projectProgress: any[] = [];
  let teamMembers: any[] = [];
  let memberTasks: any[] = [];
  let memberTasksByPriority: any[] = [];

  /* ================= ADMIN / MANAGER ================= */
  if (isAdmin || isManager) {
    const projects = await prisma.project.findMany({
      where: isManager
        ? { managerId: userId, isDeleted: false }
        : { isDeleted: false },
      include: { tasks: true },


    });

    const tasks = await prisma.task.findMany({
      where: {
        isDeleted: false,
        project: isManager
          ? { managerId: userId, isDeleted: false }
          : { isDeleted: false },
      },
    });

    const users = await prisma.user.findMany({
      where: isManager
        ? {
          memberships: {
            some: {
              project: { managerId: userId },
            },
          },
        }
        : undefined,
      include: {
        tasks: true,
      },
    });

    totalProjects = projects.length;
    totalTasks = tasks.length;

    completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    pendingTasks = tasks.filter((t) => t.status !== "COMPLETED").length;

    overdueTasks = tasks.filter(
      (t) => t.status !== "COMPLETED" && new Date(t.dueDate) < now
    ).length;

    projectProgress = projects.map((p) => {
      const total = p.tasks.length;
      const completed = p.tasks.filter(
        (t) => t.status === "COMPLETED"
      ).length;

      return {
        id: p.id,
        name: p.name,
        progress: total ? Math.round((completed / total) * 100) : 0,
      };
    });

    teamMembers = users.map((u) => ({
      id: u.id,
      name: u.name,
      taskCount: u.tasks.length,
    }));
  }

  /* ================= MEMBER ================= */
if (isMember) {
  memberTasks = await prisma.task.findMany({
    where: {
      isDeleted: false,
      assignees: { some: { userId } },
    },
    include: {
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  memberTasksByPriority = await prisma.task.groupBy({
    by: ["priority"] as const,
    where: {
      isDeleted: false,
      assignees: { some: { userId } },
    },
    _count: { _all: true },
  }) as any;

  totalTasks = memberTasks.length;

  completedTasks = memberTasks.filter(t => t.status === "COMPLETED").length;
  pendingTasks = memberTasks.filter(t => t.status !== "COMPLETED").length;

  overdueTasks = memberTasks.filter(
    t => t.status !== "COMPLETED" && new Date(t.dueDate) < now
  ).length;

  /* 🔥 NEW: MEMBER PROJECTS SEPARATION */
  const memberProjectsRaw = await prisma.project.findMany({
    where: {
      isDeleted: false,
      members: {
        some: { userId },
      },
    },
    include: {
      manager: true,
    },
  });

  memberTasks = memberTasks; // already has project included

  // group projects
  const myProjects = memberProjectsRaw;
}

  /* ================= UI ================= */
  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPI */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        <KpiCard title="Projects" value={totalProjects} icon={<FolderKanban size={20} />} color="var(--primary)" />
        <KpiCard title="Tasks" value={totalTasks} icon={<ListTodo size={20} />} color="var(--info)" />
        <KpiCard title="Completed" value={completedTasks} icon={<CheckCircle2 size={20} />} color="var(--success)" />
        <KpiCard title="Pending" value={pendingTasks} icon={<Clock3 size={20} />} color="var(--accent-purple)" />
        <KpiCard title="Overdue" value={overdueTasks} icon={<AlertTriangle size={20} />} color="var(--danger)" />

      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <TasksByPriorityChart data={tasksByPriority} />
        <UpcomingDeadlinesCard data={upcomingDeadlines} />

        {isAdmin && (
          <RecentActivityCard recentActivities={recentActivities} />
        )}

        {(isAdmin || isManager) && (
          <>
            <ProjectProgressChart data={projectProgress} />
            <ProjectSummaryCard
              totalProjects={totalProjects}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              pendingTasks={pendingTasks}
              overdueTasks={overdueTasks}
            />
          </>
        )}

        {/* new chart and graph for member */}
        {isMember && (
          <div className="grid md:grid-cols-2 gap-6">

            {/* Pie Chart - Member's Tasks by Priority */}

            <MemberTaskPieChart data={memberTasksByPriority} />


            {/* Calendar Grid */}
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                My Calendar
              </h3>
              <div className="grid grid-cols-7 text-center text-xs text-gray-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 text-center mt-2">
                {generateCalendarDays().map((day, idx) => (
                  <div
                    key={idx}
                    className={`h-8 flex items-center justify-center text-xs rounded 
              ${isToday(day) ? "bg-blue-500 text-white" : "text-white hover:bg-white/10"}
              ${hasTasksOnDay(day, memberTasks) ? "font-semibold" : ""}`}
                  >
                    {day.getDate()}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>


    </div>
  );
}