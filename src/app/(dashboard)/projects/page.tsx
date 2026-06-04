import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import Pagination from "@/components/dashboard/Pagination";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DataTable from "@/components/dashboard/DataTable";
import AddProjectButton from "@/components/dashboard/AddProjectButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects – Teamora Dashboard",
  description: "Manage your team's projects, view status, deadlines, and assign managers in the Teamora dashboard."
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  const pageStr = Array.isArray(searchParams?.page) ? searchParams.page[0] : searchParams.page ?? "1";
  const limitStr = Array.isArray(searchParams?.limit) ? searchParams.limit[0] : searchParams.limit ?? "10";
  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);

  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const status = typeof searchParams?.status === "string" ? searchParams.status : "";
  const sortBy = typeof searchParams?.sortBy === "string" ? searchParams.sortBy : "createdAt";
  const sortOrder = typeof searchParams?.sortOrder === "string" ? searchParams.sortOrder : "desc";

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (status) {
    where.status = status;
  }

  const orderBy: any = {};
  if (sortBy === "deadline") {
    orderBy.deadline = sortOrder;
  } else if (sortBy === "name") {
    orderBy.name = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        manager: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Projects Management – Teamora Dashboard"
        subtitle="Manage all your team projects in one place. Track progress, deadlines, task counts, and assign project managers efficiently."
      >

        <AddProjectButton />

      </DashboardHeader>

      {/* Search & Filter Bar */}
      <form method="GET" className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="label text-xs">Search projects</label>
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Search by name..."
            defaultValue={search}
            className="input py-1.5 text-sm"
          />
        </div>
        <div className="w-48">
          <label htmlFor="status" className="label text-xs">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="input py-1.5 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="w-48">
          <label htmlFor="sortBy" className="label text-xs">Sort By</label>
          <select
            id="sortBy"
            name="sortBy"
            defaultValue={sortBy}
            className="input py-1.5 text-sm"
          >
            <option value="createdAt">Latest Created</option>
            <option value="deadline">Nearest Deadline</option>
            <option value="name">Alphabetical</option>
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
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary py-1.5 px-4 text-sm h-[38px]">
            Apply
          </button>
          {(search || status || sortBy !== "createdAt" || sortOrder !== "desc") && (
            <Link href="/projects" className="btn btn-outline py-1.5 px-4 text-sm h-[38px] flex items-center justify-center">
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* Projects Table */}
      <DataTable
        columns={[
          {
            header: "Project Name", accessor: (p: any) => (
              <div>
                <div className="font-medium text-[var(--foreground)]">{p.name}</div>
                {p.description && (
                  <div className="text-xs text-[var(--text-muted)] mt-1 truncate max-w-xs">{p.description}</div>
                )}
              </div>
            )
          },
          {
            header: "Status", accessor: (p: any) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === "ACTIVE" ? "bg-[var(--primary-light)] text-[var(--primary)]" :
                  p.status === "COMPLETED" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                    "bg-[var(--warning)]/10 text-[var(--warning)]"
                }`}>
                {p.status}
              </span>
            )
          },
          { header: "Deadline", accessor: (p: any) => format(new Date(p.deadline), "MMM d, yyyy") },
          { header: "Manager", accessor: (p: any) => p.manager.name },
          { header: "Tasks", accessor: (p: any) => p._count.tasks },
          {
            header: "Actions", accessor: (p: any) => (
              <Link href={`/projects/${p.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                View Details
              </Link>
            )
          },
        ]}
        data={projects}
      />
      {/* Pagination */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        basePath="/projects"
      />
    </div>
  );
}
