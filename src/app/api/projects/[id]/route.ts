import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } }
          },
          orderBy: { dueDate: "asc" }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET Project Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "PM") {
      return NextResponse.json({ message: "Forbidden: Not enough permissions" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = projectSchema.partial().safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validatedData.error.issues },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const { name, description, deadline, status } = validatedData.data;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(status && { status }),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "PROJECT_UPDATED",
        details: `Project "${updatedProject.name}" was updated.`,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("PUT Project Error:", error);
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
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "PROJECT_DELETED",
        details: `Project "${project.name}" was deleted.`,
      },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("DELETE Project Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
