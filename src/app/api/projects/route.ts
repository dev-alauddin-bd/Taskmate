import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      where.status = status;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("GET Projects Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIXED ROLE CHECK (NO HARD CODE BUG)
    const role = session.user.role;

    if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validated = projectSchema.safeParse(body);

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

    const { name, description, deadline, status } = validated.data;

    // ✅ CREATE PROJECT
    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: new Date(deadline),
        status,
        managerId: session.user.id,
      },
    });

    // ✅ ADD AS PROJECT MEMBER (MANAGER ROLE)
    await prisma.projectMember.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        role: "PROJECT_MANAGER",
      },
    });

    // ✅ ACTIVITY LOG (FULL FIXED)
    await prisma.activityLog.create({
      data: {
        action: "PROJECT_CREATED",
        details: `Project "${project.name}" created by ${session.user.name}`,
        userId: session.user.id,
        projectId: project.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Project Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}