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
import { FolderKanban, ListTodo, Clock3 } from "lucide-react";

export default async function ManagerProjectsPage({ searchParams }: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PROJECT_MANAGER") redirect("/dashboard");

  const page = parseInt(searchParams?.page ?? "1", 10);
  const limit = parseInt(searchParams?.limit ?? "10", 10);

  const search = searchParams?.search ?? "";
  const status = searchParams?.status ?? "";

  const where: any = {
    managerId: session.user.id,
    isDeleted: false,
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive",
      },
    }),
    ...(status && {
      status,
    }),
  };

  const [projects, totalProjects, tasks] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        manager: { select: { name: true } },
        tasks: true,
        _count: { select: { tasks: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),

    prisma.project.count({ where }),

    prisma.task.findMany({
      where: {
        project: {
          managerId: session.user.id,
          isDeleted: false,
        },
      },
    }),
  ]);

  // ================= KPI =================
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter(t => t.status !== "COMPLETED").length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ================= HEADER ================= */}
      <DashboardHeader
        title="My Projects"
        subtitle="Manage your projects, tasks, and progress"
      >
        <AddProjectButton />
      </DashboardHeader>

      {/* ================= KPI (ADMIN STYLE MATCH) ================= */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

        <KpiCard
          title="My Projects"
          value={totalProjects}
          icon={<FolderKanban size={20} />}
          color="var(--primary)"
        />

        <KpiCard
          title="Total Tasks"
          value={totalTasks}
          icon={<ListTodo size={20} />}
          color="var(--info)"
        />

        <KpiCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={<Clock3 size={20} />}
          color="var(--warning)"
        />
      </div>

      {/* ================= MAIN TABLE ================= */}
      <div className="rounded-2xl border glass-panel">
        <ProjectsClient projects={projects} />
      </div>

      {/* ================= PAGINATION ================= */}
      <Suspense fallback={null}>
        <Pagination
          page={page}
          limit={limit}
          total={totalProjects}
          basePath="/dashboard/manager/projects"
        />
      </Suspense>
    </div>
  );
}