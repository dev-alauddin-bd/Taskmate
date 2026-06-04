import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }

    // Role-based filtering
    // ADMIN sees all projects
    // PM sees projects they manage
    // MEMBER sees projects where they have tasks assigned? Or maybe everyone sees all projects but can't edit.
    // Let's assume everyone can view projects, but we'll include task counts.

    const projects = await prisma.project.findMany({
      where,
      include: {
        manager: {
          select: { name: true, email: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET Projects Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "PM") {
      return NextResponse.json({ message: "Forbidden: Not enough permissions" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = projectSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { name, description, deadline, status } = validatedData.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: new Date(deadline),
        status,
        managerId: session.user.id,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: "PROJECT_CREATED",
        details: `Project "${project.name}" was created.`,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST Project Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
