// src/app/(dashboard)/dashboard/manager/tasks/page.tsx

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import Pagination from "@/components/dashboard/Pagination";
import TasksClient from "@/components/dashboard/TasksClient";
/* ================= KPI ICONS ================= */
import { ListTodo, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/shared/KpiCard";
import { TaskStatus } from "../../../../../../generated/prisma/enums";
import { Prisma } from "../../../../../../generated/prisma/client";


export default async function MemberTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (!["MEMBER"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const page = Number(sp.page ?? 1);
  const limit = Number(sp.limit ?? 10);

  const search = typeof sp.search === "string" ? sp.search : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const priority = typeof sp.priority === "string" ? sp.priority : "";
  const assigneeId = typeof sp.assigneeId === "string" ? sp.assigneeId : "";
  const deadlineStatus =
    typeof sp.deadlineStatus === "string" ? sp.deadlineStatus : "";
  const sortBy = typeof sp.sortBy === "string" ? sp.sortBy : "dueDate";
  const sortOrder = typeof sp.sortOrder === "string" ? sp.sortOrder : "asc";

  /* ================= WHERE (FIXED) ================= */
 const where: any = {
  isDeleted: false,
  assignees: {
    some: {
      userId: session.user.id, 
    },
  },
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
  } else if (deadlineStatus === "UPCOMING") {
    where.dueDate = { gte: new Date() };
  }

  /* ================= ORDER ================= */
  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [sortBy]: sortOrder as Prisma.SortOrder,
  };

  /* ================= DATA ================= */
  const [tasks, total] = await Promise.all([
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


  ]);

  /* ================= KPI DATA ================= */
  const [totalTasks, completed, pending, overdue] = await Promise.all([
    prisma.task.count({ where: { isDeleted: false, assignees: { some: { userId: session.user.id } } } }),
    prisma.task.count({
      where: { isDeleted: false, status: "COMPLETED" as TaskStatus, assignees: { some: { userId: session.user.id } } },
    }),
    prisma.task.count({
      where: { isDeleted: false, status: { not: "COMPLETED" as TaskStatus }, assignees: { some: { userId: session.user.id } } },
    }),
    prisma.task.count({
      where: {
        isDeleted: false,
        dueDate: { lt: new Date() },
        status: { not: "COMPLETED" as TaskStatus },
        assignees: { some: { userId: session.user.id } },
      },
    }),
  ]);




  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Member Tasks"
        subtitle="View and manage your assigned tasks."
      />

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <KpiCard
          title="Total"
          value={totalTasks}
          icon={<ListTodo size={20} />}
          color="var(--primary)"
        />

        <KpiCard
          title="Completed"
          value={completed}
          icon={<CheckCircle size={20} />}
          color="#22c55e"
        />

        <KpiCard
          title="Pending"
          value={pending}
          icon={<Clock size={20} />}
          color="#f59e0b"
        />

        <KpiCard
          title="Overdue"
          value={overdue}
          icon={<AlertTriangle size={20} />}
          color="#ef4444"
        />

      </div>



      {/* ================= SEARCH ================= */}
      <form className="glass-panel p-4 rounded-xl flex gap-4">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search tasks..."
          className="input flex-1"
        />

        {/* <button className="btn btn-primary">Apply</button> */}

        <Link href="/dashboard/member/tasks" className="btn btn-outline">
          Reset
        </Link>
      </form>

      {/* ================= TASK TABLE ================= */}
      <TasksClient tasks={tasks} />

      {/* ================= PAGINATION ================= */}
      <Suspense fallback={null}>
        <Pagination
          page={page}
          limit={limit}
          total={total}
          basePath="/dashboard/member/tasks"
        />
      </Suspense>
    </div>
  );
}