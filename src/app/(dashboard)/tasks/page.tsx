import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import DataTable from "@/components/dashboard/DataTable";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import Pagination from "@/components/dashboard/Pagination";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // page + limit parse
  const pageStr = Array.isArray(searchParams?.page)
    ? searchParams.page[0]
    : searchParams.page ?? "1";

  const limitStr = Array.isArray(searchParams?.limit)
    ? searchParams.limit[0]
    : searchParams.limit ?? "10";

  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);

  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const status = typeof searchParams?.status === "string" ? searchParams.status : "";
  const priority = typeof searchParams?.priority === "string" ? searchParams.priority : "";
  const assigneeId = typeof searchParams?.assigneeId === "string" ? searchParams.assigneeId : "";
  const deadlineStatus = typeof searchParams?.deadlineStatus === "string" ? searchParams.deadlineStatus : "";
  const sortBy = typeof searchParams?.sortBy === "string" ? searchParams.sortBy : "dueDate";
  const sortOrder = typeof searchParams?.sortOrder === "string" ? searchParams.sortOrder : "asc";

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigneeId) where.assigneeId = assigneeId;

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
  const [tasks, total, users] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
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

  const isOverdue = (t: any) =>
    new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <DashboardHeader
        title="Tasks Management – Teamora Dashboard"
        subtitle="Track tasks, deadlines, priorities and assignments across all projects."
      />

      {/* Search & Filter Bar */}
      <form method="GET" className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="label text-xs">Search tasks</label>
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Title or description..."
            defaultValue={search}
            className="input py-1.5 text-sm"
          />
        </div>
        <div className="w-40">
          <label htmlFor="status" className="label text-xs">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="input py-1.5 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="w-40">
          <label htmlFor="priority" className="label text-xs">Priority</label>
          <select
            id="priority"
            name="priority"
            defaultValue={priority}
            className="input py-1.5 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="w-44">
          <label htmlFor="assigneeId" className="label text-xs">Assignee</label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={assigneeId}
            className="input py-1.5 text-sm"
          >
            <option value="">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label htmlFor="deadlineStatus" className="label text-xs">Deadline</label>
          <select
            id="deadlineStatus"
            name="deadlineStatus"
            defaultValue={deadlineStatus}
            className="input py-1.5 text-sm"
          >
            <option value="">All Deadlines</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
        <div className="w-44">
          <label htmlFor="sortBy" className="label text-xs">Sort By</label>
          <select
            id="sortBy"
            name="sortBy"
            defaultValue={sortBy}
            className="input py-1.5 text-sm"
          >
            <option value="dueDate">Due Date</option>
            <option value="createdAt">Latest Created</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div className="w-32">
          <label htmlFor="sortOrder" className="label text-xs">Order</label>
          <select
            id="sortOrder"
            name="sortOrder"
            defaultValue={sortOrder}
            className="input py-1.5 text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary py-1.5 px-4 text-sm h-[38px]">
            Apply
          </button>
          {(search || status || priority || assigneeId || deadlineStatus || sortBy !== "dueDate" || sortOrder !== "asc") && (
            <Link href="/tasks" className="btn btn-outline py-1.5 px-4 text-sm h-[38px] flex items-center justify-center">
              Reset
            </Link>
          )}
        </div>
      </form>

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
            header: "Assignee",
            accessor: (t) => (
              <span>
                {t.assignee?.name || "Unassigned"}
              </span>
            ),
          },
          {
            header: "Actions",
            accessor: (t) => (
              <Link
                href={`/projects/${t.projectId}`}
                className="text-[var(--primary)] hover:underline text-sm"
              >
                Go to Project
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
        basePath="/tasks"
      />
    </div>
  );
}