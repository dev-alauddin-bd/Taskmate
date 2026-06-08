import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { redirect } from "next/navigation";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const search = typeof sp?.search === "string" ? sp.search : "";

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
          task: { status: "COMPLETED" }
        }
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 container mx-auto">
      {/* HEADER */}
      <DashboardHeader
        title="Admin Members Directory"
        subtitle="View and manage all registered team members in the system."
      />

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
            <Link href="/admin/members" className="btn btn-outline py-1.5 px-4 text-sm h-[38px] flex items-center justify-center">
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
                className={`px-2 py-1 rounded-md text-xs font-medium ${m.role === "ADMIN"
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
                {m._count.tasks}
              </span>
            ),
          },
          {
            header: "Completed Tasks",
            accessor: (m) => (
              <span className="text-[var(--success)] font-semibold">
                {m.tasks?.length ?? 0}
              </span>
            ),
          },
          {
            header: "Pending Tasks",
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
