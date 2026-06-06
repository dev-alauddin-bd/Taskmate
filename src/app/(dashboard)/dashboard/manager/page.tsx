import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

import TasksByPriorityChart from "@/components/dashboard/TasksByPriorityChart";
import ProjectProgressChart from "@/components/dashboard/ProjectProgressChart";
import UpcomingDeadlinesCard from "@/components/dashboard/UpcomingDeadlinesCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import ProjectSummaryCard from "@/components/dashboard/ProjectSummaryCard";
import TeamMembersWorkedCard from "@/components/dashboard/TeamMembersWorkedCard";

export default async function ManagerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Authorize both MANAGER and PROJECT_MANAGER roles
  if (session.user.role !== "PROJECT_MANAGER" && session.user.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const managerId = session.user.id;

  // Find all project IDs managed by this manager
  const managedProjects = await prisma.project.findMany({
    where: { managerId },
    select: { id: true },
  });
  const projectIds = managedProjects.map((p) => p.id);

  // ======================
  // KPI DATA
  // ======================
  const totalProjects = projectIds.length;
  const totalTasks = await prisma.task.count({
    where: { projectId: { in: projectIds } },
  });

  const completedTasks = await prisma.task.count({
    where: {
      projectId: { in: projectIds },
      status: "COMPLETED",
    },
  });

  const pendingTasks = await prisma.task.count({
    where: {
      projectId: { in: projectIds },
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
  });

  const overdueTasks = await prisma.task.count({
    where: {
      projectId: { in: projectIds },
      status: { not: "COMPLETED" },
      dueDate: { lt: new Date() },
    },
  });

  // ======================
  // RECENT ACTIVITY
  // ======================
  const recentActivities = await prisma.activityLog.findMany({
    where: {
      projectId: { in: projectIds },
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

  // ======================
  // TASKS BY PRIORITY
  // ======================
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    where: { projectId: { in: projectIds } },
    _count: { _all: true },
  });

  // ======================
  // PROJECT PROGRESS
  // ======================
  const projects = await prisma.project.findMany({
    where: { managerId },
    include: {
      tasks: {
        select: { status: true },
      },
    },
  });

  const projectProgress = projects.map((project) => {
    const total = project.tasks.length;
    const completed = project.tasks.filter((t) => t.status === "COMPLETED").length;

    return {
      id: project.id,
      name: project.name,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      updatedAt: project.updatedAt,
    };
  });

  // ======================
  // UPCOMING DEADLINES
  // ======================
  const upcomingDeadlines = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
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

  // ======================
  // TEAM MEMBERS
  // ======================
  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId: { in: projectIds } },
    select: { userId: true },
  });
  const memberIds = Array.from(new Set(projectMembers.map((pm) => pm.userId)));

  const teamMembers = await prisma.user.findMany({
    where: { id: { in: memberIds } },
    include: {
      tasks: {
        select: {
          id: true,
          task: {
            select: {
              id: true,
              status: true,
              projectId: true,
            },
          },
        },
      },
    },
  });

  const formattedMembers = teamMembers.map((user) => {
    const taskCount = user.tasks.length;
    const completedCount = user.tasks.filter((t) => t.task.status === "COMPLETED").length;

    return {
      id: user.id,
      name: user.name || "Unknown",
      avatar: user.avatar,
      taskCount,
      completedCount,
    };
  });

  return (
    <div className="container mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)]">Manager Dashboard</h1>
        <p className="text-[var(--text-muted)]">Track status and metrics for your managed projects.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {/* PROJECTS */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-500" />
              <p className="text-xs text-[var(--text-muted)]">My Projects</p>
            </div>
            <p className="text-xl font-bold text-blue-500">{totalProjects}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
              <div className="h-full w-[100%] bg-blue-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* TASKS */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-500" />
              <p className="text-xs text-[var(--text-muted)]">Tasks</p>
            </div>
            <p className="text-xl font-bold text-indigo-500">{totalTasks}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-indigo-500/20 rounded-full overflow-hidden">
              <div className="h-full w-[100%] bg-indigo-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-xs text-[var(--text-muted)]">Completed</p>
            </div>
            <p className="text-xl font-bold text-green-500">{completedTasks}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-green-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(completedTasks / totalTasks) * 100 || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* PENDING */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-yellow-500" />
              <p className="text-xs text-[var(--text-muted)]">Pending</p>
            </div>
            <p className="text-xl font-bold text-yellow-500">{pendingTasks}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-yellow-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${(pendingTasks / totalTasks) * 100 || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* OVERDUE */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-xs text-[var(--text-muted)]">Overdue</p>
            </div>
            <p className="text-xl font-bold text-red-500">{overdueTasks}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-red-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${(overdueTasks / totalTasks) * 100 || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TasksByPriorityChart data={tasksByPriority} />
        <ProjectProgressChart data={projectProgress} />
        <UpcomingDeadlinesCard data={upcomingDeadlines} />
        <RecentActivityCard recentActivities={recentActivities} />
        <ProjectSummaryCard
          totalProjects={totalProjects}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          pendingTasks={pendingTasks}
          overdueTasks={overdueTasks}
        />
        <TeamMembersWorkedCard members={formattedMembers} />
      </div>
    </div>
  );
}
