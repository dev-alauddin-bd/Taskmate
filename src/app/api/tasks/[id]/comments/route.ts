import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Extract task ID from URL parameters
  // In the App Router, we can get the route segment via request.nextUrl
  const { pathname } = request.nextUrl;
  // Expected pathname: /api/tasks/<taskId>/comments
  const match = pathname.match(/\/api\/tasks\/(.+?)\/comments/);
  const taskId = match ? match[1] : null;
  if (!taskId) {
    return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
  }

  // Parse request body
  let body: { content?: string };
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const { content } = body;
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ message: "Content is required" }, { status: 400 });
  }

  try {
    // Ensure task exists and is not soft‑deleted
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      select: { id: true },
    });
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        task: { connect: { id: taskId } },
        user: { connect: { id: session.user.id } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ message: "Failed to create comment" }, { status: 500 });
  }
}



