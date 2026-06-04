import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 1. Tasks by priority
    const tasksByPriority = await prisma.task.groupBy({
      by: ["priority"],
      _count: {
        priority: true,
      },
    });

    // 2. Project progress
    const projectProgress = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        progress: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    // 3. Team productivity
    const teamProductivity = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        assignedTasks: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
          },
        },
      },
    });

    const formattedTeam = teamProductivity.map((u) => ({
      id: u.id,
      name: u.name,
      completedTasks: u.assignedTasks.length,
    }));

    // 4. Task status distribution
    const taskStatusDistribution = await prisma.task.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // 5. Upcoming deadlines
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
    });

    // 6. High priority count
    const highPriorityCount = await prisma.task.count({
      where: {
        priority: "HIGH",
      },
    });

    return NextResponse.json({
      tasksByPriority,
      projectProgress,
      teamProductivity: formattedTeam,
      taskStatusDistribution,
      upcomingDeadlines,
      highPriorityCount,
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}