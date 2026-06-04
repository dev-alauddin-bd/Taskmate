import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const priority = searchParams.get("priority");
  const status = searchParams.get("status");

  const where: any = {};
  if (priority) where.priority = priority;
  if (status) where.status = status;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { assignee: { select: { name: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({ tasks, total, page, limit });
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, description, dueDate, projectId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        projectId,
        status: "TODO",
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Task creation failed" },
      { status: 500 }
    );
  }
}
