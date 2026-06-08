import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // ================= CLEAN MEMBERS =================
    const members = (body.members ?? [])
      .filter((m: any) => m.userId && m.userId.trim() !== "")
      .map((m: any) => ({
        userId: m.userId,
        role: m.role ?? "MEMBER",
      }));

    // ================= CREATE PROJECT =================
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        deadline: new Date(body.deadline),
        status: body.status ?? "ACTIVE",

        // manager
        manager: {
          connect: { id: session.user.id },
        },

        // ================= MEMBERS =================
        members: {
          create: members.map((m: any) => ({
            user: {
              connect: { id: m.userId },
            },
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
      { message: "Failed to create project" },
      { status: 500 }
    );
  }
}