import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  const tasks = await prisma.task.findMany({
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            All Tasks
          </h1>
          <p className="text-[var(--text-muted)]">
            Manage and track all tasks across projects.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Task</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Project</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Priority</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Due Date</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Assignee</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
                  
                  return (
                    <tr key={task.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-[var(--foreground)]">{task.title}</div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-muted)]">
                        {task.project.name}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          task.status === "TODO" ? "bg-[var(--surface-hover)] text-[var(--foreground)]" :
                          task.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-500" :
                          "bg-[var(--success)]/10 text-[var(--success)]"
                        }`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          task.priority === "HIGH" ? "bg-[var(--danger)]/10 text-[var(--danger)]" :
                          task.priority === "MEDIUM" ? "bg-[var(--warning)]/10 text-[var(--warning)]" :
                          "bg-[var(--primary-light)] text-[var(--primary)]"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={isOverdue ? "text-[var(--danger)] font-medium" : "text-[var(--text-muted)]"}>
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--foreground)]">
                        {task.assignee?.name || <span className="text-[var(--text-muted)] italic">Unassigned</span>}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/projects/${task.projectId}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                          Go to Project
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
