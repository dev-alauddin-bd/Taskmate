import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TaskStatus } from '../../../../generated/prisma/enums';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, dueDate, priority, status, projectId, userId } = body;
  
    // 1. Prevent duplicate task titles inside the same project
    const duplicate = await prisma.task.findFirst({
      where: {
        title: { equals: title, mode: 'insensitive' },
        projectId,
        deletedAt: null,
      }
    });
    if (duplicate) {
      return NextResponse.json(
        { message: "This task already exists in the project." },
        { status: 400 }
      );
    }

    // 2. Prevent setting past dates as deadlines
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (due < today) {
      return NextResponse.json(
        { message: "Please select a valid deadline." },
        { status: 400 }
      );
    }

    // 3. Prevent assigning completed tasks
    if (status === "COMPLETED" && userId) {
      return NextResponse.json(
        { message: "Completed tasks cannot be reassigned." },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || "MEDIUM",
        status: Object.values(TaskStatus).includes(status) ? status : TaskStatus.TODO,
        projectId,
        assignees: userId ? { create: [{ userId }] } : undefined,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
  }
}



export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        project: true,
        assignees: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
