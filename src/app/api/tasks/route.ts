import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { taskSchema } from "@/lib/validations";

// =====================
// GET TASKS (FILTERED)
// =====================
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const projectId = searchParams.get("projectId") || "";
    const assigneeId = searchParams.get("assigneeId") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET TASK ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// =====================
// POST TASK (CREATE)
// =====================
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      const firstErrorMessage = parsed.error.issues[0]?.message || "Invalid data";
      return NextResponse.json(
        {
          message: firstErrorMessage,
          errors: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      dueDate,
      priority,
      status,
      projectId,
      assigneeId,
    } = parsed.data;

    // =========================
    // DUPLICATE TASK CHECK
    // =========================
    const existing = await prisma.task.findUnique({
      where: {
        title_projectId: {
          title,
          projectId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "This task already exists in the project.",
        },
        { status: 409 }
      );
    }

    // =========================
    // CREATE TASK
    // =========================
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority,
        status,
        projectId,
        assigneeId: assigneeId || null,
      },
      include: {
        project: { select: { name: true } },
      },
    });

    // =========================
    // ACTIVITY LOG (FIXED)
    // =========================
    await prisma.activityLog.create({
      data: {
        action: "TASK_CREATED",
        details: `Task "${task.title}" created in project "${task.project.name}"`,
        taskId: task.id,
        projectId: task.projectId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST TASK ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}