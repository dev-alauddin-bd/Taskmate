import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

/* -------------------------
   GET SINGLE TASK
--------------------------*/
export async function GET(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        deletedAt: null, // ✅ IMPORTANT FIX
      },
      include: {
        project: true,

        assignees: {
          include: {
            user: true,
          },
        },

        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        attachments: {
          include: {
            uploadedBy: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

/* -------------------------
   UPDATE TASK
--------------------------*/
export async function PUT(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const allowedRoles = ["ADMIN", "PROJECT_MANAGER", "MEMBER"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Fetch existing task
    const existing = await prisma.task.findUnique({
      where: { id },
      include: { assignees: true }
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isManager = session.user.role === "PROJECT_MANAGER";
    const isMember = session.user.role === "MEMBER";

    if (isMember) {
      const isAssigned = existing.assignees.some(a => a.userId === session.user.id);
      if (!isAssigned) {
        return NextResponse.json(
          { message: "Forbidden - You can only update your assigned tasks" },
          { status: 403 }
        );
      }
    }

    // Validation rules
    // 1. Prevent duplicate titles inside the same project
    if (body.title && body.title.toLowerCase() !== existing.title.toLowerCase()) {
      const duplicate = await prisma.task.findFirst({
        where: {
          title: { equals: body.title, mode: 'insensitive' },
          projectId: existing.projectId,
          id: { not: id },
          deletedAt: null,
        }
      });
      if (duplicate) {
        return NextResponse.json(
          { message: "This task already exists in the project." },
          { status: 400 }
        );
      }
    }

    // 2. Prevent past dates as deadlines
    if (body.dueDate) {
      const due = new Date(body.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (due < today) {
        return NextResponse.json(
          { message: "Please select a valid deadline." },
          { status: 400 }
        );
      }
    }

    // 3. Prevent assigning completed tasks / Completed tasks cannot be reassigned
    const incomingUserId = body.userId;
    const currentUserId = existing.assignees[0]?.userId || "";

    if (incomingUserId !== undefined && incomingUserId !== currentUserId) {
      const isCompleted = body.status === "COMPLETED" || existing.status === "COMPLETED";
      if (isCompleted) {
        return NextResponse.json(
          { message: "Completed tasks cannot be reassigned." },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (isAdmin || isManager) {
      if (body.title) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.dueDate) updateData.dueDate = new Date(body.dueDate);
      if (body.priority) updateData.priority = body.priority;
      if (body.status) updateData.status = body.status;
    } else {
      // Member can ONLY update status
      if (body.status) updateData.status = body.status;
    }

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: updateData,
    });

    // Update assignees
    if ((isAdmin || isManager) && incomingUserId !== undefined && incomingUserId !== currentUserId) {
      await prisma.taskAssignee.deleteMany({
        where: { taskId: id }
      });
      if (incomingUserId) {
        await prisma.taskAssignee.create({
          data: {
            taskId: id,
            userId: incomingUserId
          }
        });
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { message: "Failed to update task" },
      { status: 500 }
    );
  }
}

/* -------------------------
   SOFT DELETE TASK
--------------------------*/
export async function DELETE(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(), // ✅ soft delete
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete task" },
      { status: 500 }
    );
  }
}