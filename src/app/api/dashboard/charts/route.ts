import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Tasks by priority
  const tasksByPriority = await prisma.task.groupBy({
    by: ["priority"],
    _count: { _all: true },
  });

  // Project progress (date vs progress)
  const projectProgress = await prisma.project.findMany({
    select: { id: true, name: true, progress: true, updatedAt: true },
    orderBy: { updatedAt: "asc" },
  });

  // Team productivity (completed tasks per member)
  const teamProductivity = await prisma.user.findMany({
    select: {
      name: true,
      _count: { select: { assignedTasks: true } },
      assignedTasks: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
  });

  // Task status distribution
  const taskStatusDistribution = await prisma.task.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  // Upcoming deadlines (next 5 tasks)
  const upcomingDeadlines = await prisma.task.findMany({
    where: { dueDate: { gte: new Date() } },
    select: { id: true, title: true, dueDate: true },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  // High priority tasks count
  const highPriorityCount = await prisma.task.count({
    where: { priority: "HIGH" },
  });

  return NextResponse.json({
    tasksByPriority,
    projectProgress,
    teamProductivity,
    taskStatusDistribution,
    upcomingDeadlines,
    highPriorityCount,
  });
}

