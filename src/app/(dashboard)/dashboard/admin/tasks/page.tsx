// src/app/(dashboard)/dashboard/manager/tasks/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import TasksPageClient from "@/components/shared/TasksPageClient";

export default async function ManagerTasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (!["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const page = Number(searchParams.page ?? 1);
  const limit = Number(searchParams.limit ?? 10);

  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const priority = typeof searchParams.priority === "string" ? searchParams.priority : "";
  const assigneeId = typeof searchParams.assigneeId === "string" ? searchParams.assigneeId : "";
  const deadlineStatus = typeof searchParams.deadlineStatus === "string" ? searchParams.deadlineStatus : "";
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "dueDate";
  const sortOrder = typeof searchParams.sortOrder === "string" ? searchParams.sortOrder : "asc";

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) where.status = status;
  if (priority) where.priority = priority;

  if (assigneeId) {
    where.assignees = { some: { userId: assigneeId } };
  }

  if (deadlineStatus === "OVERDUE") {
    where.status = { not: "COMPLETED" };
    where.dueDate = { lt: new Date() };
  }

  if (deadlineStatus === "UPCOMING") {
    where.dueDate = { gte: new Date() };
  }

  const orderBy: any = {};
  if (sortBy === "createdAt") orderBy.createdAt = sortOrder;
  else if (sortBy === "priority") orderBy.priority = sortOrder;
  else orderBy.dueDate = sortOrder;

  const [tasks, total, users] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignees: { select: { user: { select: { id: true, name: true } } } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
    

      {/* CLIENT WRAPPER (modal + button fix) */}
      <TasksPageClient
        tasks={tasks}
        users={users}
        page={page}
        limit={limit}
        total={total}
      />
    </div>
  );
}