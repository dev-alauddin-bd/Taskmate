import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatDistanceToNow } from "date-fns";
import { Activity, User, Briefcase, CheckSquare } from "lucide-react";

export default async function AdminActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const logs = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          role: true,
          avatar: true,
        },
      },
      project: { select: { name: true } },
      task: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // ================= AVATAR FALLBACK =================
  const getAvatar = (user: any) => {
    if (user?.avatar) return user.avatar;

    const name = user?.name || "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&color=fff&bold=true`;
  };

  // ================= DETAILS FORMATTER =================
  const formatDetails = (details: any) => {
    if (!details) return null;

    if (typeof details === "string") return details;

    if (typeof details === "object") {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" • ");
    }

    return String(details);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <DashboardHeader
        title="System Activity Timeline"
        subtitle="Real-time audit trail of all system operations"
      />

      {/* MAIN CARD */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl">

        {/* TOP BAR */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <Activity className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-lg font-semibold">
            Recent System Activity
          </h2>
        </div>

        {/* EMPTY STATE */}
        {logs.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            No system activity found
          </div>
        ) : (
          <div className="relative mt-6 border-l border-[var(--border)] ml-3 pl-6 space-y-8">

            {logs.map((log) => {
              const type =
                log.action.includes("DELETE")
                  ? "danger"
                  : log.action.includes("UPDATE")
                  ? "warning"
                  : log.action.includes("COMPLETED")
                  ? "success"
                  : "info";

              const color =
                type === "danger"
                  ? "text-red-500 bg-red-500/10"
                  : type === "warning"
                  ? "text-yellow-500 bg-yellow-500/10"
                  : type === "success"
                  ? "text-green-500 bg-green-500/10"
                  : "text-blue-500 bg-blue-500/10";

              const details = formatDetails(log.details);

              return (
                <div key={log.id} className="relative group">

                  {/* DOT */}
                  <span
                    className={`absolute -left-[34px] top-1.5 w-6 h-6 flex items-center justify-center rounded-full ring-4 ring-[var(--surface)] ${color}`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                  </span>

                  {/* CARD */}
                  <div className="bg-[var(--surface)]/40 hover:bg-[var(--surface)]/70 transition-all p-4 rounded-xl border border-[var(--border)]">

                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold capitalize">
                        {log.action.replace(/_/g, " ").toLowerCase()}
                      </p>

                      <span className="text-xs text-[var(--text-muted)]">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {/* DETAILS */}
                    {details && (
                      <p className="text-sm text-[var(--text-muted)] mt-2">
                        {details}
                      </p>
                    )}

                    {/* META */}
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border)]/30">

                      {/* USER */}
                      {log.user && (
                        <span className="flex items-center gap-2">

                          {/* AVATAR */}
                          <img
                            src={getAvatar(log.user)}
                            className="w-6 h-6 rounded-full object-cover border border-[var(--border)]"
                          />

                          {/* NAME + ROLE */}
                          <div className="flex flex-col leading-tight">
                            <span className="text-xs font-medium text-[var(--text)]">
                              {log.user.name}
                            </span>

                            <span className="text-[10px] text-[var(--text-muted)] uppercase">
                              {log.user.role}
                            </span>
                          </div>

                        </span>
                      )}

                      {/* PROJECT */}
                      {log.project && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-indigo-500" />
                          {log.project.name}
                        </span>
                      )}

                      {/* TASK */}
                      {log.task && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-green-500" />
                          {log.task.title}
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