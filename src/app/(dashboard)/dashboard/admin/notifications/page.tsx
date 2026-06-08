import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Bell, Check, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Admin Notifications"
        subtitle="Manage your system updates, task assignments, and activity notifications."
      />

      <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)] font-sans">Recent Notifications</h2>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-40 animate-pulse" />
            <p className="text-[var(--text-muted)]">All caught up! No notifications for you.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`py-4 flex gap-4 items-start transition-colors duration-200 ${
                  !notif.isRead ? "bg-[var(--primary-light)]/20 px-3 -mx-3 rounded-lg" : ""
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${!notif.isRead ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "bg-[var(--surface-hover)] text-[var(--text-muted)]"}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--foreground)]">{notif.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
