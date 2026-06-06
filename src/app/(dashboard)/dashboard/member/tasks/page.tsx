import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import DataTable from "@/components/dashboard/DataTable";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";

import Pagination from "@/components/dashboard/Pagination";
import TaskFilterBar from "@/components/dashboard/TaskFilterBar";

export default async function MemberTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "MEMBER") {
    redirect("/dashboard");
  }

  const memberId = session.user.id;

  // page + limit parse
  const pageStr = Array.isArray(sp?.page)
    ? sp.page[0]
    : sp.page ?? "1";

  const limitStr = Array.isArray(sp?.limit)
    ? sp.limit[0]
    : sp.limit ?? "10";

  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);

  const search = typeof sp?.search === "string" ? sp.search : "";
  const status = typeof sp?.status === "string" ? sp.status : "";
  const priority = typeof sp?.priority === "string" ? sp.priority : "";
  const deadlineStatus = typeof sp?.deadlineStatus === "string" ? sp.deadlineStatus : "";
  const sortBy = typeof sp?.sortBy === "string" ? sp.sortBy : "dueDate";
  const sortOrder = typeof sp?.sortOrder === "string" ? sp.sortOrder : "asc";

  const where: any = {
    userId: memberId,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) where.status = status;
  if (priority) where.priority = priority;

  if (deadlineStatus === "OVERDUE") {
    where.status = { not: "COMPLETED" };
    where.dueDate = { lt: new Date() };
  } else if (deadlineStatus === "UPCOMING") {
    where.dueDate = { gte: new Date() };
  }

  // Sorting
  const orderBy: any = {};
  if (sortBy === "createdAt") {
    orderBy.createdAt = sortOrder;
  } else if (sortBy === "priority") {
    orderBy.priority = sortOrder;
  } else {
    orderBy.dueDate = sortOrder;
  }

  // DB query with pagination and filters
  const [tasks, total] = await Promise.all([
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
  ]);

  const isOverdue = (t: any) =>
    new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <DashboardHeader
        title="My Tasks"
        subtitle="Manage and view the status of tasks assigned to you."
      />

      <TaskFilterBar
        search={search}
        status={status}
        priority={priority}
        deadlineStatus={deadlineStatus}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

      {/* TABLE */}
      <DataTable
        data={tasks}
        columns={[
          {
            header: "Task",
            accessor: (t) => (
              <span className="font-medium text-[var(--foreground)]">
                {t.title}
              </span>
            ),
          },
          {
            header: "Project",
            accessor: (t) => (
              <span className="text-[var(--text-muted)]">
                {t.project.name}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: (t) => (
              <span>{t.status.replace("_", " ")}</span>
            ),
          },
          {
            header: "Priority",
            accessor: (t) => (
              <span>{t.priority}</span>
            ),
          },
          {
            header: "Due Date",
            accessor: (t) => (
              <span
                className={
                  isOverdue(t)
                    ? "text-[var(--danger)] font-medium"
                    : "text-[var(--text-muted)]"
                }
              >
                {format(new Date(t.dueDate), "MMM d, yyyy")}
              </span>
            ),
          },
          {
            header: "Actions",
            accessor: (t) => (
              <Link
                href={`/member/tasks/${t.id}`}
                className="text-[var(--primary)] hover:underline text-sm"
              >
                <button className="btn btn-primary btn-sm cursor-pointer">
                  Task Details
                </button>
              </Link>
            ),
          },
        ]}
      />

      {/* PAGINATION */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        basePath="/member/tasks"
      />
    </div>
  );
}
