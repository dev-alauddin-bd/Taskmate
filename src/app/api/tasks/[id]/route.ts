import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { taskUpdateSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = taskUpdateSchema.safeParse(body);

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

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    const { title, description, dueDate, priority, status, assigneeId } =
      parsed.data;

    // Check duplicate title in same project
    if (title && title !== existingTask.title) {
      const duplicate = await prisma.task.findUnique({
        where: {
          title_projectId: {
            title,
            projectId: existingTask.projectId,
          },
        },
      });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { message: "This task already exists in the project." },
          { status: 409 }
        );
      }
    }

    // Check assigning completed task
    const targetStatus = status !== undefined ? status : existingTask.status;
    const isAssigneeChanging = assigneeId !== undefined && assigneeId !== existingTask.assigneeId;
    if (isAssigneeChanging && targetStatus === "COMPLETED") {
      return NextResponse.json(
        { message: "Completed tasks cannot be reassigned." },
        { status: 400 }
      );
    }

    // update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        status,
        assigneeId,
      },
    });

    // =========================
    // ACTIVITY LOG (SAFE + FULL)
    // =========================

    // status change log
    if (status && status !== existingTask.status) {
      await prisma.activityLog.create({
        data: {
          action: "TASK_UPDATED",
          details: `Task "${updatedTask.title}" status changed from ${existingTask.status} to ${status}`,
          userId: session.user.id,
          taskId: updatedTask.id,
        },
      });
    }

    // reassignment log
    if (
      assigneeId !== undefined &&
      assigneeId !== existingTask.assigneeId
    ) {
      await prisma.activityLog.create({
        data: {
          action: "TASK_UPDATED",
          details: `Task "${updatedTask.title}" reassigned`,
          userId: session.user.id,
          taskId: updatedTask.id,
        },
      });
    }

    // general update log (optional but useful)
    await prisma.activityLog.create({
      data: {
        action: "TASK_UPDATED",
        details: `Task "${updatedTask.title}" updated`,
        userId: session.user.id,
        taskId: updatedTask.id,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT TASK ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "PROJECT_MANAGER"
    ) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_DELETED",
        details: `Task "${task.title}" was deleted`,
        userId: session.user.id,
        taskId: task.id,
      },
    });

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}