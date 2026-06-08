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

    if (!["ADMIN", "PROJECT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: {
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        priority: body.priority,
        status: body.status,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
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