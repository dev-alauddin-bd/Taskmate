import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { taskUpdateSchema } from "@/lib/validations";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = taskUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validatedData.error.issues },
        { status: 400 }
      );
    }

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const { title, description, dueDate, priority, status, assigneeId } = validatedData.data;

    // Rule: Prevent assigning completed tasks
    // If the task is ALREADY completed in DB, and they are trying to change assigneeId
    if (existingTask.status === "COMPLETED" && assigneeId !== undefined && assigneeId !== existingTask.assigneeId) {
      return NextResponse.json(
        { message: "Completed tasks cannot be reassigned." },
        { status: 403 }
      );
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        project: { select: { name: true } },
      }
    });

    // Log Activity if status changed or reassigned
    if (status && status !== existingTask.status) {
      await prisma.activityLog.create({
        data: {
          action: "TASK_UPDATED",
          details: `Task "${updatedTask.title}" marked as ${status}.`,
        },
      });
    } else if (assigneeId !== undefined && assigneeId !== existingTask.assigneeId) {
      await prisma.activityLog.create({
        data: {
          action: "TASK_ASSIGNED",
          details: `Task "${updatedTask.title}" was reassigned.`,
        },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT Task Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "PM") {
      return NextResponse.json({ message: "Forbidden: Not enough permissions" }, { status: 403 });
    }

    const { id } = params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "TASK_DELETED",
        details: `Task "${task.title}" was deleted.`,
      },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE Task Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
