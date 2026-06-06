import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatDistanceToNow } from "date-fns";
import { Activity, User, Briefcase, CheckSquare } from "lucide-react";

export default async function AdminActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { name: true } },
      task: { select: { title: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <DashboardHeader
        title="System Activity Logs"
        subtitle="Recent audit trail of task updates, project creations, and member assignments."
      />

      <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
          <Activity className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">Audit Trail (Last 50 actions)</h2>
        </div>

        {logs.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-muted)]">No recent system activity recorded.</p>
        ) : (
          <div className="relative border-l border-[var(--border)] ml-3 pl-6 space-y-6">
            {logs.map((log) => {
              let iconColor = "text-blue-500 bg-blue-500/10";
              if (log.action.includes("DELETE")) {
                iconColor = "text-red-500 bg-red-500/10";
              } else if (log.action.includes("COMPLETED")) {
                iconColor = "text-green-500 bg-green-500/10";
              } else if (log.action.includes("UPDATE")) {
                iconColor = "text-yellow-500 bg-yellow-500/10";
              }

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline bullet */}
                  <span className={`absolute -left-[35px] top-1.5 flex h-6 h-6 w-6 items-center justify-center rounded-full ring-4 ring-[var(--surface)] ${iconColor}`}>
                    <Activity className="w-3.5 h-3.5" />
                  </span>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-[var(--foreground)] capitalize">
                        {log.action.replace(/_/g, " ").toLowerCase()}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-mono shrink-0">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{log.details}</p>

                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-[var(--text-muted)] border-t border-[var(--border)]/30 pt-2">
                      {log.user && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[var(--primary)]" />
                          {log.user.name}
                        </span>
                      )}
                      {log.project && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-indigo-500" />
                          Project: {log.project.name}
                        </span>
                      )}
                      {log.task && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-green-500" />
                          Task: {log.task.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
