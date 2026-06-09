import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiCard from "@/components/shared/KpiCard";
import DataTable from "@/components/dashboard/DataTable";

import {
  Users,
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const search = typeof searchParams?.search === "string" ? searchParams.search : "";


  const where: any = {};
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const teamMembers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: { tasks: true },
      },
      tasks: {
        where: {
          task: { status: "COMPLETED" },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  /* ================= ROLE BADGE ================= */
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "PROJECT_MANAGER":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "MEMBER":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const RoleBadge = ({ role }: { role: string }) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(
        role
      )}`}
    >
      {role.replace("_", " ")}
    </span>
  );

  /* ================= STATS ================= */
  const totalMembers = teamMembers.length;



  const activeMembers = teamMembers.filter(
    (m) => m._count.tasks > 0
  ).length;

  const idleMembers = teamMembers.filter(
    (m) => m._count.tasks === 0
  ).length;


  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER */}
      <DashboardHeader
        title="Admin Members Overview"
        subtitle="Monitor team performance and activity"
      />

      {/* KPI SECTION (FULL ANALYTICS) */}
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

        <KpiCard
          title="Total Members"
          value={totalMembers}
          icon={<Users size={20} />}
          color="var(--primary)"
        />


        <KpiCard
          title="Active Members"
          value={activeMembers}
          icon={<Users size={20} />}
          color="var(--success)"
        />

        <KpiCard
          title="Idle Members"
          value={idleMembers}
          icon={<Clock3 size={20} />}
          color="var(--warning)"
        />




      </div>



      {/* SEARCH */}
      <form
        method="GET"
        className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-end shadow-sm"
      >
        <div className="flex-grow">
          <label className="text-xs text-[var(--text-muted)]">
            Search members
          </label>

          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name..."
            className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* TABLE */}
      <DataTable
        data={teamMembers}
        columns={[
          {
            header: "Name",
            accessor: (m) => (
              <span className="font-medium text-[var(--foreground)]">
                {m.name}
              </span>
            ),
          },
          {
            header: "Email",
            className: "min-w-[120px]",
            accessor: (m) => (
              <span className="text-[var(--text-muted)]">
                {m.email}
              </span>
            ),
          },
          {
            header: "Role",
            className: "whitespace-nowrap",
            accessor: (m) => <RoleBadge role={m.role} />,
          },
          {
            header: "Total Tasks",
            className: "whitespace-nowrap",
            accessor: (m) => (
              <span className="font-semibold">
                {m._count.tasks}
              </span>
            ),
          },
          {
            header: "Completed",
            className: "whitespace-nowrap",
            accessor: (m) => (
              <span className="text-[var(--success)] font-semibold">
                {m.tasks?.length ?? 0}
              </span>
            ),
          },
          {
            header: "Pending",
            className: "whitespace-nowrap",
            accessor: (m) => {
              const pending =
                m._count.tasks - (m.tasks?.length ?? 0);

              return (
                <span className="text-[var(--warning)] font-semibold">
                  {pending}
                </span>
              );
            },
          },
        ]}
      />
    </div>
  );
}