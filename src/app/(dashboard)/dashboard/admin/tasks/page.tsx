// src/app/(dashboard)/admin/tasks/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import Pagination from "@/components/dashboard/Pagination";
import TasksClient from "@/components/dashboard/TasksClient";

export default async function AdminTasksPage({
  searchParams,
}: {
  // Next.js provides searchParams as a Promise in Server Components
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Resolve the promise to safely access its properties
  const sp = await searchParams;

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // ----- Pagination parsing -----
  const pageStr = Array.isArray(sp?.page) ? sp.page[0] : sp.page ?? "1";
  const limitStr = Array.isArray(sp?.limit) ? sp.limit[0] : sp.limit ?? "10";
  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);

  // ----- Filter values -----
  const search = typeof sp?.search === "string" ? sp.search : "";
  const status = typeof sp?.status === "string" ? sp.status : "";
  const priority = typeof sp?.priority === "string" ? sp.priority : "";
  const assigneeId = typeof sp?.assigneeId === "string" ? sp.assigneeId : "";
  const deadlineStatus = typeof sp?.deadlineStatus === "string" ? sp.deadlineStatus : "";
  const sortBy = typeof sp?.sortBy === "string" ? sp.sortBy : "dueDate";
  const sortOrder = typeof sp?.sortOrder === "string" ? sp.sortOrder : "asc";

  // ----- Build Prisma query -----
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
  } else if (deadlineStatus === "UPCOMING") {
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
        assignees: { select: { user: { select: { name: true } } } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const isOverdue = (t: any) => new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Admin Tasks Management"
        subtitle="Manage and track all tasks across all projects globally."
      />

      {/* Search & Filter Bar */}
      <form method="GET" className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="label text-xs">Search tasks</label>
          <input id="search" name="search" type="text" placeholder="Title or description..." defaultValue={search} className="input py-1.5 text-sm" />
        </div>
        {/* other filter selects (status, priority, assignee, deadline, sort) can be added here – omitted for brevity */}
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary py-1.5 px-4 text-sm h-[38px]">Apply</button>
          {(search || status || priority || assigneeId || deadlineStatus || sortBy !== "dueDate" || sortOrder !== "asc") && (
            <Link href="/admin/tasks" className="btn btn-outline py-1.5 px-4 text-sm h-[38px] flex items-center justify-center">Reset</Link>
          )}
        </div>
      </form>

      {/* Table – delegated to a client component for interactive UI */}
      <TasksClient tasks={tasks} users={users} />

      {/* Pagination */}
      <Pagination page={page} limit={limit} total={total} basePath="/admin/tasks" />
    </div>
  );
}
