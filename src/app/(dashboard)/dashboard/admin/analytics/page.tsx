import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import TasksByPriorityChart from "@/components/dashboard/TasksByPriorityChart";
import TeamProductivityChart from "@/components/dashboard/TeamProductivityChart";
import ActivityChart from "@/components/dashboard/ActivityChart";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // 1. Task Status Distribution
  const tasksByStatusRaw = await prisma.task.groupBy({
    by: ["status"],
    _count: {
      _all: true,
    },
  });
  const tasksByStatus = tasksByStatusRaw.map((t) => ({
    status: t.status,
    _count: { _all: t._count._all },
  }));

  // 2. Tasks by Priority
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    _count: {
      _all: true,
    },
  });

  // 3. Team Productivity (completed tasks per member)
  const usersWithCompletedTasks = await prisma.user.findMany({
    select: {
      name: true,
      _count: {
        select: {
          tasks: {
            where: { status: "COMPLETED" },
          },
        },
      },
    },
    take: 10,
  });
  const teamProductivity = usersWithCompletedTasks.map((u) => ({
    name: u.name || "Unknown",
    completedTasks: u._count.tasks,
  }));

  // 4. Activity Logs Action Distribution
  const activityActionsRaw = await prisma.activityLog.groupBy({
    by: ["action"],
    _count: {
      _all: true,
    },
  });
  const activityDistribution = activityActionsRaw.map((a) => ({
    action: a.action,
    count: a._count._all,
  }));

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Admin Analytics & Insights"
        subtitle="Visual analytics on task distribution, system activities, and team productivity."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskStatusChart data={tasksByStatus} />
        <TasksByPriorityChart data={tasksByPriority} />
        <TeamProductivityChart data={teamProductivity} />
        <ActivityChart data={activityDistribution} />
      </div>
    </div>
  );
}
