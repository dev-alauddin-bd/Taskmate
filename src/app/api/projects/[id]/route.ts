import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Role } from "../../../../../generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "../../../../../generated/prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};

    // ================= BASIC FIELDS =================
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.deadline !== undefined) {
      updateData.deadline = new Date(body.deadline);
    }

    // ================= UPDATE PROJECT =================
    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // ================= MEMBERS PATCH =================
    if (body.members) {
      const members: { userId: string; role: Role }[] =
        body.members.filter((m: any) => m.userId);

      const existing = await prisma.projectMember.findMany({
        where: { projectId: id },
      });

      const existingIds = existing.map((m) => m.userId);
      const newIds = members.map((m) => m.userId);

      const toRemove = existingIds.filter((uid) => !newIds.includes(uid));
      const toAdd = members.filter((m) => !existingIds.includes(m.userId));

      // REMOVE
      if (toRemove.length > 0) {
        await prisma.projectMember.deleteMany({
          where: {
            projectId: id,
            userId: { in: toRemove },
          },
        });
      }

      // ADD
      if (toAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: toAdd.map((m) => ({
            projectId: id,
            userId: m.userId,
            role: m.role ?? Role.MEMBER,
          })),
        });
      }

      // UPDATE ROLE
      for (const m of members) {
        if (existingIds.includes(m.userId)) {
          await prisma.projectMember.updateMany({
            where: {
              projectId: id,
              userId: m.userId,
            },
            data: {
              role: m.role ?? Role.MEMBER,
            },
          });
        }
      }
    }

    // ================= 🔥 ACTIVITY LOG (IMPORTANT FIX) =================
    if (session?.user?.id) {
      await prisma.activityLog.create({
        data: {
          action: "PROJECT_UPDATED",
          userId: session.user.id,
          projectId: id,
          details: {
            updatedFields: Object.keys(updateData),
            membersChanged: !!body.members,
          },
        },
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("PATCH PROJECT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to patch project" },
      { status: 500 }
    );
  }
}

// Updated DELETE with role verification
export async function DELETE(req: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    // Verify permission: ADMIN can delete any, MANAGER only their own project
    const isAdmin = session.user.role === "ADMIN";
    let project
    if (isAdmin) {
      project = await prisma.project.update({
        where: { id },
        data: { isDeleted: true },
      });
    } else {
      await prisma.project.update({
        where: { id, managerId: session.user.id },
        data: { isDeleted: true },
      });
    }

    // ACTIVITY LOG
    await prisma.activityLog.create({
      data: {
        action: "PROJECT_DELETED",
        userId: session.user.id,
        projectId: id,
        details: { deleted: true },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    // Check for Prisma known request error (e.g., missing record)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Not found or insufficient permissions" }, { status: 403 });
    }
    return NextResponse.json({ message: "Failed to delete project" }, { status: 500 });
  }
}