import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  req: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        description: body.description,
        deadline: new Date(body.deadline),
        status: body.status,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update project" },
      { status: 500 }
    );
  }
}


// soft delete
export async function DELETE(
  req: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        isDeleted: true
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete project" },
      { status: 500 }
    );
  }
}
