import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Pagination from "@/components/dashboard/Pagination";
import AddProjectButton from "@/components/dashboard/AddProjectButton";
import ProjectsClient from "@/components/ProjectsClient";

import KpiCard from "@/components/shared/KpiCard";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

export default async function AdminProjectsPage({ searchParams }: any) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const page = parseInt(searchParams?.page ?? "1", 10);
  const limit = parseInt(searchParams?.limit ?? "10", 10);

  const [projects, totalProjects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { isDeleted: false },
      include: {
        manager: { select: { name: true } },
        tasks: true,
        _count: { select: { tasks: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),

    prisma.project.count({
      where: { isDeleted: false },
    }),

    prisma.task.findMany({
      where: {
        project: { isDeleted: false },
      },
    }),
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter(t => t.status !== "COMPLETED").length;
  const overdueTasks = tasks.filter(
    t => t.status !== "COMPLETED" && new Date(t.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER */}
      <DashboardHeader
        title="Admin Projects Overview"
        subtitle="Manage and monitor all projects"
      >
        <AddProjectButton />
      </DashboardHeader>

      {/* KPI SECTION (same as dashboard) */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Projects"
          value={totalProjects}
          icon={<FolderKanban size={20} />}
          color="var(--primary)"
        />

        <KpiCard
          title="Tasks"
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
          icon={<Clock3 size={20} />}
          color="var(--accent-purple)"
        />

        <KpiCard
          title="Overdue"
          value={overdueTasks}
          icon={<AlertTriangle size={20} />}
          color="var(--danger)"
        />
      </div>

      {/* PROJECT LIST (same layout feel) */}
      <ProjectsClient projects={projects} />

      {/* PAGINATION */}
      <Suspense fallback={null}>
        <Pagination
          page={page}
          limit={limit}
          total={totalProjects}
          basePath="/dashboard/admin/projects"
        />
      </Suspense>
    </div>
  );
}