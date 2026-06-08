import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Pagination from "@/components/dashboard/Pagination";
import AddProjectButton from "@/components/dashboard/AddProjectButton";
import ProjectsClient from "@/components/ProjectsClient";

export default async function AdminProjectsPage({ searchParams }: any) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const page = parseInt(searchParams?.page ?? "1", 10);
  const limit = parseInt(searchParams?.limit ?? "10", 10);

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: {
        isDeleted: false
      },
      include: {
        manager: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count(),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Admin Projects"
        subtitle="Manage all projects"
      >
        <AddProjectButton />
      </DashboardHeader>

      <ProjectsClient projects={projects} />

      <Pagination
        page={page}
        limit={limit}
        total={total}
        basePath="/admin/projects"
      />
    </div>
  );
}