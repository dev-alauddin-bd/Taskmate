// src/app/(dashboard)/dashboard/manager/tasks/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import TasksPageClient from "@/components/shared/TasksPageClient";

export default async function ManagerTasksPage({
  searchParams,
}: {
  // Next.js provides searchParams as a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (!["PROJECT_MANAGER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Await the searchParams promise (Next.js app router requirement)
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);

  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "";
  const priority = typeof params.priority === "string" ? params.priority : "";
  const assigneeId = typeof params.assigneeId === "string" ? params.assigneeId : "";
  const deadlineStatus = typeof params.deadlineStatus === "string" ? params.deadlineStatus : "";
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : "dueDate";
  const sortOrder = typeof params.sortOrder === "string" ? params.sortOrder : "asc";

  // ✅ SAFE WHERE (FIXED)
  const where: any = {
    isDeleted: false,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(assigneeId ? { assignees: { some: { userId: assigneeId } } } : {}),
    ...(deadlineStatus === "OVERDUE"
      ? { status: { not: "COMPLETED" }, dueDate: { lt: new Date() } }
      : {}),
    ...(deadlineStatus === "UPCOMING" ? { dueDate: { gte: new Date() } } : {}),
    ...{ project: { isDeleted: false } },
  };

  const orderBy: any = {};
  if (sortBy === "createdAt") orderBy.createdAt = sortOrder;
  else if (sortBy === "priority") orderBy.priority = sortOrder;
  else orderBy.dueDate = sortOrder;

  const [tasks, total, users] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignees: {
          select: { user: { select: { id: true, name: true } } },
        },
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