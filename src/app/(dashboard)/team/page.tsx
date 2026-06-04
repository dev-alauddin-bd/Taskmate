import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

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
        select: { assignedTasks: true },
      },
      assignedTasks: {
        where: { status: "COMPLETED" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 container mx-auto p-4">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Team Members
        </h1>
        <p className="text-[var(--text-muted)] font-medium mt-1">
          View team workload and task completion status.
        </p>
      </div>

      {/* Search Bar */}
      <form method="GET" className="glass-panel p-4 rounded-xl flex gap-4 items-end shadow-sm">
        <div className="flex-grow">
          <label htmlFor="search" className="label text-xs">Search team members</label>
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Search by name..."
            defaultValue={search}
            className="input py-1.5 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary py-1.5 px-4 text-sm h-[38px]">
            Search
          </button>
          {search && (
            <Link href="/team" className="btn btn-outline py-1.5 px-4 text-sm h-[38px] flex items-center justify-center">
              Reset
            </Link>
          )}
        </div>
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
            accessor: (m) => (
              <span className="text-[var(--text-muted)]">
                {m.email}
              </span>
            ),
          },
          {
            header: "Role",
            accessor: (m) => (
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  m.role === "ADMIN"
                    ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                    : m.role === "PROJECT_MANAGER"
                    ? "bg-[var(--primary-light)] text-[var(--primary)]"
                    : "bg-[var(--success)]/10 text-[var(--success)]"
                }`}
              >
                {m.role}
              </span>
            ),
          },
          {
            header: "Total Tasks",
            accessor: (m) => (
              <span className="font-semibold">
                {m._count.assignedTasks}
              </span>
            ),
          },
          {
            header: "Completed Tasks",
            accessor: (m) => (
              <span className="text-[var(--success)] font-semibold">
                {m.assignedTasks.length}
              </span>
            ),
          },
          {
            header: "Pending Tasks",
            accessor: (m) => {
              const pending =
                m._count.assignedTasks - m.assignedTasks.length;

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