import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* ================= GET SINGLE TASK ================= */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      project: true,
      assignees: {
        include: { user: true },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // ✅ NEW SECURITY CHECK (assignees-based)
  const isAssigned = task.assignees.some(
    (a) => a.userId === session.user.id
  );

  if (!isAssigned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(task);
}

/* ================= UPDATE TASK ================= */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const body = await request.json();

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignees: true,
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // ✅ check permission
  const isAssigned = task.assignees.some(
    (a) => a.userId === session.user.id
  );

  if (!isAssigned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: body.status,
        title: body.title,
        description: body.description,
        dueDate: body.dueDate,
        priority: body.priority,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/* ================= DELETE TASK ================= */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignees: true,
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const isAssigned = task.assignees.some(
    (a) => a.userId === session.user.id
  );

  if (!isAssigned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.task.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}