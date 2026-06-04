import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);

  const teamMembers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: { assignedTasks: true }
      },
      assignedTasks: {
        where: { status: "COMPLETED" }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Team Members
        </h1>
        <p className="text-[var(--text-muted)]">
          View team workload and task completion status.
        </p>
      </div>

      <div className="glass-panel rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Name</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Email</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Role</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Total Tasks</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Completed Tasks</th>
                <th className="p-4 text-sm font-semibold text-[var(--foreground)]">Pending Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {teamMembers.map((member) => {
                const totalTasks = member._count.assignedTasks;
                const completedTasks = member.assignedTasks.length;
                const pendingTasks = totalTasks - completedTasks;

                return (
                  <tr key={member.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="p-4 font-medium text-[var(--foreground)]">
                      {member.name}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">
                      {member.email}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        member.role === "ADMIN" ? "bg-[var(--danger)]/10 text-[var(--danger)]" :
                        member.role === "PROJECT_MANAGER" ? "bg-[var(--primary-light)] text-[var(--primary)]" :
                        "bg-[var(--success)]/10 text-[var(--success)]"
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--foreground)] font-semibold">
                      {totalTasks}
                    </td>
                    <td className="p-4 text-sm text-[var(--success)] font-semibold">
                      {completedTasks}
                    </td>
                    <td className="p-4 text-sm text-[var(--warning)] font-semibold">
                      {pendingTasks}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
