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

export default async function DashboardPage() {
  // ======================
  // KPI DATA
  // ======================
  const totalProjects = await prisma.project.count();
  const totalTasks = await prisma.task.count();

  const completedTasks = await prisma.task.count({
    where: { status: "COMPLETED" },
  });

  const pendingTasks = await prisma.task.count({
    where: { status: { in: ["TODO", "IN_PROGRESS"] } },
  });

  const overdueTasks = await prisma.task.count({
    where: {
      status: { not: "COMPLETED" },
      dueDate: { lt: new Date() },
    },
  });

  // ======================
  // RECENT ACTIVITY
  // ======================
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

  // ======================
  // TASKS BY PRIORITY
  // ======================
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    _count: { _all: true },
  });

  // ======================
  // PROJECT PROGRESS
  // ======================
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        select: { status: true },
      },
    },
  });

  const projectProgress = projects.map((project) => {
    const total = project.tasks.length;

    const completed = project.tasks.filter(
      (t) => t.status === "COMPLETED"
    ).length;

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
  // HIGH PRIORITY COUNT
  // ======================
  const highPriorityCount = await prisma.task.count({
    where: {
      priority: "HIGH",
      status: { not: "COMPLETED" },
    },
  });

  // ======================
  // TEAM MEMBERS (EXAMPLE)
  // ======================
  const teamMembers = await prisma.user.findMany({
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
        }
      }
    }
  })

  const formattedMembers = teamMembers.map((user) => {
    const taskCount = user.tasks.length;
    const completedCount = user.tasks.filter(
      (t) => t.status === "COMPLETED"
    ).length;

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

  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

  {/* PROJECTS */}
  <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[140px]">

    {/* TOP ROW */}
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <FolderKanban className="w-5 h-5 text-blue-500" />
        <p className="text-xs text-[var(--text-muted)]">Projects</p>
      </div>

      <p className="text-xl font-bold text-blue-500">
        {totalProjects}
      </p>
    </div>

    {/* BOTTOM */}
    <div>
   

      <div className="mt-3 h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
        <div className="h-full w-[70%] bg-blue-500 rounded-full" />
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

      <p className="text-xl font-bold text-indigo-500">
        {totalTasks}
      </p>
    </div>

    <div>
    

      <div className="mt-3 h-1 w-full bg-indigo-500/20 rounded-full overflow-hidden">
        <div className="h-full w-[80%] bg-indigo-500 rounded-full" />
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

      <p className="text-xl font-bold text-green-500">
        {completedTasks}
      </p>
    </div>

    <div>
   

      <div className="mt-3 h-1 w-full bg-green-500/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full"
          style={{
            width: `${(completedTasks / totalTasks) * 100 || 0}%`,
          }}
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

      <p className="text-xl font-bold text-yellow-500">
        {pendingTasks}
      </p>
    </div>

    <div>
   

      <div className="mt-3 h-1 w-full bg-yellow-500/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-500 rounded-full"
          style={{
            width: `${(pendingTasks / totalTasks) * 100 || 0}%`,
          }}
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

      <p className="text-xl font-bold text-red-500">
        {overdueTasks}
      </p>
    </div>

    <div>
    
      <div className="mt-3 h-1 w-full bg-red-500/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full"
          style={{
            width: `${(overdueTasks / totalTasks) * 100 || 0}%`,
          }}
        />
      </div>
    </div>

  </div>

</div>

      {/* ======================
          CHARTS + CARDS GRID
      ====================== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <TasksByPriorityChart data={tasksByPriority} />

        <ProjectProgressChart data={projectProgress} />

        <UpcomingDeadlinesCard data={upcomingDeadlines} />

        <RecentActivityCard recentActivities={recentActivities} />


        {/* NEW: Project Summary */}
        <ProjectSummaryCard
          totalProjects={totalProjects}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          pendingTasks={pendingTasks}
          overdueTasks={overdueTasks}
        />

        {/* NEW: Team Members */}
        <TeamMembersWorkedCard members={formattedMembers} />

      </div>
    </div>
  );
}