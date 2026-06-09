import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role, ActivityAction } from "../../../../generated/prisma/enums";

// ================= GET PROJECTS =================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      session.user.role?.toUpperCase?.() === "ADMIN";

    const projects = await prisma.project.findMany({
      where: {
        isDeleted: false,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { managerId: session.user.id },
                { members: { some: { userId: session.user.id } } },
              ],
            }),
      },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("PROJECT FETCH ERROR:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

// ================= POST PROJECT =================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const name = body.name?.trim();
    const description = body.description;
    const deadline = body.deadline;

    const allowedStatus = ["ACTIVE", "ON_HOLD", "COMPLETED"] as const;

    const status = allowedStatus.includes(body.status)
      ? body.status
      : "ACTIVE";

    // ================= VALIDATION =================
    if (!name) {
      return NextResponse.json(
        { message: "Project name required" },
        { status: 400 }
      );
    }

    if (!deadline) {
      return NextResponse.json(
        { message: "Deadline required" },
        { status: 400 }
      );
    }

    const cleanDeadline = new Date(deadline);
    const normalizedDeadline = new Date(
      cleanDeadline.toDateString()
    );

    if (isNaN(normalizedDeadline.getTime())) {
      return NextResponse.json(
        { message: "Invalid date" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (normalizedDeadline < today) {
      return NextResponse.json(
        { message: "Past date not allowed" },
        { status: 400 }
      );
    }

    // ================= DUPLICATE CHECK =================
    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        managerId: session.user.id,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { message: "Project already exists" },
        { status: 409 }
      );
    }

    // ================= CLEAN MEMBERS =================
    const members: { userId: string; role: Role }[] = (body.members ?? [])
      .filter((m: any) => m.userId)
      .map((m: any) => ({
        userId: m.userId,
        role: (m.role as Role) ?? Role.MEMBER,
      }));

    // ================= TRANSACTION (IMPORTANT FIX) =================
    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name,
          description,
          deadline: normalizedDeadline,
          status,
          managerId: session.user.id,
        },
      });

      if (members.length > 0) {
        await tx.projectMember.createMany({
          data: members.map((m) => ({
            projectId: created.id,
            userId: m.userId,
            role: m.role,
          })),
        });
      }

      await tx.activityLog.create({
        data: {
          action: ActivityAction.PROJECT_CREATED,
          userId: session.user.id,
          projectId: created.id,
          details: {
            name,
            description,
            membersCount: members.length,
            status,
          },
        },
      });

      return created;
    });

    // ================= NOTIFICATIONS =================
    if (members.length > 0) {
      await prisma.notification.createMany({
        data: members.map((m) => ({
          userId: m.userId,
          title: "New Project Assigned",
          message: `You are added to project "${name}"`,
          type: "INFO",
        })),
      });
    }

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Project Created",
        message: `Project "${name}" created successfully`,
        type: "SUCCESS",
      },
    });



    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error("PROJECT CREATE ERROR:", error);

    return NextResponse.json(
      {
        message: "Server error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}