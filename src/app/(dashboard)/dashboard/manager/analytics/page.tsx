import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import TasksByPriorityChart from "@/components/dashboard/TasksByPriorityChart";
import TeamProductivityChart from "@/components/dashboard/TeamProductivityChart";
import ActivityChart from "@/components/dashboard/ActivityChart";

export default async function ManagerAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if (session.user.role !== "PROJECT_MANAGER") redirect("/dashboard");

 
  // ================= ADMIN SCOPE =================
  const taskWhere = {}; // admin sees all



  const activityWhere = {};

  // ================= TASK STATUS =================
  const tasksByStatus = await prisma.task.groupBy({
    by: ["status"],
    where: taskWhere,
    _count: { _all: true },
  });

  // ================= TASK PRIORITY =================
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    where: taskWhere,
    _count: { _all: true },
  });

  // ================= TEAM PRODUCTIVITY =================
  const usersWithCompletedTasks = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "PROJECT_MANAGER", "MEMBER"] },
    },
    select: {
      name: true,
      _count: {
        select: {
          tasks: {
            where: {
              task: { status: "COMPLETED" }
            }
          }
        }
      }
    },
    take: 10,
  });

  const teamProductivity = usersWithCompletedTasks.map((u) => ({
    name: u.name || "Unknown",
    completedTasks: u._count.tasks,
  }));

  // ================= ACTIVITY =================
  const activityActions = await prisma.activityLog.groupBy({
    by: ["action"],
    where: activityWhere,
    _count: { _all: true },
  });

  const activityDistribution = activityActions.map((a) => ({
    action: a.action,
    count: a._count._all,
  }));

  return (
    <div className="space-y-6">

      <DashboardHeader
        title="Admin Analytics & Insights"
        subtitle="System-wide analytics overview"
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