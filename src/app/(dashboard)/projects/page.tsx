import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  const projects = await prisma.project.findMany({
    include: {
      manager: { select: { name: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Projects
          </h1>
          <p className="text-[var(--text-muted)]">
            Manage your team's projects.
          </p>
        </div>
        
        {session?.user?.role !== "MEMBER" && (
          <Link href="/projects/new" className="btn btn-primary">
            + New Project
          </Link>
        )}
      </div>

      <div className="glass-panel rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Project Name</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Deadline</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Manager</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Tasks</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No projects found. Create one to get started.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[var(--foreground)]">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-[var(--text-muted)] mt-1 truncate max-w-xs">
                          {project.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        project.status === "ACTIVE" ? "bg-[var(--primary-light)] text-[var(--primary)]" :
                        project.status === "COMPLETED" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                        "bg-[var(--warning)]/10 text-[var(--warning)]"
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">
                      {format(new Date(project.deadline), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-sm text-[var(--foreground)]">
                      {project.manager.name}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">
                      {project._count.tasks}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/projects/${project.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
