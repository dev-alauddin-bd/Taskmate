// src/app/(dashboard)/dashboard/manager/tasks/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import TasksPageClient from "@/components/shared/TasksPageClient";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCard from "@/components/shared/KpiCard";

import {
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  User,
} from "lucide-react";

export default async function AdminTasksPage({
  searchParams,
}: {
  // Next.js provides searchParams as a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (!["ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Await the Promise of searchParams per Next.js App Router requirement
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);

  const search =
    typeof params.search === "string" ? params.search : "";
  const status =
    typeof params.status === "string" ? params.status : "";
  const priority =
    typeof params.priority === "string" ? params.priority : "";
  const assigneeId =
    typeof params.assigneeId === "string" ? params.assigneeId : "";
  const deadlineStatus =
    typeof params.deadlineStatus === "string"
      ? params.deadlineStatus
      : "";
  const sortBy =
    typeof params.sortBy === "string"
      ? params.sortBy
      : "dueDate";
  const sortOrder =
    typeof params.sortOrder === "string"
      ? params.sortOrder
      : "asc";

  const where: any = {
    isDeleted: false,
    // Exclude tasks whose parent project is soft‑deleted
    project: { isDeleted: false },
  };

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
        assignees: {
          select: {
            user: { select: { id: true, name: true } },
          },
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

  // ================= KPI CALCULATION =================
  const totalTasks = total;

  const completedTasks = tasks.filter(
    (t) => t.status === "COMPLETED"
  ).length;

  const pendingTasks = tasks.filter(
    (t) => t.status !== "COMPLETED"
  ).length;

  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "COMPLETED" &&
      new Date(t.dueDate) < new Date()
  ).length;

  const uniqueAssignees = new Set(
    tasks.flatMap((t) =>
      t.assignees.map((a) => a.user.id)
    )
  ).size;

  return (
    <div className="space-y-6 animate-fade-in">

     
      {/* KPI ROW (same dashboard style) */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">

        <KpiCard
          title="Tasks"
          value={totalTasks}
          icon={<ListTodo size={20} />}
          color="var(--primary)"
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

        <KpiCard
          title="Active Users"
          value={uniqueAssignees}
          icon={<User size={20} />}
          color="var(--info)"
        />
      </div>

      {/* MAIN TASK LIST */}
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