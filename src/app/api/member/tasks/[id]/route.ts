import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/member/tasks/:id
 * Returns a single task belonging to the authenticated user.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  const task = await prisma.task.findUnique({
    where: { id },
    include: { user: true, project: true },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Ensure the task belongs to the logged‑in member (optional security check)
  if (task.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(task);
}

/**
 * PUT /api/member/tasks/:id
 * Update task fields – typically used for status changes.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  const body = await request.json();
  const { status, ...rest } = body;

  try {
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...rest,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

/**
 * DELETE /api/member/tasks/:id
 * Remove the task. Only the owner can delete.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  // Verify ownership before deletion
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (task.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
