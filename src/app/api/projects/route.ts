import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "../../../../generated/prisma/enums";

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
    const status = body.status ?? "ACTIVE";

    if (!name) {
      return NextResponse.json({ message: "Project name required" }, { status: 400 });
    }

    if (!deadline) {
      return NextResponse.json({ message: "Deadline required" }, { status: 400 });
    }

    const cleanDeadline = new Date(deadline);

    if (isNaN(cleanDeadline.getTime())) {
      return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    cleanDeadline.setHours(0,0,0,0);

    if (cleanDeadline < today) {
      return NextResponse.json(
        { message: "Past date not allowed" },
        { status: 400 }
      );
    }

    // 🔥 DUPLICATE CHECK FIXED
    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        managerId: session.user.id, // MUST exist in schema
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { message: "Project already exists" },
        { status: 409 }
      );
    }

    // CLEAN MEMBERS
    const members: { userId: string; role: Role }[] = (body.members ?? [])
      .filter((m: any) => m.userId)
      .map((m: any) => ({
        userId: m.userId,
        role: (m.role as Role) ?? Role.MEMBER,
      }));

    // CREATE PROJECT
    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: cleanDeadline,
        status,

        manager: {
          connect: { id: session.user.id },
        },

        members: {
          create: members.map((m) => ({
            user: { connect: { id: m.userId } },
            role: m.role,
          })),
        },
      },
      include: {
        members: true,
        manager: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("PROJECT CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}