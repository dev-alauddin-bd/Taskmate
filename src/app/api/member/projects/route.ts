import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ProjectStatus } from "../../../../../generated/prisma/enums";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id, // 🔥 must match schema
        },
      },
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(status && {
        // Cast status string to ProjectStatus enum
        status: status as ProjectStatus,
      }),
    },
    include: {
      manager: true,
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(projects);
}