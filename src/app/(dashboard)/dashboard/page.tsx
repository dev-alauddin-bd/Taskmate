import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch KPI data
  const totalProjects = await prisma.project.count();
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({ where: { status: "COMPLETED" } });
  const pendingTasks = await prisma.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } });
  const overdueTasks = await prisma.task.count({
    where: {
      status: { not: "COMPLETED" },
      dueDate: { lt: new Date() },
    },
  });

  // Fetch recent activities
  const recentActivities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-[var(--text-muted)]">
          Welcome back, {session?.user?.name || "User"}. Here's an overview of your projects and tasks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 border-l-4 border-l-[var(--primary)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Total Projects</h3>
          <div className="text-3xl font-bold text-[var(--foreground)]">{totalProjects}</div>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 border-l-4 border-l-blue-500 shadow-sm">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Total Tasks</h3>
          <div className="text-3xl font-bold text-[var(--foreground)]">{totalTasks}</div>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 border-l-4 border-l-[var(--success)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Completed Tasks</h3>
          <div className="text-3xl font-bold text-[var(--foreground)]">{completedTasks}</div>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 border-l-4 border-l-[var(--warning)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Pending Tasks</h3>
          <div className="text-3xl font-bold text-[var(--foreground)]">{pendingTasks}</div>
        </div>
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 border-l-4 border-l-[var(--danger)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--text-muted)]">Overdue Tasks</h3>
          <div className="text-3xl font-bold text-[var(--foreground)]">{overdueTasks}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Activity</h2>
          </div>
          <div className="p-0 flex-1">
            {recentActivities.length > 0 ? (
              <ul className="divide-y divide-[var(--border)]">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-[var(--surface-hover)] transition-colors">
                    <p className="text-sm text-[var(--foreground)] font-medium">
                      {activity.action.replace("_", " ")}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{activity.details}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-[var(--text-muted)]">No recent activity</div>
            )}
          </div>
          <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-hover)]">
            <Link href="/activity" className="text-sm text-[var(--primary)] hover:underline font-medium">
              View all activity &rarr;
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Quick Actions</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <Link href="/projects" className="btn btn-outline flex justify-center w-full">
              Manage Projects
            </Link>
            <Link href="/tasks" className="btn btn-primary flex justify-center w-full">
              View All Tasks
            </Link>
            <Link href="/team" className="btn btn-outline flex justify-center w-full">
              View Team Workload
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
