import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

// ========================
// GET SINGLE PROJECT
// ========================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            dueDate: "asc",
          },
        },
        members: true,
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("GET Project Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ========================
// UPDATE PROJECT
// ========================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = session.user.role;

    if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = projectSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validated.error.issues,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false,
          message: "Project not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(validated.data.name && { name: validated.data.name }),
        ...(validated.data.description !== undefined && {
          description: validated.data.description,
        }),
        ...(validated.data.deadline && {
          deadline: new Date(validated.data.deadline),
        }),
        ...(validated.data.status && {
          status: validated.data.status,
        }),
      },
    });

    // ✅ FIXED ACTIVITY LOG
    await prisma.activityLog.create({
      data: {
        action: "PROJECT_UPDATED",
        details: `Project "${updated.name}" updated by ${session.user.name}`,
        userId: session.user.id,
        projectId: updated.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PUT Project Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ========================
// DELETE PROJECT
// ========================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = session.user.role;

    if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    // ✅ FIXED ACTIVITY LOG
    await prisma.activityLog.create({
      data: {
        action: "PROJECT_DELETED",
        details: `Project "${project.name}" deleted by ${session.user.name}`,
        userId: session.user.id,
        projectId: project.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Project Error:", error);

    return NextResponse.json(
      { success: false,
        message: "Internal server error" },
      { status: 500 }
    );
  }
}